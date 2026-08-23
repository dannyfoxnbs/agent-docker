#!/usr/bin/env python3
"""Post AI review comments to an Azure DevOps pull request.

Two kinds of comment, freely combinable in one call:

  * INLINE findings — each anchored to a line, one thread per finding.
  * A SUMMARY — one PR-level thread (no line anchor) carrying the verdict.
    The summary is idempotent: re-running UPDATES the existing summary thread
    in place instead of stacking a new one, so a PR only ever has one.

Usage:
    # single inline comment (positional)
    post_comment.py <pr-id> <file-path> <line> <message>

    # many inline findings (JSON array of {file, line, message})
    post_comment.py <pr-id> --json <path|->

    # summary only (plain text / markdown; "-" reads stdin)
    post_comment.py <pr-id> --summary <path|->

    # both at once
    post_comment.py <pr-id> --json findings.json --summary summary.txt

Inline messages are prefixed with an "🤖 AI review:" tag and anchored to the
right-hand (new) side of the file. The summary is prefixed with the same tag,
posted as a non-blocking (closed) PR-level thread so it never nags the author
for resolution. A bad inline finding is reported and skipped, never fatal.

Auth: a Personal Access Token with **Code (Read & Write)** (a.k.a. "Contribute
to pull requests"), from $AZURE_DEVOPS_EXT_PAT or ~/.config/azure-devops/pat
(chmod 600); override that path with ADO_PAT_FILE.
Override the target org with ADO_ORG (default https://thenbs.visualstudio.com/).
"""
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

ORG = os.environ.get("ADO_ORG", "https://thenbs.visualstudio.com/").rstrip("/")
PAT_FILE = Path(os.environ.get(
    "ADO_PAT_FILE", Path.home() / ".config" / "azure-devops" / "pat")).expanduser()
API = "api-version=7.1"
TAG = "🤖 AI review:"


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
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        if e.code in (401, 203):
            raise ApiError("PAT rejected — expired or missing 'Code (Read & Write)'.")
        if e.code == 404:
            raise ApiError("not found — check the PR id / that the PAT sees this project.")
        raise ApiError(f"HTTP {e.code}: {e.read().decode(errors='replace')[:200]}")
    except urllib.error.URLError as e:
        raise ApiError(f"network error: {e.reason}")


def clean(finding):
    """Validate one finding -> (file_path, line, message) or raise ValueError."""
    path = str(finding.get("file", "")).strip()
    if not path:
        raise ValueError("missing 'file'")
    if not path.startswith("/"):
        path = "/" + path  # ADO threadContext paths are repo-root-absolute
    line = finding.get("line")
    if not isinstance(line, int) or line < 1:
        raise ValueError(f"'line' must be a positive integer (got {line!r})")
    message = str(finding.get("message", "")).strip()
    if not message:
        raise ValueError("empty 'message'")
    return path, line, message


def threads_url(pr_id, repo_id, project):
    return (f"{ORG}/{project}/_apis/git/repositories/{repo_id}"
            f"/pullRequests/{pr_id}/threads")


def post_one(pr_id, repo_id, project, pat, path, line, message):
    body = {
        "comments": [{"parentCommentId": 0, "commentType": "text",
                      "content": f"{TAG} {message}"}],
        "status": "active",
        "threadContext": {
            "filePath": path,
            "rightFileStart": {"line": line, "offset": 1},
            "rightFileEnd": {"line": line, "offset": 1},
        },
    }
    thread = request(f"{threads_url(pr_id, repo_id, project)}?{API}", pat,
                     method="POST", body=body)
    return thread.get("id")


def find_summary_thread(pr_id, repo_id, project, pat):
    """Return (thread_id, comment_id) of the existing AI summary thread, or None.

    The summary is the one AI-tagged thread with NO threadContext (inline
    findings always have one), so we can update it in place across re-runs.
    """
    data = request(f"{threads_url(pr_id, repo_id, project)}?{API}", pat)
    for thread in data.get("value", []):
        if thread.get("threadContext"):
            continue  # inline finding, not the summary
        comments = thread.get("comments") or []
        if not comments:
            continue
        first = comments[0]
        if str(first.get("content", "")).startswith(TAG):
            return thread.get("id"), first.get("id")
    return None


