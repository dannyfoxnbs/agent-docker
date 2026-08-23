#!/usr/bin/env python3
"""Open an Azure DevOps pull request for the current branch, optionally from a PBI.

Usage:
    create_pr.py [pbi-id] [options]

The repository is NOT passed in — it is read from the local clone you run this
in (`git remote get-url origin`), exactly the way a PR is inherently tied to one
repo. The source branch defaults to the current branch; the target to dev.

A PBI id is optional. When given, its title becomes the PR title and the PR is
linked back to the work item (an ArtifactLink relation, so the link shows on
both the PR and the ticket). Without one, the title falls back to the last
commit subject.

A templated description is drafted by the separate
write-local-azure-devops-pr-description skill (it fills the repo's
pull_request_template.md, grounded in the diff) into pr-<branch>.md. This script
only publishes a body: --description file, else that pr-<branch>.md if present,
else a one-line PBI link.

Options:
  --target <branch>      target/base branch      (default: dev)
  --source <branch>      source branch           (default: current branch)
  --title  <title>       PR title                (default: PBI title, else last commit subject)
  --description <path|->  body from a file or stdin ('-')   (default: pr-<branch>.md, else PBI link)
  --draft                open as a draft PR
  --push                 push the source branch to origin first
  --no-link              don't link the PBI to the PR

Auth: a Personal Access Token with **Code (Read & Write)** — and, to link a PBI,
**Work Items (Read & Write)** — from $AZURE_DEVOPS_EXT_PAT or
~/.config/azure-devops/pat (chmod 600); override that path with ADO_PAT_FILE.
Override the org with ADO_ORG (default https://thenbs.visualstudio.com/).
"""
import base64
import json
import os
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ORG = os.environ.get("ADO_ORG", "https://thenbs.visualstudio.com/").rstrip("/")
PAT_FILE = Path(os.environ.get(
    "ADO_PAT_FILE", Path.home() / ".config" / "azure-devops" / "pat")).expanduser()
API = "api-version=7.1"


def die(msg):
    sys.exit(f"error: {msg}")


def load_pat():
    pat = (os.environ.get("AZURE_DEVOPS_EXT_PAT")
           or (PAT_FILE.read_text() if PAT_FILE.exists() else "")).strip()
    if not pat:
        die(f"no PAT. Set $AZURE_DEVOPS_EXT_PAT or write one to {PAT_FILE} "
            "(chmod 600). Needs 'Code (Read & Write)' (and 'Work Items (Read & "
            "Write)' to link a PBI).")
    return pat


class ApiError(Exception):
    pass


def request(url, pat, method="GET", body=None, content_type="application/json"):
    token = base64.b64encode(f":{pat}".encode()).decode()
    headers = {"Authorization": f"Basic {token}", "Accept": "application/json"}
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = content_type
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")
        if e.code in (401, 203):
            raise ApiError("PAT rejected — expired or missing a required scope "
                           "('Code (Read & Write)', or 'Work Items (Read & Write)' to link).")
        if e.code == 404:
            raise ApiError("not found — check ids and that the PAT sees this project.")
        # ADO returns a JSON {message: ...} for most 4xx; surface it verbatim.
        try:
            msg = json.loads(detail).get("message", detail)
        except json.JSONDecodeError:
            msg = detail
        raise ApiError(f"HTTP {e.code}: {msg[:400]}")
    except urllib.error.URLError as e:
        raise ApiError(f"network error: {e.reason}")


def git(*args, check=True):
    r = subprocess.run(["git", *args], capture_output=True, text=True)
    if check and r.returncode != 0:
        die(f"git {' '.join(args)} failed: {r.stderr.strip()}")
    return r.stdout.strip()


