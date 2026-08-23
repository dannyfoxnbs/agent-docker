#!/usr/bin/env python3
"""Emit the exact diff an Azure DevOps pull request represents — deterministically.

Usage:  pr_diff.py <pr-id> [--name-only | --stat]

Resolves the PR's target and source commits from the Azure DevOps API (NOT from
local branch guessing) and prints:

    git diff <targetSha>...<sourceSha>

The three-dot form diffs the source tip against its merge-base with the target,
which is exactly what the ADO PR "Files" tab shows — only the branch's own
changes, never unrelated churn that landed on the target since it diverged.

Because the target branch is read from the PR (targetRefName), this works
unchanged whether the PR targets dev, a release branch, or anything else — no
hardcoded base, no flag to remember.

Options:
  --name-only   list changed paths only
  --stat        diffstat summary only
  (default)     full unified diff

Run it from inside a local clone of the PR's repo. If the two commits aren't
present locally it fetches them from `origin` first.

Auth: a Personal Access Token with **Code (Read)**, from $AZURE_DEVOPS_EXT_PAT
or ~/.config/azure-devops/pat (chmod 600); override that path with ADO_PAT_FILE.
Override the org with ADO_ORG.
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
            "(chmod 600). Needs the 'Code (Read)' scope.")
    return pat


def get(url, pat):
    token = base64.b64encode(f":{pat}".encode()).decode()
    req = urllib.request.Request(url, headers={
        "Authorization": f"Basic {token}",
        "Accept": "application/json",
    })
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        if e.code in (401, 203):
            die("PAT rejected — expired or missing the 'Code (Read)' scope.")
        if e.code == 404:
            die("not found — check the PR id (and that the PAT can see this project).")
        die(f"HTTP {e.code}: {e.read().decode(errors='replace')[:300]}")
    except urllib.error.URLError as e:
        die(f"network error: {e.reason}")


def git(*args, check=True):
    r = subprocess.run(["git", *args], capture_output=True, text=True)
    if check and r.returncode != 0:
        die(f"git {' '.join(args)} failed: {r.stderr.strip()}")
    return r


def have(sha):
    return git("cat-file", "-e", f"{sha}^{{commit}}", check=False).returncode == 0


def main():
    argv = sys.argv[1:]
    mode = None
    for flag in ("--name-only", "--stat"):
        if flag in argv:
            mode = flag
            argv.remove(flag)
    if len(argv) != 1 or not argv[0].lstrip("#").isdigit():
        die("usage: pr_diff.py <pr-id> [--name-only | --stat]")
    pr_id = argv[0].lstrip("#")
    pat = load_pat()

    if git("rev-parse", "--is-inside-work-tree", check=False).stdout.strip() != "true":
        die("not inside a git repo — run this from a clone of the PR's repo.")

    # PR ids are org-unique; this global lookup gives us the repo + commits.
    pr = get(f"{ORG}/_apis/git/pullrequests/{pr_id}?{API}", pat)
    src = (pr.get("lastMergeSourceCommit") or {}).get("commitId")
    tgt = (pr.get("lastMergeTargetCommit") or {}).get("commitId")
    if not src or not tgt:
        die("PR has no merge source/target commit yet (still computing, or abandoned).")
    src_ref = pr.get("sourceRefName", "").replace("refs/heads/", "")
    tgt_ref = pr.get("targetRefName", "").replace("refs/heads/", "")

    # Ensure both commits are local; a single fetch of the two branches gets them.
    if not have(src) or not have(tgt):
        git("fetch", "--quiet", "origin", src_ref, tgt_ref, check=False)
    missing = [s for s in (src, tgt) if not have(s)]
    if missing:
        die("commit(s) not found locally even after fetch: " + ", ".join(missing)
            + " — is this the right repo clone for the PR?")

    spec = f"{tgt}...{src}"
    diff_args = ["diff", spec] if not mode else ["diff", mode, spec]

    header = (f"PR #{pr_id}  {pr.get('title', '')}\n"
              f"{src_ref}  →  {tgt_ref}   (base = merge-base, ADO 3-dot)\n"
              f"{tgt[:9]}...{src[:9]}")
    print(header)
    print("-" * len(max(header.splitlines(), key=len)))
    sys.stdout.write(git(*diff_args).stdout)


if __name__ == "__main__":
    main()