def upsert_summary(pr_id, repo_id, project, pat, text):
    """Create the PR-level summary thread, or update it if one already exists."""
    content = f"{TAG} {text}"
    existing = find_summary_thread(pr_id, repo_id, project, pat)
    if existing:
        thread_id, comment_id = existing
        request(f"{threads_url(pr_id, repo_id, project)}/{thread_id}"
                f"/comments/{comment_id}?{API}", pat,
                method="PATCH", body={"content": content})
        return thread_id, "updated"
    thread = request(f"{threads_url(pr_id, repo_id, project)}?{API}", pat,
                     method="POST", body={
                         "comments": [{"parentCommentId": 0,
                                       "commentType": "text", "content": content}],
                         "status": "closed",  # informational, non-blocking
                     })
    return thread.get("id"), "created"


def read_source(arg):
    return sys.stdin.read() if arg == "-" else Path(arg).read_text()


def parse_args():
    """-> (pr_id, findings, summary_text). summary_text is None if not given."""
    argv = sys.argv[1:]
    if not argv or not argv[0].lstrip("#").isdigit():
        usage()
    pr_id = argv[0].lstrip("#")
    rest = argv[1:]

    # Positional single-comment form: <file> <line> <message>
    if rest and rest[0] not in ("--json", "--summary") and len(rest) == 3:
        line = int(rest[1]) if rest[1].lstrip("-").isdigit() else rest[1]
        return pr_id, [{"file": rest[0], "line": line, "message": rest[2]}], None

    findings, summary, stdin_used = [], None, False
    i = 0
    while i < len(rest):
        flag = rest[i]
        if flag in ("--json", "--summary"):
            if i + 1 >= len(rest):
                die(f"{flag} needs a path (or '-' for stdin).")
            src_arg = rest[i + 1]
            if src_arg == "-":
                if stdin_used:
                    die("only one of --json/--summary can read stdin ('-').")
                stdin_used = True
            i += 2
        else:
            usage()
        if flag == "--json":
            try:
                findings = json.loads(read_source(src_arg))
            except json.JSONDecodeError as e:
                die(f"invalid JSON: {e}")
            if not isinstance(findings, list):
                die("--json must be an array of {file, line, message} objects.")
        else:
            summary = read_source(src_arg).strip()
            if not summary:
                die("--summary content is empty.")

    if not findings and summary is None:
        usage()
    return pr_id, findings, summary


def usage():
    die("usage: post_comment.py <pr-id> <file> <line> <message>\n"
        "   or: post_comment.py <pr-id> --json <path|-> [--summary <path|->]\n"
        "   or: post_comment.py <pr-id> --summary <path|->")


def main():
    pr_id, findings, summary = parse_args()
    pat = load_pat()

    # PR ids are org-unique; this global lookup gives us the repo + project once.
    try:
        pr = request(f"{ORG}/_apis/git/pullrequests/{pr_id}?{API}", pat)
    except ApiError as e:
        die(str(e))
    repo = pr.get("repository", {})
    repo_id = repo.get("id")
    project = (repo.get("project") or {}).get("name", "")
    if not repo_id:
        die("could not resolve the PR's repository.")

    posted, failed = [], []
    for idx, finding in enumerate(findings):
        try:
            path, line, message = clean(finding)
            tid = post_one(pr_id, repo_id, project, pat, path, line, message)
            posted.append(f"  #{tid}  {path}:{line}")
        except (ValueError, ApiError) as e:
            failed.append(f"  finding {idx}: {e}")

    if findings:
        print(f"posted {len(posted)}/{len(findings)} inline comment(s) on PR #{pr_id}")
        print("\n".join(posted))

    if summary is not None:
        try:
            tid, action = upsert_summary(pr_id, repo_id, project, pat, summary)
            print(f"summary thread #{tid} {action}")
        except ApiError as e:
            failed.append(f"  summary: {e}")

    if failed:
        print(f"\n{len(failed)} problem(s):")
        print("\n".join(failed))
    print(f"\n{ORG}/{project}/_git/{repo.get('name', '')}/pullrequest/{pr_id}")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