def parse_remote(url):
    """(project, repo) from an Azure DevOps origin URL, https or ssh."""
    url = url.strip()
    if url.endswith(".git"):
        url = url[:-4]
    unq = urllib.parse.unquote
    if "/_git/" in url:                       # https forms — project is the
        before, after = url.split("/_git/", 1)  # segment right before /_git/
        project = before.rstrip("/").split("/")[-1]
        repo = after.split("/")[0]
        return unq(project), unq(repo)
    if ":v3/" in url:                          # ssh: git@ssh.dev.azure.com:v3/org/project/repo
        parts = url.split(":v3/", 1)[1].strip("/").split("/")
        if len(parts) >= 3:
            return unq(parts[-2]), unq(parts[-1])
    die(f"can't parse an Azure DevOps repo from origin: {url}\n"
        "  run this inside a clone whose 'origin' is the ADO repo.")


def path(*segs):
    """URL path from segments, each percent-encoded (spaces in project names)."""
    return "/".join(urllib.parse.quote(str(s), safe="") for s in segs)


def read_source(arg):
    return sys.stdin.read() if arg == "-" else Path(arg).read_text()


def kebab(s):
    """Match write-local-azure-devops-pr-description's pr-<kebab-branch-name>.md naming."""
    out = "".join(c if c.isalnum() else "-" for c in s.lower())
    while "--" in out:
        out = out.replace("--", "-")
    return out.strip("-")


def resolve_description(opts, source, pbi_title):
    """(body, note). A real templated body is drafted by the separate
    write-local-azure-devops-pr-description skill (it fills the repo's
    pull_request_template.md); this only *publishes* one. Order: an explicit
    --description file, then that skill's pr-<branch>.md if it's sitting in the
    cwd, then a one-line PBI link. note is printed so the source is visible."""
    if opts["description"] is not None:
        return read_source(opts["description"]).strip(), f"from {opts['description']}"
    auto = Path(f"pr-{kebab(source)}.md")
    if auto.exists():
        return auto.read_text().strip(), f"from {auto.name} (write-local-azure-devops-pr-description)"
    if opts["pbi"]:
        line = f"Related work item #{opts['pbi']}" + (f": {pbi_title}" if pbi_title else "")
        return line, None
    return "", None


def parse_args():
    argv = sys.argv[1:]
    opts = {"target": None, "source": None, "title": None, "description": None,
            "draft": False, "push": False, "link": True, "pbi": None}
    i = 0
    while i < len(argv):
        a = argv[i]
        if a in ("--draft", "--push"):
            opts[a[2:]] = True
            i += 1
        elif a == "--no-link":
            opts["link"] = False
            i += 1
        elif a in ("--target", "--source", "--title", "--description"):
            if i + 1 >= len(argv):
                die(f"{a} needs a value.")
            opts[a[2:]] = argv[i + 1]
            i += 2
        elif a.lstrip("#").isdigit() and opts["pbi"] is None:
            opts["pbi"] = a.lstrip("#")
            i += 1
        else:
            die(f"unexpected argument: {a}\n{__doc__.splitlines()[3]}")
    return opts


