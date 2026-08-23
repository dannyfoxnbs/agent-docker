#!/usr/bin/env python3
"""Read an Azure DevOps work item (PBI / Bug / Task) as readable text.

Usage:  workitem.py <id>

Auth: a Personal Access Token with Work Items (Read), from
$AZURE_DEVOPS_EXT_PAT or ~/.config/azure-devops/pat (chmod 600); override that
path with ADO_PAT_FILE.
Overrides: ADO_ORG (default https://thenbs.visualstudio.com/), ADO_PROJECT (Nimbus).
"""
import html, json, os, re, subprocess, sys
from pathlib import Path

ORG = os.environ.get("ADO_ORG", "https://thenbs.visualstudio.com/")
PROJECT = os.environ.get("ADO_PROJECT", "Nimbus")
PAT_FILE = Path(os.environ.get(
    "ADO_PAT_FILE", Path.home() / ".config" / "azure-devops" / "pat")).expanduser()

SECTIONS = [
    ("Description", "System.Description"),
    ("Acceptance Criteria", "Microsoft.VSTS.Common.AcceptanceCriteria"),
    ("Repro Steps", "Microsoft.VSTS.TCM.ReproSteps"),
]


def die(msg):
    sys.exit(f"error: {msg}")


def load_pat():
    pat = (os.environ.get("AZURE_DEVOPS_EXT_PAT")
           or (PAT_FILE.read_text() if PAT_FILE.exists() else "")).strip()
    if not pat:
        die(f"no PAT. Set $AZURE_DEVOPS_EXT_PAT or write one to {PAT_FILE} "
            "(chmod 600). Needs the 'Work Items (Read)' scope.")
    return pat


def fetch(item_id, pat):
    try:
        p = subprocess.run(
            ["az", "boards", "work-item", "show", "--id", item_id,
             "--org", ORG, "--output", "json"],
            capture_output=True, text=True,
            env={**os.environ, "AZURE_DEVOPS_EXT_PAT": pat})
    except FileNotFoundError:
        die("`az` CLI not found — install it and the azure-devops extension.")
    if p.returncode:
        err = p.stderr.strip() or "az command failed"
        if "requires user authentication" in err:
            err += "\nPAT rejected — expired or missing 'Work Items (Read)'."
        die(err)
    return json.loads(p.stdout)


def text(s):
    """ADO stores rich fields as HTML; flatten to plain text."""
    if not s:
        return ""
    s = re.sub(r"<\s*(br|/p|/div|/li)\s*/?>", "\n", s, flags=re.I)
    s = re.sub(r"<\s*li\s*>", "  - ", s, flags=re.I)
    s = html.unescape(re.sub(r"<[^>]+>", "", s))
    return re.sub(r"\n{3,}", "\n\n", s).strip()


def person(v):
    if isinstance(v, dict):
        return v.get("displayName") or v.get("uniqueName") or "?"
    return v or "-"


def render(item):
    f, iid = item.get("fields", {}), item.get("id")
    out = [
        f"#{iid}  [{f.get('System.WorkItemType', '?')}]  {f.get('System.Title', '')}",
        "=" * 72,
        f"State:     {f.get('System.State', '-')}",
        f"Assigned:  {person(f.get('System.AssignedTo'))}",
        f"Created:   {person(f.get('System.CreatedBy'))}  ({f.get('System.CreatedDate', '-')[:10]})",
    ]
    if f.get("System.IterationPath"):
        out.append(f"Iteration: {f['System.IterationPath']}")
    if f.get("System.Tags"):
        out.append(f"Tags:      {f['System.Tags']}")
    out.append(f"URL:       {ORG.rstrip('/')}/{PROJECT}/_workitems/edit/{iid}")

    for heading, key in SECTIONS:
        body = text(f.get(key, ""))
        if body:
            out += ["", f"-- {heading} ".ljust(72, "-"), body]

    links = []
    for r in item.get("relations") or []:
        rel = r.get("rel", "")
        if "Hierarchy" in rel or "Related" in rel:
            rid = r.get("url", "").rstrip("/").split("/")[-1]
            kind = "child" if "Forward" in rel else "parent" if "Reverse" in rel else "related"
            links.append(f"  {kind}: #{rid}")
    if links:
        out += ["", "-- Links ".ljust(72, "-")] + links

    return "\n".join(out)


def main():
    if len(sys.argv) != 2:
        die("usage: workitem.py <id>")
    print(render(fetch(sys.argv[1], load_pat())))


if __name__ == "__main__":
    main()
