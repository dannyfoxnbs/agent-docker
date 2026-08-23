#!/usr/bin/env python3
"""Set the description of an existing Azure DevOps pull request.

Usage:
    set_description.py <pr-id> [--description <path|->]

Replaces the PR's description field with the given body. The body is drafted by
the separate write-local-azure-devops-pr-description skill (it fills the repo's
pull_request_template.md, grounded in the diff) into pr-<branch>.md; this script
just publishes it onto the real PR. Body source, in order:

  1. --description <path|->   an explicit file, or '-' for stdin
  2. pr-<branch>.md           the local draft in the cwd, for the current branch
  (with neither, it stops — there is nothing to set)

The PR id is org-unique, so the repository and project are resolved from it (no
need to run inside the clone unless you rely on the pr-<branch>.md auto-pickup).

Auth: a Personal Access Token with **Code (Read & Write)** from
$AZURE_DEVOPS_EXT_PAT or ~/.config/azure-devops/pat (chmod 600); override that
path with ADO_PAT_FILE. Override the org with ADO_ORG.
"""
import base64
import json
import os
import subprocess
import sys
import urllib.error
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
            "(chmod 600). Needs the 'Code (Read & Write)' scope.")
    return pat


class ApiError(Exception):
    pass


def request(url, pat, method="GET", body=None):
    token = base64.b64encode(f":{pat}".encode()).decode()
    headers = {"Authorization": f"Basic {token}", "Accept": "application/json"}
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")
        if e.code in (401, 203):
            raise ApiError("PAT rejected — expired or missing 'Code (Read & Write)'.")
        if e.code == 404:
            raise ApiError("not found — check the PR id / that the PAT sees this project.")
        try:
            msg = json.loads(detail).get("message", detail)
        except json.JSONDecodeError:
            msg = detail
        raise ApiError(f"HTTP {e.code}: {msg[:400]}")
    except urllib.error.URLError as e:
        raise ApiError(f"network error: {e.reason}")


def git(*args):
    r = subprocess.run(["git", *args], capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 else ""


def kebab(s):
    """Match write-local-azure-devops-pr-description's pr-<kebab-branch-name>.md naming."""
    out = "".join(c if c.isalnum() else "-" for c in s.lower())
    while "--" in out:
        out = out.replace("--", "-")
    return out.strip("-")


def read_source(arg):
    return sys.stdin.read() if arg == "-" else Path(arg).read_text()


def parse_args():
    """-> (pr_id, description_arg_or_None)."""
    argv = sys.argv[1:]
    if not argv or not argv[0].lstrip("#").isdigit():
        die("usage: set_description.py <pr-id> [--description <path|->]")
    pr_id = argv[0].lstrip("#")
    desc = None
    rest = argv[1:]
    i = 0
    while i < len(rest):
        if rest[i] == "--description":
            if i + 1 >= len(rest):
                die("--description needs a path (or '-' for stdin).")
            desc = rest[i + 1]
            i += 2
        else:
            die(f"unexpected argument: {rest[i]}\n"
                "usage: set_description.py <pr-id> [--description <path|->]")
    return pr_id, desc


def resolve_body(desc_arg):
    """(body, note). Explicit --description file/stdin, else the local draft."""
    if desc_arg is not None:
        return read_source(desc_arg).strip(), f"from {desc_arg}"
    branch = git("rev-parse", "--abbrev-ref", "HEAD")
    if branch and branch != "HEAD":
        auto = Path(f"pr-{kebab(branch)}.md")
        if auto.exists():
            return auto.read_text().strip(), f"from {auto.name}"
    die("no description source — pass --description <path|-> (or run in the "
        "clone where write-local-azure-devops-pr-description wrote pr-<branch>.md).")


def main():
    pr_id, desc_arg = parse_args()
    body, note = resolve_body(desc_arg)
    if not body:
        die("the description body is empty.")
    pat = load_pat()

    # PR ids are org-unique; this global lookup gives us repo + project.
    try:
        pr = request(f"{ORG}/_apis/git/pullrequests/{pr_id}?{API}", pat)
    except ApiError as e:
        die(str(e))
    repo = pr.get("repository", {})
    repo_id = repo.get("id")
    project = (repo.get("project") or {}).get("name", "")
    if not repo_id:
        die("could not resolve the PR's repository.")

    url = (f"{ORG}/{project}/_apis/git/repositories/{repo_id}"
           f"/pullRequests/{pr_id}?{API}")
    try:
        request(url, pat, method="PATCH", body={"description": body})
    except ApiError as e:
        die(f"updating the description: {e}")

    print(f"updated description on PR #{pr_id} ({note}, {len(body)} chars)")
    print(f"{ORG}/{project}/_git/{repo.get('name', '')}/pullrequest/{pr_id}")


if __name__ == "__main__":
    main()