def main():
    opts = parse_args()
    pat = load_pat()

    if git("rev-parse", "--is-inside-work-tree", check=False) != "true":
        die("not inside a git repo — run this from a clone of the target repo.")

    origin = git("remote", "get-url", "origin", check=False)
    if not origin:
        die("no 'origin' remote — can't tell which ADO repo to open the PR in.")
    project, repo_name = parse_remote(origin)

    source = opts["source"] or git("rev-parse", "--abbrev-ref", "HEAD")
    if source in ("HEAD", ""):
        die("detached HEAD — check out a branch or pass --source <branch>.")

    # Resolve the repo once: gives us the id + project id (for the work-item
    # link artifact uri) and the authoritative default branch.
    try:
        repo = request(f"{ORG}/{path(project)}/_apis/git/repositories/"
                       f"{path(repo_name)}?{API}", pat)
    except ApiError as e:
        die(str(e))
    repo_id = repo.get("id")
    project_id = (repo.get("project") or {}).get("id")
    if not repo_id or not project_id:
        die("could not resolve the repository from origin.")

    target = opts["target"] or "dev"
    if target == source:
        die(f"source and target are both '{source}' — nothing to merge.")

    src_ref, tgt_ref = f"refs/heads/{source}", f"refs/heads/{target}"

    # The source branch must exist on origin or ADO rejects the PR.
    if opts["push"]:
        print(f"pushing {source} -> origin ...")
        git("push", "--set-upstream", "origin", source)
    if not git("ls-remote", "--heads", "origin", source, check=False):
        die(f"branch '{source}' isn't on origin yet — push it first "
            f"(git push -u origin {source}) or re-run with --push.")
    if not git("ls-remote", "--heads", "origin", target, check=False):
        die(f"target branch '{target}' doesn't exist on origin — pass --target <branch>.")

    repos_api = f"{ORG}/{path(project)}/_apis/git/repositories/{repo_id}/pullrequests"

    # Idempotency: if an active PR for this source->target already exists, show it.
    try:
        existing = request(
            f"{repos_api}?searchCriteria.sourceRefName={urllib.parse.quote(src_ref)}"
            f"&searchCriteria.targetRefName={urllib.parse.quote(tgt_ref)}"
            f"&searchCriteria.status=active&{API}", pat)
    except ApiError as e:
        die(str(e))
    if existing.get("value"):
        pr = existing["value"][0]
        print(f"an active PR for {source} → {target} already exists:")
        print(f"  #{pr['pullRequestId']}  {pr.get('title', '')}")
        print(f"{ORG}/{path(project)}/_git/{path(repo_name)}/pullrequest/{pr['pullRequestId']}")
        return

    # Title / description: PBI title, else last commit subject; body links the PBI.
    pbi_title = None
    if opts["pbi"]:
        try:
            wi = request(f"{ORG}/_apis/wit/workitems/{opts['pbi']}"
                         f"?fields=System.Title&{API}", pat)
            pbi_title = (wi.get("fields") or {}).get("System.Title")
        except ApiError as e:
            die(f"reading PBI #{opts['pbi']}: {e}")

    title = opts["title"] or pbi_title or git("log", "-1", "--format=%s")
    description, desc_note = resolve_description(opts, source, pbi_title)

    body = {
        "sourceRefName": src_ref,
        "targetRefName": tgt_ref,
        "title": title,
        "description": description,
        "isDraft": opts["draft"],
    }
    try:
        pr = request(f"{repos_api}?{API}", pat, method="POST", body=body)
    except ApiError as e:
        die(f"creating the PR: {e}")
    pr_id = pr.get("pullRequestId")

    kind = "draft PR" if opts["draft"] else "PR"
    print(f"created {kind} #{pr_id}: {source} → {target}")
    print(f"  {title}")
    if desc_note:
        print(f"  description {desc_note}")

    # Link the PBI: an ArtifactLink relation on the work item pointing at the PR.
    if opts["pbi"] and opts["link"]:
        artifact = ("vstfs:///Git/PullRequestId/"
                    f"{project_id}%2F{repo_id}%2F{pr_id}")
        patch = [{
            "op": "add",
            "path": "/relations/-",
            "value": {"rel": "ArtifactLink", "url": artifact,
                      "attributes": {"name": "Pull Request"}},
        }]
        try:
            request(f"{ORG}/_apis/wit/workitems/{opts['pbi']}?{API}", pat,
                    method="PATCH", body=patch,
                    content_type="application/json-patch+json")
            print(f"  linked PBI #{opts['pbi']}")
        except ApiError as e:
            print(f"  WARNING: PR created but linking PBI #{opts['pbi']} failed: {e}")

    print(f"{ORG}/{path(project)}/_git/{path(repo_name)}/pullrequest/{pr_id}")


if __name__ == "__main__":
    main()
