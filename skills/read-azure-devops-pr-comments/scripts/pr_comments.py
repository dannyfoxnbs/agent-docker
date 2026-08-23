#!/usr/bin/env python3
"""Read unresolved comment threads on an Azure DevOps pull request.

Usage:  pr_comments.py <pr-id>

Shows every UNRESOLVED thread (status active/pending) — both human reviewer
comments and automated ones (e.g. SonarCloud) — grouped by file, with the
anchored line, author and text. Resolved/closed threads and system
notifications (votes, reviewer changes, "marked as fixed") are skipped.

Auth: a Personal Access Token with **Code (Read)**, from
$AZURE_DEVOPS_EXT_PAT or ~/.config/azure-devops/pat (chmod 600); override that
path with ADO_PAT_FILE.
Override the target org with ADO_ORG (default https://thenbs.visualstudio.com/).
"""
import base64
import html
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ORG = os.environ.get("ADO_ORG", "https://thenbs.visualstudio.com/").rstrip("/")
PAT_FILE = Path(os.environ.get(
    "ADO_PAT_FILE", Path.home() / ".config" / "azure-devops" / "pat")).expanduser()
API = "api-version=7.1"

# Thread statuses we treat as "still needs addressing".
UNRESOLVED = {"active", "pending"}


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


def text(s):
    """Comment bodies are markdown/HTML-ish; flatten to plain text."""
    if not s:
        return ""
    s = re.sub(r"<\s*(br|/p|/div|/li)\s*/?>", "\n", s, flags=re.I)
    s = html.unescape(re.sub(r"<[^>]+>", "", s))
    return re.sub(r"\n{3,}", "\n\n", s).strip()


def line_of(ctx):
    """Anchored line from a thread's threadContext, or None for PR-level."""
    if not ctx:
        return None, None
    path = ctx.get("filePath") or ""
    start = ctx.get("rightFileStart") or ctx.get("leftFileStart") or {}
    return path, start.get("line")


def main():
    if len(sys.argv) != 2 or not sys.argv[1].lstrip("#").isdigit():
        die("usage: pr_comments.py <pr-id>")
    pr_id = sys.argv[1].lstrip("#")
    pat = load_pat()

    # PR ids are org-unique; this global lookup gives us the repo + project.
    pr = get(f"{ORG}/_apis/git/pullrequests/{pr_id}?{API}", pat)
    repo = pr.get("repository", {})
    repo_id = repo.get("id")
    project = (repo.get("project") or {}).get("name", "")
    if not repo_id:
        die("could not resolve the PR's repository.")

    threads = get(
        f"{ORG}/{project}/_apis/git/repositories/{repo_id}"
        f"/pullRequests/{pr_id}/threads?{API}", pat).get("value", [])

    by_file, general, kept = {}, [], 0
    for th in threads:
        if th.get("isDeleted") or (th.get("status") or "").lower() not in UNRESOLVED:
            continue
        comments = [c for c in th.get("comments", [])
                    if not c.get("isDeleted")
                    and (c.get("commentType") or "text") != "system"]
        if not comments:
            continue
        kept += 1
        path, line = line_of(th.get("threadContext"))
        block = [f"#{th.get('id')}" + (f" L{line}" if line else "")]
        for c in comments:
            author = (c.get("author") or {}).get("displayName", "?")
            when = (c.get("publishedDate") or "")[:10]
            body = text(c.get("content", "")).replace("\n", "\n    ")
            block.append(f"  [{author} {when}] {body}")
        (by_file.setdefault(path, []) if path else general).append("\n".join(block))

    out = [f"PR #{pr_id}  {pr.get('title', '')}",
           f"{ORG}/{project}/_git/{repo.get('name', '')}/pullrequest/{pr_id}",
           f"{kept} unresolved thread(s)"]
    if not kept:
        out.append("Nothing unresolved to address. 🎉")
    for path in sorted(by_file):
        out += [f"\n{path}"] + by_file[path]
    if general:
        out += ["\n(general / PR-level)"] + general
    print("\n".join(out))


if __name__ == "__main__":
    main()
