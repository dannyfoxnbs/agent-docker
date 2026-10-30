#!/usr/bin/env python3
"""Onboarding workspace kit, shared by the onboard, deep-dive and learn-stack skills.

  init    create or refresh the workspace and print the facts every page needs
  recon   print a repo fact sheet (also saved to notes/recon.md)
  check   verify pages (citations, excerpts, links, diagrams), then rebuild the hub
  hub     rebuild index.html and the site navigation from the pages on disk
  open    open a page (default: the hub) in the browser
  changes list merged changes that span several areas: worked-example candidates
  faq     render notes/faq.md into faq/faq.html, check it and flag answers that drifted

Every command takes --repo (default: cwd) and --out (default: <git root>/.onboarding).
Code paths inside pages are relative to the git root. Standard library only.
"""
from __future__ import annotations

import argparse
import collections
import datetime as dt
import html
import json
import os
import re
import shutil
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

KIT_DIR = Path(__file__).resolve().parent.parent
KIT_ASSETS = ("onboarding.css", "onboarding.js")
WORKSPACE_DIR_NAME = ".onboarding"
WORKSPACE_SUBDIRS = ("guide", "deep-dives", "changes", "faq", "learn", "notes", "assets/img")
RECENT_DAYS = 180
LIST_CAP = 25
DEPENDENCY_CAP = 400
TOP_AUTHORS_PER_AREA = 3
SHORT_SHA = 10


# ── shell & git ──────────────────────────────────────────────────────────────

def run(cmd: list[str], cwd: Path | None = None) -> tuple[int, str]:
    try:
        proc = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, errors="replace")
    except FileNotFoundError:
        return 127, ""
    return proc.returncode, proc.stdout


def git(root: Path, *args: str) -> str:
    code, out = run(["git", "-C", str(root), *args])
    return out if code == 0 else ""


def find_repo_root(start: str) -> Path:
    code, out = run(["git", "-C", start, "rev-parse", "--show-toplevel"])
    if code != 0:
        sys.exit(f"error: {Path(start).resolve()} is not inside a git repository")
    return Path(out.strip())


def find_workspace(root: Path, out: str | None) -> Path:
    chosen = out or os.environ.get("ONBOARDING_DIR")
    return Path(chosen).expanduser().resolve() if chosen else root / WORKSPACE_DIR_NAME


def tracked_files(root: Path) -> list[str]:
    return [line for line in git(root, "ls-files").splitlines() if line]


def write_atomic(path: Path, text: str) -> None:
    """Write via a temp file and rename, so concurrent runs never leave a half-written file."""
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temporary.write_text(text, encoding="utf-8")
    os.replace(temporary, path)


def merge_check_results(ws: Path, updates: dict) -> None:
    """Merge this run's results under a lock, so concurrent checks keep each other's entries."""
    path = ws / "notes" / "check.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    with (ws / "notes" / ".check.lock").open("w") as lock:
        try:
            import fcntl
            fcntl.flock(lock, fcntl.LOCK_EX)
        except ImportError:
            pass
        results = read_check_results(ws)
        results.update(updates)
        write_atomic(path, json.dumps(results, indent=1))


def read_check_results(ws: Path) -> dict:
    try:
        return json.loads((ws / "notes" / "check.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def is_wsl() -> bool:
    if os.environ.get("WSL_DISTRO_NAME"):
        return True
    try:
        return "microsoft" in Path("/proc/version").read_text().lower()
    except OSError:
        return False


# ── repo facts (init) ────────────────────────────────────────────────────────

AZURE_REMOTES = (
    (r"(?:ssh://)?git@ssh\.dev\.azure\.com:v3/([^/]+)/([^/]+)/(.+)$", "https://dev.azure.com/{0}/{1}/_git/{2}"),
    (r"https://(?:[^@/]+@)?dev\.azure\.com/([^/]+)/([^/]+)/_git/(.+)$", "https://dev.azure.com/{0}/{1}/_git/{2}"),
    (r"(?:ssh://)?[^@/]+@vs-ssh\.visualstudio\.com:v3/([^/]+)/([^/]+)/(.+)$", "https://{0}.visualstudio.com/{1}/_git/{2}"),
    (r"https://(?:[^@/]+@)?([^./]+)\.visualstudio\.com/(?:DefaultCollection/)?([^/]+)/_git/(.+)$",
     "https://{0}.visualstudio.com/{1}/_git/{2}"),
)
WEB_HOSTS = ("github", "gitlab", "bitbucket")


def web_remote(url: str) -> dict | None:
    url = url.strip()
    if url.endswith(".git"):
        url = url[: -len(".git")]
    for pattern, template in AZURE_REMOTES:
        match = re.match(pattern, url)
        if match:
            return {"kind": "azure", "base": template.format(*match.groups())}
    match = re.match(r"(?:ssh://)?[^@/]+@([^:/]+)(?::\d+)?[:/](.+)$", url) or re.match(
        r"https?://(?:[^@/]+@)?([^/]+)/(.+)$", url)
    if not match:
        return None
    host, path = match.groups()
    kind = next((name for name in WEB_HOSTS if name in host), None)
    return {"kind": kind, "base": f"https://{host}/{path}"} if kind else None


def editor_base(root: Path) -> str:
    distro = os.environ.get("WSL_DISTRO_NAME")
    if distro:
        return f"vscode-remote/wsl+{distro}{root.as_posix()}"
    posix = root.as_posix()
    return "file" + (posix if posix.startswith("/") else "/" + posix)


def repo_facts(root: Path) -> dict:
    commit = git(root, "rev-parse", "HEAD").strip()
    remotes = git(root, "remote").split()
    remote = "origin" if "origin" in remotes else (remotes[0] if remotes else "")
    url = git(root, "remote", "get-url", remote).strip() if remote else ""
    default = git(root, "symbolic-ref", "--short", f"refs/remotes/{remote}/HEAD").strip() if remote else ""
    return {
        "repo": root.name,
        "root": root.as_posix(),
        "commit": commit,
        "branch": git(root, "rev-parse", "--abbrev-ref", "HEAD").strip(),
        "defaultBranch": default.split("/", 1)[-1] if default else "",
        "web": web_remote(url) if url else None,
        "editor": editor_base(root),
        "editorScheme": os.environ.get("ONBOARDING_EDITOR", "vscode"),
        "pushed": bool(commit) and bool(git(root, "branch", "-r", "--contains", commit).strip()),
        "dirty": bool(git(root, "status", "--porcelain", "--untracked-files=no").strip()),
        "generated": dt.date.today().isoformat(),
    }


def ensure_git_excluded(root: Path, ws: Path) -> str:
    try:
        rel = ws.relative_to(root).as_posix()
    except ValueError:
        return "outside the repo, nothing to ignore"
    code, _ = run(["git", "-C", str(root), "check-ignore", "-q", f"{rel}/"])
    if code == 0:
        return "already ignored by git"
    exclude = Path(git(root, "rev-parse", "--git-path", "info/exclude").strip())
    exclude = exclude if exclude.is_absolute() else root / exclude
    exclude.parent.mkdir(parents=True, exist_ok=True)
    with exclude.open("a", encoding="utf-8") as handle:
        handle.write(f"\n# local onboarding workspace\n/{rel}/\n")
    return f"added /{rel}/ to {exclude}"


def cmd_init(args: argparse.Namespace) -> None:
    root = find_repo_root(args.repo)
    ws = find_workspace(root, args.out)
    for sub in WORKSPACE_SUBDIRS:
        (ws / sub).mkdir(parents=True, exist_ok=True)
    for name in KIT_ASSETS:
        shutil.copyfile(KIT_DIR / "assets" / name, ws / "assets" / name)
    facts = repo_facts(root)
    ignore_note = ensure_git_excluded(root, ws)
    pages = build_hub(ws, facts)
    web = facts["web"]
    profile = ws / "PROFILE.md"
    print(f"workspace  {ws}")
    print(f"repo       {facts['repo']}  ({root})")
    print(f"commit     {facts['commit']}  on {facts['branch']}")
    print(f"web links  {web['kind'] + '  ' + web['base'] if web else 'none (remote host not recognised); editor links only'}")
    print(f"git        {ignore_note}")
    print(f"template   {KIT_DIR / 'templates' / 'page.html'}")
    print(f"profile    {profile if profile.exists() else 'none yet'}")
    print(f"pages      {len(pages)}")
    for page in pages:
        print(f"  - {page['path']}  {page['title']}")
    if facts["dirty"]:
        print("note       uncommitted changes in the working tree: cite what is on disk")
    if web and not facts["pushed"]:
        print("note       HEAD is not on any remote branch yet: web links resolve once it is pushed")


# ── recon ────────────────────────────────────────────────────────────────────

LOCKFILE = re.compile(r"(^|/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|Cargo\.lock|poetry\.lock|go\.sum|"
                      r"composer\.lock|Gemfile\.lock|packages\.lock\.json|[^/]*\.snap)$")
SKIPPED_SEGMENT = re.compile(r"(^|/)(fixtures|__fixtures__|testdata|vendor|third_party|node_modules)/")
AGENT_DOC = re.compile(r"(^|/)(AGENTS\.md|CLAUDE\.md|GEMINI\.md|\.cursorrules|\.github/copilot-instructions\.md)$"
                       r"|(^|/)\.cursor/rules/", re.I)
HUMAN_DOC = re.compile(r"(^|/)(README|CONTRIBUTING|ARCHITECTURE|CONTEXT|GLOSSARY|DEVELOPMENT|HACKING|ONBOARDING|"
                       r"CODEOWNERS|SECURITY)[^/]*$|(^|/)(\.github/)?pull_request_template\.md$", re.I)
DOCS_TREE = re.compile(r"(^|/)(docs?|documentation|wiki)/.+\.(md|mdx|rst|adoc|txt)$", re.I)
ADR = re.compile(r"(^|/)(adrs?|decisions|architecture-decisions)/.+\.(md|mdx|rst)$", re.I)
CI_FILE = re.compile(r"(^|/)(\.github/workflows/[^/]+\.ya?ml|azure-pipelines[^/]*\.ya?ml|azure-pipelines/.+\.ya?ml|"
                     r"\.gitlab-ci\.yml|Jenkinsfile|bitbucket-pipelines\.yml|\.circleci/config\.yml|\.travis\.yml|"
                     r"cloudbuild\.ya?ml|buildspec\.ya?ml)$", re.I)
INFRA_FILE = re.compile(r"(^|/)(Dockerfile[^/]*|[^/]+\.dockerfile|docker-compose[^/]*\.ya?ml|compose\.ya?ml|"
                        r"serverless\.ya?ml|cdk\.json|samconfig\.toml|Chart\.yaml|kustomization\.ya?ml|Procfile|"
                        r"vercel\.json|netlify\.toml|fly\.toml|[^/]+\.tf|[^/]+\.bicep)$", re.I)
TEST_CONFIG = re.compile(r"(^|/)(jest\.config[^/]*|karma\.conf[^/]*|vitest\.config[^/]*|playwright\.config[^/]*|"
                         r"cypress\.config[^/]*|cucumber[^/]*\.(js|cjs|mjs|json|ya?ml)|\.mocharc[^/]*|jasmine\.json|"
                         r"pytest\.ini|conftest\.py|tox\.ini|phpunit\.xml[^/]*|[^/]+\.runsettings)$", re.I)
TEST_FILE = re.compile(r"\.(spec|test)\.[cm]?[jt]sx?$|\.feature$|_test\.go$|(^|/)test_[^/]+\.py$|_test\.py$|"
                       r"(Tests?|Spec)\.(cs|java|kt|scala)$|_(spec|test)\.rb$")
TOOLING = ("nx.json", "turbo.json", "lerna.json", "pnpm-workspace.yaml", "rush.json", "angular.json", "workspace.json",
           "tsconfig.base.json", "Makefile", "Taskfile.yml", "justfile", ".nvmrc", ".node-version", ".tool-versions",
           ".python-version", "global.json", "Directory.Build.props", "Directory.Packages.props", ".env.example",
           ".env.sample", "devcontainer.json", "sonar-project.properties", ".pre-commit-config.yaml",
           "renovate.json", "dependabot.yml", "eslint.config.mjs", "eslint.config.js", ".eslintrc.json",
           ".eslintrc.js", ".prettierrc", "biome.json", ".stylelintrc.json", "schema.prisma", ".sequelizerc")
RUNTIME_PINS = (".nvmrc", ".node-version", ".python-version", ".tool-versions", "global.json")
TOOLING_MAX_DEPTH = 3
ENTRY_NAMES = {"main.ts", "main.tsx", "main.js", "main.mjs", "server.ts", "server.js", "app.ts", "app.js",
               "app.module.ts", "app.config.ts", "app.routes.ts", "app-routing.module.ts", "Program.cs",
               "Startup.cs", "main.go", "main.py", "app.py", "manage.py", "wsgi.py", "asgi.py", "__main__.py",
               "handler.ts", "handler.js", "lambda.ts", "Application.java", "main.rs", "index.ts", "index.js",
               "index.tsx", "index.html"}
SHALLOW_ONLY = {"index.ts", "index.js", "index.tsx", "index.html"}
ENTRY_MAX_DEPTH = 3
MARKER = r"\b(TODO|FIXME|HACK|XXX)\b"
DEPRECATION = r"@deprecated|\[Obsolete|@Deprecated|DeprecationWarning"


def lenient_json(text: str) -> dict:
    """Parse JSON that may carry comments and trailing commas (tsconfig, project.json)."""
    kept, i, in_string = [], 0, False
    while i < len(text):
        char = text[i]
        if in_string:
            kept.append(text[i:i + 2] if char == "\\" else char)
            in_string = char != '"'
            i += 2 if char == "\\" else 1
        elif char == '"':
            kept.append(char)
            in_string = True
            i += 1
        elif text.startswith("//", i):
            newline = text.find("\n", i)
            i = len(text) if newline < 0 else newline
        elif text.startswith("/*", i):
            close = text.find("*/", i + 2)
            i = len(text) if close < 0 else close + 2
        else:
            kept.append(char)
            i += 1
    return json.loads(re.sub(r",(\s*[}\]])", r"\1", "".join(kept)))


def parse_package_json(text: str) -> tuple[str, list[str], list[str], str]:
    data = json.loads(text)
    deps = [f"{k}@{v}" for k, v in (data.get("dependencies") or {}).items()]
    dev = [f"{k}@{v}" for k, v in (data.get("devDependencies") or {}).items()]
    notes = []
    if data.get("scripts"):
        notes.append("scripts: " + ", ".join(data["scripts"]))
    if data.get("workspaces"):
        notes.append(f"workspaces: {data['workspaces']}")
    return data.get("name", ""), deps, dev, "; ".join(notes)


def parse_dotnet(text: str) -> tuple[str, list[str], list[str], str]:
    deps = [f"{name}@{version}" if version else name
            for name, version in re.findall(r'<PackageReference\s+Include="([^"]+)"(?:\s+Version="([^"]*)")?', text)]
    refs = [Path(ref.replace("\\", "/")).stem for ref in re.findall(r'<ProjectReference\s+Include="([^"]+)"', text)]
    target = re.search(r"<TargetFrameworks?>([^<]+)<", text)
    notes = [f"target: {target[1]}"] if target else []
    if refs:
        notes.append("project refs: " + ", ".join(refs))
    return "", deps, [], "; ".join(notes)


def parse_go_mod(text: str) -> tuple[str, list[str], list[str], str]:
    module = re.search(r"^module\s+(\S+)", text, re.M)
    deps, indirect = [], []
    for name, version, comment in re.findall(r"^\s*(?:require\s+)?([\w.\-/]+\.[\w.\-/]+)\s+(v\S+)(.*)$", text, re.M):
        (indirect if "indirect" in comment else deps).append(f"{name}@{version}")
    return module[1] if module else "", deps, indirect, ""


def toml_section_keys(text: str, header: str) -> list[str]:
    section = re.search(rf"^\[{re.escape(header)}\]\s*$(.*?)(?=^\[|\Z)", text, re.M | re.S)
    if not section:
        return []
    return [f"{k}@{v.strip(chr(34))}" for k, v in re.findall(r'^([\w.\-]+)\s*=\s*("?[^"\n{]*"?)', section[1], re.M)]


def parse_pyproject(text: str) -> tuple[str, list[str], list[str], str]:
    name = re.search(r'^name\s*=\s*"([^"]+)"', text, re.M)
    deps = []
    listed = re.search(r"^dependencies\s*=\s*\[(.*?)\]", text, re.M | re.S)
    if listed:
        deps += re.findall(r'"([^"]+)"', listed[1])
    deps += [d for d in toml_section_keys(text, "tool.poetry.dependencies") if not d.startswith("python@")]
    dev = toml_section_keys(text, "tool.poetry.group.dev.dependencies") + toml_section_keys(
        text, "tool.poetry.dev-dependencies")
    return name[1] if name else "", deps, dev, ""


def parse_requirements(text: str) -> tuple[str, list[str], list[str], str]:
    deps = [line.split("#")[0].strip() for line in text.splitlines()
            if line.strip() and not line.lstrip().startswith(("#", "-"))]
    return "", deps, [], ""


def parse_pom(text: str) -> tuple[str, list[str], list[str], str]:
    deps, dev = [], []
    for block in re.findall(r"<dependency>(.*?)</dependency>", text, re.S):
        group = re.search(r"<groupId>(.*?)</groupId>", block)
        artifact = re.search(r"<artifactId>(.*?)</artifactId>", block)
        version = re.search(r"<version>(.*?)</version>", block)
        if artifact:
            coordinate = f"{group[1] + ':' if group else ''}{artifact[1]}{'@' + version[1] if version else ''}"
            (dev if "<scope>test</scope>" in block else deps).append(coordinate)
    return "", deps, dev, ""


def parse_gradle(text: str) -> tuple[str, list[str], list[str], str]:
    deps, dev = [], []
    pattern = r"\b(implementation|api|compileOnly|runtimeOnly|kapt|annotationProcessor|testImplementation|" \
              r"testRuntimeOnly|androidTestImplementation)\s*\(?\s*[\"']([^\"']+)[\"']"
    for config, coordinate in re.findall(pattern, text):
        (dev if config.lower().startswith(("test", "androidtest")) else deps).append(coordinate)
    return "", deps, dev, ""


def parse_cargo(text: str) -> tuple[str, list[str], list[str], str]:
    name = re.search(r'^name\s*=\s*"([^"]+)"', text, re.M)
    return name[1] if name else "", toml_section_keys(text, "dependencies"), toml_section_keys(
        text, "dev-dependencies"), ""


def parse_gemfile(text: str) -> tuple[str, list[str], list[str], str]:
    gems = [f"{n}@{v}" if v else n for n, v in re.findall(r"""^\s*gem\s+['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?""",
                                                          text, re.M)]
    return "", gems, [], ""


def parse_composer(text: str) -> tuple[str, list[str], list[str], str]:
    data = json.loads(text)
    return (data.get("name", ""), [f"{k}@{v}" for k, v in (data.get("require") or {}).items()],
            [f"{k}@{v}" for k, v in (data.get("require-dev") or {}).items()], "")


MANIFEST_PARSERS = (
    (re.compile(r"(^|/)package\.json$"), "npm", parse_package_json),
    (re.compile(r"\.(csproj|fsproj|vbproj)$"), "nuget", parse_dotnet),
    (re.compile(r"(^|/)go\.mod$"), "go", parse_go_mod),
    (re.compile(r"(^|/)pyproject\.toml$"), "python", parse_pyproject),
    (re.compile(r"(^|/)requirements[^/]*\.txt$"), "python", parse_requirements),
    (re.compile(r"(^|/)pom\.xml$"), "maven", parse_pom),
    (re.compile(r"(^|/)build\.gradle(\.kts)?$"), "gradle", parse_gradle),
    (re.compile(r"(^|/)Cargo\.toml$"), "cargo", parse_cargo),
    (re.compile(r"(^|/)Gemfile$"), "ruby", parse_gemfile),
    (re.compile(r"(^|/)composer\.json$"), "php", parse_composer),
)


def depth(path: str) -> int:
    return path.count("/")


def area_of(path: str, project_dirs: list[str]) -> str:
    for project in project_dirs:
        if path.startswith(project + "/"):
            return project
    parts = path.split("/")
    return "/".join(parts[:2]) if len(parts) > 2 else parts[0]


def bullet_list(items: list[str], cap: int = LIST_CAP) -> list[str]:
    lines = [f"- {item}" for item in items[:cap]]
    if len(items) > cap:
        lines.append(f"- … {len(items) - cap} more")
    return lines


def recon_layout(files: list[str]) -> list[str]:
    extensions = collections.Counter(Path(f).suffix.lower() or Path(f).name for f in files)
    top = collections.Counter(f.split("/")[0] + ("/" if "/" in f else "") for f in files)
    second = collections.Counter("/".join(f.split("/")[:2]) + "/" for f in files if depth(f) >= 2)
    out = ["## Size and layout", f"- {len(files):,} tracked files; by extension: "
           + ", ".join(f"{ext} {n}" for ext, n in extensions.most_common(15))]
    out.append("- top level: " + ", ".join(f"{d} {n}" for d, n in top.most_common(LIST_CAP)))
    out.append("- second level: " + ", ".join(f"{d} {n}" for d, n in second.most_common(LIST_CAP)))
    return out


def recon_docs(files: list[str]) -> list[str]:
    agent = [f for f in files if AGENT_DOC.search(f)]
    human = [f for f in files if HUMAN_DOC.search(f) and not SKIPPED_SEGMENT.search(f)]
    adrs = [f for f in files if ADR.search(f)]
    tree = [f for f in files if DOCS_TREE.search(f) and f not in adrs and not SKIPPED_SEGMENT.search(f)]
    out = ["## Docs (read these before inferring anything)"]
    out += ["agent instructions:"] + bullet_list(agent) if agent else ["agent instructions: none"]
    out += ["readmes and project docs:"] + bullet_list(sorted(human, key=depth)) if human else []
    out += [f"docs folders ({len(tree)} files):"] + bullet_list(sorted(tree, key=depth)) if tree else []
    out += [f"decision records ({len(adrs)}):"] + bullet_list(adrs) if adrs else ["decision records: none found"]
    return out


def recon_manifests(root: Path, files: list[str]) -> tuple[list[str], list[str]]:
    summaries, project_dirs = [], []
    ecosystems: dict[str, dict[str, collections.Counter]] = collections.defaultdict(
        lambda: {"deps": collections.Counter(), "dev": collections.Counter()})
    for path in files:
        if SKIPPED_SEGMENT.search(path):
            continue
        for pattern, ecosystem, parser in MANIFEST_PARSERS:
            if not pattern.search(path):
                continue
            try:
                name, deps, dev, notes = parser((root / path).read_text(encoding="utf-8", errors="replace"))
            except (OSError, ValueError):
                summaries.append(f"{path} — unparsed")
                break
            ecosystems[ecosystem]["deps"].update(deps)
            ecosystems[ecosystem]["dev"].update(dev)
            label = f" — {name}" if name else ""
            extra = f" — {notes}" if notes else ""
            summaries.append(f"{path}{label} — {len(deps)} deps, {len(dev)} dev{extra}")
            parent = str(Path(path).parent)
            if parent != ".":
                project_dirs.append(parent)
            break
    out = [f"## Manifests ({len(summaries)})"] + bullet_list(sorted(summaries, key=depth), cap=40)
    for ecosystem, counters in ecosystems.items():
        for kind in ("deps", "dev"):
            names = sorted(counters[kind])
            if names:
                shown = ", ".join(names[:DEPENDENCY_CAP]) + (" …" if len(names) > DEPENDENCY_CAP else "")
                out.append(f"{ecosystem} {'runtime' if kind == 'deps' else 'dev'} ({len(names)}): {shown}")
    return out, project_dirs


def recon_projects(root: Path, files: list[str]) -> tuple[list[str], list[str]]:
    rows, dirs = [], []
    for path in files:
        if not path.endswith("project.json") or SKIPPED_SEGMENT.search(path):
            continue
        try:
            data = lenient_json((root / path).read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if not isinstance(data, dict) or "name" not in data:
            continue
        parent = str(Path(path).parent)
        dirs.append(parent)
        tags = f" — tags: {', '.join(data['tags'])}" if data.get("tags") else ""
        targets = f" — targets: {', '.join(data['targets'])}" if data.get("targets") else ""
        rows.append(f"{data['name']} ({data.get('projectType', '?')}) {parent}{tags}{targets}")
    return ([f"## Workspace projects ({len(rows)})"] + bullet_list(rows, cap=60)) if rows else [], dirs


def recon_tooling(root: Path, files: list[str]) -> list[str]:
    found = [f for f in files if Path(f).name in TOOLING and depth(f) <= TOOLING_MAX_DEPTH]
    out = ["## Tooling and config"] + (bullet_list(sorted(found, key=depth), cap=40) or ["- none recognised"])
    for path in found:
        name = Path(path).name
        if name in RUNTIME_PINS:
            first_line = (root / path).read_text(encoding="utf-8", errors="replace").strip().splitlines()[:1]
            out.append(f"runtime pin {path}: {first_line[0] if first_line else '(empty)'}")
        if name in ("tsconfig.base.json", "tsconfig.json") and depth(path) <= 1:
            try:
                paths = lenient_json((root / path).read_text(encoding="utf-8"))["compilerOptions"]["paths"]
            except (OSError, ValueError, KeyError, TypeError):
                continue
            aliases = [f"{alias} → {targets[0] if targets else '?'}" for alias, targets in paths.items()]
            out.append(f"import aliases in {path} ({len(aliases)}):")
            out += bullet_list(aliases, cap=40)
    return out


def ci_outline(text: str) -> str:
    azure = re.findall(r"^\s*-\s*(?:stage|job|deployment|template):\s*(\S+)", text, re.M)
    jobs = re.search(r"^jobs:\s*$(.*?)(?=^\S|\Z)", text, re.M | re.S)
    github = re.findall(r"^  ([\w-]+):\s*$", jobs[1], re.M) if jobs else []
    names = azure or github
    return (" — " + ", ".join(names[:12]) + (" …" if len(names) > 12 else "")) if names else ""


def recon_delivery(root: Path, files: list[str]) -> list[str]:
    out = ["## CI/CD and infrastructure"]
    ci = [f for f in files if CI_FILE.search(f)]
    for path in ci[:LIST_CAP]:
        try:
            outline = ci_outline((root / path).read_text(encoding="utf-8", errors="replace"))
        except OSError:
            outline = ""
        out.append(f"- {path}{outline}")
    if not ci:
        out.append("- no CI config recognised")
    infra = [f for f in files if INFRA_FILE.search(f) and not SKIPPED_SEGMENT.search(f)]
    if infra:
        out.append(f"infra files ({len(infra)}):")
        out += bullet_list(infra)
    return out


def recon_tests(files: list[str], project_dirs: list[str]) -> list[str]:
    configs = [f for f in files if TEST_CONFIG.search(f) and not SKIPPED_SEGMENT.search(f)]
    tests = [f for f in files if TEST_FILE.search(f)]
    variants = collections.Counter(".".join(Path(f).name.split(".")[-3:]) for f in tests)
    by_area = collections.Counter(area_of(f, project_dirs) for f in tests)
    out = ["## Tests", f"- {len(tests)} test files; naming variants: "
           + ", ".join(f"*.{v} {n}" for v, n in variants.most_common(12))]
    out.append("- by area: " + ", ".join(f"{a} {n}" for a, n in by_area.most_common(LIST_CAP)))
    out += ["configs:"] + bullet_list(configs, cap=40) if configs else ["configs: none recognised"]
    return out


def recon_entry_points(files: list[str], project_dirs: list[str]) -> list[str]:
    found = []
    for path in files:
        name = Path(path).name
        if name not in ENTRY_NAMES or SKIPPED_SEGMENT.search(path):
            continue
        area = area_of(path, project_dirs)
        relative_depth = depth(path[len(area) + 1:]) if path.startswith(area + "/") else depth(path)
        limit = 1 if name in SHALLOW_ONLY else ENTRY_MAX_DEPTH
        if relative_depth <= limit:
            found.append(path)
    return ["## Likely entry points"] + (bullet_list(found, cap=40) or ["- none recognised"])


def recon_activity(root: Path, project_dirs: list[str], days: int) -> list[str]:
    log = git(root, "log", f"--since={days}.days", "--no-merges", "--pretty=format:@@%h\t%an", "--name-only")
    commits, authors = 0, collections.Counter()
    area_commits, area_authors = collections.Counter(), collections.defaultdict(collections.Counter)
    file_changes = collections.Counter()
    current_author, current_areas = "", set()

    def close_commit() -> None:
        for area in current_areas:
            area_commits[area] += 1
            area_authors[area][current_author] += 1

    for line in log.splitlines():
        if line.startswith("@@"):
            close_commit()
            commits += 1
            current_author = line.split("\t", 1)[1] if "\t" in line else "?"
            authors[current_author] += 1
            current_areas = set()
        elif line.strip():
            current_areas.add(area_of(line, project_dirs))
            if not LOCKFILE.search(line):
                file_changes[line] += 1
    close_commit()
    first = git(root, "log", "--reverse", "--format=%ad", "--date=short", "--max-parents=0", "HEAD").split()
    out = [f"## Git activity (last {days} days, merges excluded)",
           f"- {commits} commits by {len(authors)} authors; history starts {first[0] if first else '?'}"]
    if area_commits:
        out.append("busiest areas (commits; most active people — ask them about it):")
        for area, count in area_commits.most_common(15):
            people = ", ".join(name for name, _ in area_authors[area].most_common(TOP_AUTHORS_PER_AREA))
            out.append(f"- {area}: {count} ({people})")
    if file_changes:
        out.append("most-changed files:")
        out += bullet_list([f"{path} ({n})" for path, n in file_changes.most_common(15)])
    recent = git(root, "log", "-20", "--no-merges", "--format=%ad  %s", "--date=short", "HEAD").splitlines()
    if recent:
        out += ["recent commits:"] + [f"- {line}" for line in recent]
    return out


def grep_counts(root: Path, pattern: str, project_dirs: list[str]) -> collections.Counter:
    _, out = run(["git", "-C", str(root), "grep", "-I", "-c", "-E", pattern])
    counts = collections.Counter()
    for line in out.splitlines():
        path, _, count = line.rpartition(":")
        if path and count.isdigit() and not SKIPPED_SEGMENT.search(path):
            counts[area_of(path, project_dirs)] += int(count)
    return counts


def recon_markers(root: Path, project_dirs: list[str]) -> list[str]:
    markers = grep_counts(root, MARKER, project_dirs)
    deprecations = grep_counts(root, DEPRECATION, project_dirs)
    out = ["## Debt markers"]
    out.append(f"- TODO/FIXME/HACK/XXX: {sum(markers.values())} — "
               + ", ".join(f"{a} {n}" for a, n in markers.most_common(10)))
    out.append(f"- deprecations: {sum(deprecations.values())} — "
               + ", ".join(f"{a} {n}" for a, n in deprecations.most_common(10)))
    return out


JS_SOURCE = (".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts")
JS_IMPORT = re.compile(r"""(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|^\s*import\s+)['"]([^'"\n]+)['"]""", re.M)
FAN_IN_SHOWN = 25


def ts_aliases(root: Path, files: list[str]) -> list[tuple[str, str]]:
    """(alias pattern, target pattern from the git root) for every tsconfig `paths` entry near the top."""
    aliases = []
    for path in files:
        if Path(path).name not in ("tsconfig.base.json", "tsconfig.json") or depth(path) > 1:
            continue
        try:
            options = lenient_json((root / path).read_text(encoding="utf-8")).get("compilerOptions", {})
        except (OSError, ValueError):
            continue
        base = (Path(path).parent / options.get("baseUrl", ".")).as_posix()
        for alias, targets in (options.get("paths") or {}).items():
            if targets:
                aliases.append((alias, os.path.normpath(f"{base}/{targets[0]}").replace(os.sep, "/")))
    return aliases


def resolve_js_import(spec: str, importer: str, aliases: list[tuple[str, str]], known: set[str]) -> str | None:
    if spec.startswith("."):
        candidate = os.path.normpath(f"{Path(importer).parent.as_posix()}/{spec}").replace(os.sep, "/")
    else:
        candidate = None
        for alias, target in aliases:
            if alias.endswith("/*") and spec.startswith(alias[:-1]):
                candidate = target.replace("*", spec[len(alias) - 1:])
                break
            if spec == alias:
                candidate = target
                break
        if candidate is None:
            return None
    for option in (candidate, *(candidate + ext for ext in JS_SOURCE), *(f"{candidate}/index{ext}" for ext in JS_SOURCE)):
        if option in known:
            return option
    return None


def recon_fan_in(root: Path, files: list[str]) -> list[str]:
    sources = [f for f in files if f.endswith(JS_SOURCE) and not f.endswith(".d.ts")
               and not TEST_FILE.search(f) and not SKIPPED_SEGMENT.search(f)]
    if not sources:
        return []
    known, aliases, importers = set(files), ts_aliases(root, files), collections.defaultdict(set)
    for path in sources:
        try:
            text = (root / path).read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for spec in JS_IMPORT.findall(text):
            target = resolve_js_import(spec, path, aliases, known)
            if target and target != path:
                importers[target].add(path)
    ranked = sorted(importers.items(), key=lambda item: -len(item[1]))
    barrels = [f"{path} ({len(users)})" for path, users in ranked if Path(path).stem == "index"][:10]
    modules = [f"{path} ({len(users)})" for path, users in ranked if Path(path).stem != "index"][:FAN_IN_SHOWN]
    out = ["## Most-imported files (JS/TS fan-in from non-test code: the load-bearing modules)"] + bullet_list(modules)
    if barrels:
        out.append("barrel files re-exporting a library (cite the implementing file, not these): " + ", ".join(barrels))
    return out


def cmd_recon(args: argparse.Namespace) -> None:
    root = find_repo_root(args.repo)
    files = tracked_files(root)
    facts = repo_facts(root)
    manifest_lines, manifest_dirs = recon_manifests(root, files)
    project_lines, project_dirs = recon_projects(root, files)
    areas = sorted(set(project_dirs + manifest_dirs), key=lambda d: (-depth(d), d))
    web = facts["web"]
    sections = [
        [f"# Recon: {facts['repo']}",
         f"- root {root} · branch {facts['branch']} · HEAD {facts['commit'][:SHORT_SHA]}"
         f"{' · default branch ' + facts['defaultBranch'] if facts['defaultBranch'] else ''}",
         f"- web {web['base'] if web else 'unknown host'} · generated {facts['generated']}"],
        recon_layout(files), recon_docs(files), project_lines, manifest_lines, recon_tooling(root, files),
        recon_delivery(root, files), recon_tests(files, areas), recon_entry_points(files, areas),
        recon_fan_in(root, files), recon_activity(root, areas, args.days), recon_markers(root, areas),
    ]
    report = "\n\n".join("\n".join(section) for section in sections if section) + "\n"
    print(report)
    ws = find_workspace(root, args.out)
    if ws.exists():
        (ws / "notes").mkdir(parents=True, exist_ok=True)
        write_atomic(ws / "notes" / "recon.md", report)
        print(f"(saved to {ws / 'notes' / 'recon.md'})")


# ── page parsing ─────────────────────────────────────────────────────────────

CODE_INLINE_TAGS = {"code", "span", "mark", "b", "strong", "em", "i", "a", "br"}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title, self.meta, self.ids = "", {}, set()
        self.links: list[tuple[int, str]] = []
        self.citations: list[dict] = []
        self.excerpts: list[dict] = []
        self.diagrams: list[dict] = []
        self.figure_issues: list[tuple[int, str]] = []
        self._in_title = False
        self._excerpt: dict | None = None
        self._pre_depth = 0
        self._mermaid: dict | None = None
        self._figures: list[dict] = []
        self._inline: dict | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = {key: value or "" for key, value in attrs}
        line = self.getpos()[0]
        if self._mermaid is not None:
            if tag != "br":
                self._mermaid["tags"].append(tag)
            return
        classes = set(attributes.get("class", "").split())
        if attributes.get("id"):
            self.ids.add(attributes["id"])
        if tag == "title":
            self._in_title = True
        if tag == "meta" and attributes.get("name"):
            self.meta[attributes["name"]] = attributes.get("content", "")
        for key in ("href", "src"):
            if attributes.get(key) and tag in ("a", "link", "script", "img", "source", "iframe"):
                self.links.append((line, attributes[key]))
        if tag == "img" and "alt" not in attributes:
            self.figure_issues.append((line, "img without alt text"))
        if tag == "figure":
            self._figures.append({"line": line, "classes": classes, "caption": False})
        if tag == "figcaption" and self._figures:
            self._figures[-1]["caption"] = True
        if tag == "svg" and self._figures and "diagram" in self._figures[-1]["classes"] and not (
                attributes.get("aria-label") or attributes.get("aria-labelledby")):
            self.figure_issues.append((line, "inline svg diagram without aria-label"))
        if "data-src" in attributes:
            record = {"line": line, "tag": tag, "src": attributes["data-src"].strip(), "text": "",
                      "commit": attributes.get("data-commit", "").strip()}
            self.citations.append(record)
            if tag == "figure" and "code" in classes:
                self._excerpt = {**record, "text": [], "stray_tags": []}
            if tag == "a":
                self._inline = record
        if self._excerpt is not None and tag == "pre":
            self._pre_depth += 1
        elif self._excerpt is not None and self._pre_depth and tag not in CODE_INLINE_TAGS:
            self._excerpt["stray_tags"].append(tag)
        if "mermaid" in classes and tag in ("pre", "div"):
            self._mermaid = {"line": line, "tag": tag, "text": [], "tags": []}

    def handle_endtag(self, tag: str) -> None:
        if self._mermaid is not None:
            if tag == self._mermaid["tag"]:
                self.diagrams.append(self._mermaid)
                self._mermaid = None
            return
        if tag == "title":
            self._in_title = False
        if tag == "a":
            self._inline = None
        if self._excerpt is not None and tag == "pre":
            self._pre_depth = max(0, self._pre_depth - 1)
        if tag == "figure" and self._figures:
            figure = self._figures.pop()
            if "diagram" in figure["classes"] and not figure["caption"]:
                self.figure_issues.append((figure["line"], "diagram figure without a figcaption stating its claim"))
            if self._excerpt is not None and "code" in figure["classes"]:
                self.excerpts.append(self._excerpt)
                self._excerpt, self._pre_depth = None, 0

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title += data
        if self._inline is not None:
            self._inline["text"] += data
        if self._mermaid is not None:
            self._mermaid["text"].append(data)
        elif self._excerpt is not None and self._pre_depth:
            self._excerpt["text"].append(data)


def parse_page(path: Path) -> PageParser:
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8", errors="replace"))
    parser.close()
    return parser


# ── check ────────────────────────────────────────────────────────────────────

SRC = re.compile(r"^(?P<path>[^:]+?)(?::(?P<start>\d+)(?:-(?P<end>\d+))?)?$")
FULL_SHA = re.compile(r"^[0-9a-f]{40}$")
ELISION = re.compile(r"^\s*(?:…|\.\.\.|(?://|#|--|;|\*)\s*(?:…|\.\.\.)|/\*\s*(?:…|\.\.\.)\s*\*/|"
                     r"<!--\s*(?:…|\.\.\.)\s*-->|\{/\*\s*(?:…|\.\.\.)\s*\*/\})\s*$")
EXTERNAL_LINK = re.compile(r"^(?:[a-z][a-z0-9+.\-]*:|//)", re.I)
REQUIRED_ASSETS = ("assets/onboarding.css", "assets/site.js", "assets/onboarding.js")
MERMAID_TYPES = ("flowchart", "graph", "sequenceDiagram", "classDiagram", "stateDiagram", "stateDiagram-v2",
                 "erDiagram", "journey", "gantt", "pie", "gitGraph", "mindmap", "timeline", "quadrantChart",
                 "requirementDiagram", "C4Context", "C4Container", "C4Component", "C4Dynamic", "C4Deployment",
                 "sankey-beta", "xychart-beta", "block-beta", "packet-beta", "architecture-beta", "kanban",
                 "radar-beta", "treemap-beta")
NODE_OPENERS = (("[[", "]]"), ("[(", ")]"), ("((", "))"), ("([", "])"), ("{{", "}}"), ("[/", "/]"),
                ("[\\", "\\]"), ("[", "]"), ("(", ")"), ("{", "}"))
NODE_START = re.compile(r"(?<![\w\"#&])([A-Za-z_][\w]*)(?=\[|\(|\{)")
LABEL_BREAKERS = set('()[]{}"<>;|@')
FLOW_SKIP = re.compile(r"^\s*(%%|classDef\b|class\b|style\b|linkStyle\b|click\b|direction\b|flowchart\b|graph\b)")
ALLOWED_LABEL_HTML = re.compile(r"</?(br|b|i|em|strong|sub|sup|u|small)\s*/?>", re.I)
SEQUENCE_KEYWORDS = re.compile(r"^\s*(participant|actor|note|alt|else|opt|loop|par|and|rect|critical|break|end|"
                               r"activate|deactivate|autonumber|box|create|destroy|title|%%)\b", re.I)


class Report:
    def __init__(self) -> None:
        self.errors = 0
        self.warnings = 0
        self.lines: list[str] = []

    def add(self, level: str, line: int, message: str) -> None:
        if level == "ERROR":
            self.errors += 1
        else:
            self.warnings += 1
        self.lines.append(f"  {level:<5} L{line:<5} {message}")


def file_lines(root: Path, rel: str, cache: dict, commit: str = "") -> list[str] | None:
    """The file's lines on disk, or at a commit when the citation is pinned to one."""
    key = (commit, rel)
    if key not in cache:
        if commit:
            code, out = run(["git", "-C", str(root), "show", f"{commit}:{rel}"])
            cache[key] = out.splitlines() if code == 0 else None
        else:
            target = root / rel
            cache[key] = target.read_text(encoding="utf-8", errors="replace").splitlines() if target.is_file() else None
    return cache[key]


def content_lines(lines: list[str], offset: int) -> list[tuple[int, str]]:
    return [(offset + i, line.strip()) for i, line in enumerate(lines) if line.strip()]


def find_chunk(window: list[tuple[int, str]], chunk: list[str], start: int) -> int:
    for i in range(start, len(window) - len(chunk) + 1):
        if all(window[i + j][1] == chunk[j] for j in range(len(chunk))):
            return i
    return -1


def excerpt_chunks(text: str) -> list[list[str]]:
    chunks, current = [], []
    for raw in text.strip("\n").split("\n"):
        if ELISION.match(raw):
            if current:
                chunks.append(current)
            current = []
        elif raw.strip():
            current.append(raw.strip())
    if current:
        chunks.append(current)
    return chunks


def closest_mismatch(window: list[tuple[int, str]], chunk: list[str], start: int) -> str:
    """Describe where the chunk diverges from its best-matching position in the window."""
    best_index, best_length = start, -1
    for i in range(start, len(window)):
        length = 0
        while length < len(chunk) and i + length < len(window) and window[i + length][1] == chunk[length]:
            length += 1
        if length > best_length:
            best_index, best_length = i, length
    if best_length <= 0 or best_index + best_length >= len(window):
        return f"first unmatched line: {chunk[max(best_length, 0)][:80]!r}"
    number, actual = window[best_index + best_length]
    return f"excerpt has {chunk[best_length][:70]!r} where line {number} is {actual[:70]!r}"


def match_chunks(window: list[tuple[int, str]], chunks: list[list[str]]) -> tuple[int, int] | str:
    """Line span the chunks occupy, in order, inside the window; else where the first failing chunk diverges."""
    position, span = 0, []
    for chunk in chunks:
        index = find_chunk(window, chunk, position)
        if index < 0:
            return closest_mismatch(window, chunk, position)
        span += [window[index][0], window[index + len(chunk) - 1][0]]
        position = index + len(chunk)
    return span[0], span[-1]


def check_excerpt(excerpt: dict, lines: list[str], start: int, end: int, report: Report) -> None:
    if excerpt["stray_tags"]:
        report.add("ERROR", excerpt["line"], f"{excerpt['src']}: raw markup <{excerpt['stray_tags'][0]}> inside the "
                                             "code — escape < > & as &lt; &gt; &amp;")
        return
    chunks = excerpt_chunks("".join(excerpt["text"]))
    if not chunks:
        report.add("ERROR", excerpt["line"], f"{excerpt['src']}: code figure has no code inside <pre>")
        return
    window = content_lines(lines[start - 1:end], start)
    matched = match_chunks(window, chunks)
    if isinstance(matched, str):
        elsewhere = match_chunks(content_lines(lines, 1), chunks)
        hint = (f" — it is at lines {elsewhere[0]}-{elsewhere[1]}, cite that" if isinstance(elsewhere, tuple) else
                f" — {matched}; copy lines verbatim and mark gaps with a // … line")
        report.add("ERROR", excerpt["line"], f"{excerpt['src']}: excerpt does not match the source{hint}")
        return
    first, last = matched
    uncovered = [number for number, _ in window if number < first or number > last]
    if len(chunks) == 1 and uncovered:
        report.add("WARN", excerpt["line"], f"{excerpt['src']}: excerpt shows only lines {first}-{last} of the cited "
                                            "range — narrow data-src to match")


def check_citations(page: PageParser, root: Path, cache: dict, report: Report) -> None:
    excerpts = {(e["line"], e["src"]): e for e in page.excerpts}
    for citation in page.citations:
        match = SRC.match(citation["src"])
        rel = match["path"].lstrip("./") if match else ""
        if not match or citation["src"].startswith("/") or ".." in rel.split("/"):
            report.add("ERROR", citation["line"], f"data-src {citation['src']!r}: use <path from git root>[:start[-end]]")
            continue
        commit = citation["commit"]
        if commit and not FULL_SHA.match(commit):
            report.add("ERROR", citation["line"], f"data-commit {commit!r}: use the full 40-character SHA")
            continue
        lines = file_lines(root, rel, cache, commit)
        if lines is None:
            where = f"at commit {commit[:SHORT_SHA]} (is it in this clone?)" if commit else f"under {root}"
            report.add("ERROR", citation["line"], f"data-src {citation['src']!r}: no such file {where}")
            continue
        excerpt = excerpts.get((citation["line"], citation["src"]))
        if not match["start"]:
            if excerpt is not None:
                report.add("ERROR", citation["line"], f"data-src {citation['src']!r}: code excerpts need a line range")
            continue
        start = int(match["start"])
        end = int(match["end"]) if match["end"] else start
        if not 1 <= start <= end <= len(lines):
            report.add("ERROR", citation["line"], f"data-src {citation['src']!r}: lines out of range (file has {len(lines)})")
            continue
        if excerpt is not None:
            check_excerpt(excerpt, lines, start, end, report)
        symbol = cited_symbol(citation, rel)
        if symbol and not any(symbol in line for line in lines[start - 1:end]):
            found = next((n for n, line in enumerate(lines, 1) if symbol in line), None)
            version = f"the file at {commit[:SHORT_SHA]}" if commit else "the file"
            hint = f" — it first appears on line {found}" if found else f" — it does not appear in {version} at all"
            report.add("ERROR", citation["line"], f"data-src {citation['src']!r}: cited lines do not contain {symbol!r}{hint}")


SYMBOL_TEXT = re.compile(r"^[A-Za-z_$@][\w$]*(?:\.[A-Za-z_$][\w$]*)*(?:\(\))?$")


def cited_symbol(citation: dict, rel: str) -> str | None:
    """The identifier an inline reference names, which the cited lines must contain."""
    text = citation["text"].strip()
    if citation["tag"] != "a" or not SYMBOL_TEXT.match(text) or text == Path(rel).name:
        return None
    return text.removesuffix("()").split(".")[-1].lstrip("@")


def check_links(page_path: Path, page: PageParser, ws: Path, report: Report, ids_cache: dict) -> None:
    resolved_assets = set()
    for line, link in page.links:
        if EXTERNAL_LINK.match(link):
            continue
        target, _, fragment = link.partition("#")
        if not target:
            if fragment and fragment not in page.ids:
                report.add("ERROR", line, f"link #{fragment}: no element with that id on this page")
            continue
        resolved = (page_path.parent / target).resolve()
        if not resolved.exists():
            report.add("ERROR", line, f"link {link!r}: {resolved} does not exist")
            continue
        try:
            resolved_assets.add(resolved.relative_to(ws).as_posix())
        except ValueError:
            pass
        if fragment and resolved.suffix == ".html":
            if resolved not in ids_cache:
                ids_cache[resolved] = parse_page(resolved).ids
            if fragment not in ids_cache[resolved]:
                report.add("ERROR", line, f"link {link!r}: no id {fragment!r} in {resolved.name}")
    missing = [asset for asset in REQUIRED_ASSETS if asset not in resolved_assets]
    if missing:
        report.add("ERROR", 1, f"page does not load {', '.join(missing)} — copy the head from the template")


def node_label_issues(line: str) -> list[str]:
    issues = []
    for match in NODE_START.finditer(line):
        node, rest = match.group(1), line[match.end():]
        shape = next(((o, c) for o, c in NODE_OPENERS if rest.startswith(o)), None)
        if shape is None:
            continue
        opener, closer = shape
        body = rest[len(opener):]
        if body.lstrip().startswith('"'):
            continue
        end = body.find(closer)
        label = body if end < 0 else body[:end]
        if LABEL_BREAKERS & set(label):
            issues.append(f'node {node}: unquoted label {label.strip()[:40]!r} has punctuation — write {node}{opener}"…"{closer}')
    return issues


def lint_mermaid(diagram: dict, report: Report) -> None:
    line0 = diagram["line"]
    if diagram["tags"]:
        report.add("ERROR", line0, f"mermaid: raw <{diagram['tags'][0]}> in the source is swallowed by the browser — "
                                   "write #lt; and #gt; for angle brackets")
    text = "".join(diagram["text"])
    lines = [line for line in text.split("\n")]
    body = [line for line in lines if line.strip() and not line.strip().startswith("%%")]
    if not body:
        report.add("ERROR", line0, "mermaid: empty diagram")
        return
    kind = body[0].split()[0]
    if kind not in MERMAID_TYPES:
        report.add("ERROR", line0, f"mermaid: unknown diagram type {kind!r}")
        return
    for offset, raw in enumerate(lines):
        where = line0 + offset
        if re.search(r"<(?!/?(br|b|i|em|strong|sub|sup|u|small)\b)[A-Za-z]", ALLOWED_LABEL_HTML.sub("", raw)):
            report.add("ERROR", where, "mermaid: '<' before a letter (a generic like List<T>?) — write #lt; and #gt;")
        if kind in ("flowchart", "graph") and not FLOW_SKIP.match(raw):
            for issue in node_label_issues(raw):
                report.add("ERROR", where, f"mermaid: {issue}")
            if re.search(r"(-->|---|==>|-\.->|--)\s*end\b|^\s*end\s*[\[\(\{]", raw):
                report.add("ERROR", where, "mermaid: 'end' is reserved in flowcharts — rename the node")
            for label in re.findall(r"\|([^|\"]+)\|", raw):
                if set("()[]{}@") & set(label):
                    report.add("ERROR", where, f"mermaid: edge label {label[:40]!r} has punctuation — quote it: |\"…\"|")
        if kind == "sequenceDiagram" and not SEQUENCE_KEYWORDS.match(raw):
            arrow = re.match(r"^\s*([^:]+?)\s*(-{1,2}>>|-{1,2}>|-{1,2}x|-{1,2}\))\s*[+-]?([^:]+?)\s*:(.*)$", raw)
            if arrow and (" " in arrow.group(1).strip() or " " in arrow.group(3).strip()):
                report.add("ERROR", where, "mermaid: participant names with spaces need an alias "
                                           "(participant API as Order API)")
            if arrow and ";" in re.sub(r"#\w+;", "", arrow.group(4)):
                report.add("ERROR", where, "mermaid: ';' in a message breaks the diagram — write #59;")


def page_paths(ws: Path, requested: list[str]) -> list[Path]:
    if requested:
        return [Path(p).resolve() if Path(p).exists() or Path(p).is_absolute() else (ws / p).resolve()
                for p in requested]
    return sorted(p for p in ws.rglob("*.html")
                  if not p.relative_to(ws).as_posix().startswith(("assets/", "notes/")) and p != ws / "index.html")


def changed_since(root: Path, commit: str, cache: dict) -> set[str] | None:
    """Files changed between a page's commit and HEAD; None when the commit is unknown here."""
    if commit not in cache:
        code, out = run(["git", "-C", str(root), "diff", "--name-only", commit, "HEAD"])
        cache[commit] = set(out.split()) if code == 0 else None
    return cache[commit]


def check_freshness(page: PageParser, root: Path, head: str, cache: dict, report: Report) -> list[str]:
    commit = page.meta.get("onboarding:commit", "").strip()
    if not commit:
        report.add("WARN", 1, 'missing <meta name="onboarding:commit"> — web links fall back to HEAD')
        return []
    if commit == head:
        return []
    changed = changed_since(root, commit, cache)
    if changed is None:
        report.add("WARN", 1, f"page commit {commit[:SHORT_SHA]} is not in this clone — cannot tell what drifted")
        return []
    cited = {match["path"].lstrip("./") for c in page.citations if not c["commit"] and (match := SRC.match(c["src"]))}
    stale = sorted(cited & changed)
    if stale:
        report.add("WARN", 1, f"{len(stale)} cited files changed since {commit[:SHORT_SHA]}: {', '.join(stale[:6])}"
                              f"{' …' if len(stale) > 6 else ''} — re-verify those claims, then set onboarding:commit to HEAD")
    return stale


def check_page(path: Path, root: Path, ws: Path, head: str, caches: dict) -> tuple[Report, dict]:
    page, report = parse_page(path), Report()
    if not page.title.strip():
        report.add("ERROR", 1, "missing <title>")
    if not page.meta.get("description"):
        report.add("WARN", 1, 'missing <meta name="description"> — the hub shows it on the card')
    check_citations(page, root, caches["files"], report)
    check_links(path, page, ws, report, caches["ids"])
    for diagram in page.diagrams:
        lint_mermaid(diagram, report)
    for line, issue in page.figure_issues:
        report.add("WARN", line, issue)
    if not page.citations:
        report.add("WARN", 1, "page cites no code — claims about the code need data-src citations")
    stale = check_freshness(page, root, head, caches["diffs"], report)
    stats = {"checked": dt.date.today().isoformat(), "head": head, "citations": len(page.citations),
             "excerpts": len(page.excerpts), "diagrams": len(page.diagrams), "errors": report.errors,
             "warnings": report.warnings, "stale": stale}
    return report, stats


def cmd_check(args: argparse.Namespace) -> None:
    root = find_repo_root(args.repo)
    ws = find_workspace(root, args.out)
    if not ws.exists():
        sys.exit(f"error: no workspace at {ws} — run init first")
    sys.exit(1 if check_pages(root, ws, page_paths(ws, args.pages)) else 0)


def check_pages(root: Path, ws: Path, pages: list[Path]) -> int:
    """Check and report each page, record the results, rebuild the hub; return the error count."""
    head = git(root, "rev-parse", "HEAD").strip()
    caches: dict = {"files": {}, "ids": {}, "diffs": {}}
    results: dict = {}
    total_errors = total_warnings = 0
    for path in pages:
        if not path.exists():
            print(f"✗ {path}: no such page")
            total_errors += 1
            continue
        report, stats = check_page(path, root, ws, head, caches)
        try:
            rel = path.relative_to(ws).as_posix()
            results[rel] = stats
        except ValueError:
            rel = str(path)
        summary = f"{stats['citations']} citations, {stats['excerpts']} excerpts, {stats['diagrams']} mermaid diagrams"
        print(f"{'✗' if report.errors else '✓'} {rel} — {summary}"
              + (f", {report.errors} errors" if report.errors else "")
              + (f", {report.warnings} warnings" if report.warnings else ""))
        for line in report.lines:
            print(line)
        total_errors += report.errors
        total_warnings += report.warnings
    merge_check_results(ws, results)
    built = build_hub(ws, repo_facts(root))
    print(f"\n{len(pages)} pages checked: {total_errors} errors, {total_warnings} warnings. "
          f"Hub rebuilt with {len(built)} pages: {ws / 'index.html'}")
    return total_errors


# ── hub ──────────────────────────────────────────────────────────────────────

DIR_GROUPS = {"guide": "Guide", "faq": "Questions", "deep-dives": "Deep dives", "changes": "How we change things"}
GROUP_ORDER = {group: rank for rank, group in enumerate(DIR_GROUPS.values())}
LEARN_GROUP_RANK = len(GROUP_ORDER)
OTHER_GROUP_RANK = LEARN_GROUP_RANK + 1
NUMBERED = re.compile(r"^(\d+)")
HUB_COMMANDS = (
    ("/onboard", "Generate or refresh the big-picture guide."),
    ("/deep-dive <area or question>", "Explain one feature, flow or module end to end."),
    ("/learn-stack <technology>", "Learn a technology through this repo's own code, one lesson at a time."),
    ("/ask <question>", "Get a short cited answer, saved to the questions page."),
    ("/how-we-change-things", "See how real merged changes moved through the codebase, as worked examples."),
)


def page_group(rel: str, meta: dict) -> tuple[str, str]:
    parts = rel.split("/")
    if meta.get("onboarding:group"):
        group = meta["onboarding:group"]
    elif parts[0] in DIR_GROUPS and len(parts) > 1:
        group = DIR_GROUPS[parts[0]]
    elif parts[0] == "learn" and len(parts) > 2:
        group = "Learn " + parts[1][:1].upper() + parts[1][1:]
    else:
        group = "Other"
    kind = "reference" if "reference" in parts[:-1] else "page"
    return group, kind


def group_rank(group: str) -> int:
    if group in GROUP_ORDER:
        return GROUP_ORDER[group]
    return LEARN_GROUP_RANK if group.startswith("Learn") else OTHER_GROUP_RANK


def collect_pages(ws: Path, repo: str) -> list[dict]:
    results = read_check_results(ws)
    suffix = re.compile(rf"\s+[—–|-]\s+{re.escape(repo)}$")
    pages = []
    for path in page_paths(ws, []):
        rel = path.relative_to(ws).as_posix()
        page = parse_page(path)
        group, kind = page_group(rel, page.meta)
        order = page.meta.get("onboarding:order", "")
        number = NUMBERED.match(path.name)
        title = suffix.sub("", html.unescape(page.title.strip())) or path.stem
        pages.append({"path": rel, "title": title, "description": page.meta.get("description", ""),
                      "group": group, "kind": kind, "check": results.get(rel),
                      "sort": (group_rank(group), group, kind == "reference",
                               int(order) if order.isdigit() else int(number[1]) if number else 0, title.lower())})
    pages.sort(key=lambda p: p["sort"])
    for page in pages:
        del page["sort"]
    return pages


def card_kicker(page: dict) -> str:
    number = NUMBERED.match(Path(page["path"]).name)
    if page["kind"] == "reference":
        return "Reference"
    if page["group"].startswith("Learn") and number:
        return "Syllabus" if int(number[1]) == 0 else f"Lesson {int(number[1])}"
    if page["group"] == "Guide" and number:
        return f"Guide · {int(number[1]):02d}"
    if page["group"] == "How we change things":
        return "Overview" if number and int(number[1]) == 0 else "Worked change"
    return "Deep dive" if page["group"] == "Deep dives" else page["group"]


def hub_html(facts: dict, pages: list[dict]) -> str:
    esc = html.escape
    groups: dict[str, list[dict]] = {}
    for page in pages:
        groups.setdefault(page["group"], []).append(page)
    sections = []
    start = next((p for p in pages if p["group"] == "Guide"), None)
    if start:
        sections.append(f'<aside class="callout tip"><strong>Start here</strong><p><a href="{esc(start["path"])}">'
                        f'{esc(start["title"])}</a> — {esc(start["description"])}</p></aside>')
    for group, members in groups.items():
        cards = "\n".join(
            f'<a class="card link" href="{esc(p["path"])}"><span class="kicker">{esc(card_kicker(p))}</span>'
            f'<strong>{esc(p["title"])}</strong><span>{esc(p["description"])}</span></a>' for p in members)
        slug = re.sub(r"[^a-z0-9]+", "-", group.lower()).strip("-")
        sections.append(f'<section id="{slug}"><h2>{esc(group)}</h2><div class="grid">\n{cards}\n</div></section>')
    if not pages:
        sections.append('<aside class="callout note"><strong>Nothing here yet</strong>'
                        '<p>Run <code>/onboard</code> to generate the guide.</p></aside>')
    commands = "\n".join(f"<tr><td><code>{esc(c)}</code></td><td>{esc(d)}</td></tr>" for c, d in HUB_COMMANDS)
    sections.append(f'<section id="make-more"><h2>Make more</h2><table><tbody>\n{commands}\n</tbody></table>'
                    '<p class="muted">Every page links its claims to the code. Re-run '
                    '<code>onboarding.py check</code> after pulling to find pages that have drifted.</p></section>')
    short = facts["commit"][:SHORT_SHA]
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Onboarding — {esc(facts['repo'])}</title>
<meta name="description" content="Everything generated to help you find your way around {esc(facts['repo'])}.">
<link rel="stylesheet" href="assets/onboarding.css">
<script src="assets/site.js"></script>
<script defer src="assets/onboarding.js"></script>
</head>
<body class="hub">
<main class="page">
<header class="page-head">
<p class="eyebrow">Onboarding · {esc(facts['repo'])}</p>
<h1>Find your way around <span class="accent">{esc(facts['repo'])}</span></h1>
<p class="lede">Guides, deep dives and lessons built from this repository's own code at commit
<code>{esc(short)}</code>. Every code reference opens the source.</p>
</header>
{chr(10).join(sections)}
</main>
</body>
</html>
"""


EARLY_THEME = ("(function () { var saved = null; try { saved = localStorage.getItem('onboarding-theme'); } catch (e) {}\n"
               "  document.documentElement.dataset.theme = saved || (matchMedia('(prefers-color-scheme: dark)').matches"
               " ? 'dark' : 'light'); })();\n")


def build_hub(ws: Path, facts: dict) -> list[dict]:
    pages = collect_pages(ws, facts["repo"])
    (ws / "assets").mkdir(parents=True, exist_ok=True)
    site = ("// Generated by onboarding.py — rebuilt by `init`, `check` and `hub`. Do not edit.\n" + EARLY_THEME
            + f"window.ONBOARDING_CONFIG = {json.dumps(facts, indent=1)};\n"
            f"window.ONBOARDING_PAGES = {json.dumps(pages, indent=1)};\n")
    write_atomic(ws / "assets" / "site.js", site)
    write_atomic(ws / "index.html", hub_html(facts, pages))
    return pages


def cmd_hub(args: argparse.Namespace) -> None:
    root = find_repo_root(args.repo)
    ws = find_workspace(root, args.out)
    pages = build_hub(ws, repo_facts(root))
    print(f"hub rebuilt with {len(pages)} pages: {ws / 'index.html'}")


# ── changes ──────────────────────────────────────────────────────────────────

CHANGES_DAYS = 120
CHANGES_LIMIT = 25
CHANGES_MIN_AREAS = 2
CHANGE_HEADER = "@@"


def repo_areas(root: Path, files: list[str]) -> list[str]:
    _, manifest_dirs = recon_manifests(root, files)
    _, project_dirs = recon_projects(root, files)
    return sorted(set(project_dirs + manifest_dirs), key=lambda d: (-depth(d), d))


def mainline_ref(root: Path, facts: dict, requested: str | None) -> str:
    if requested:
        return requested
    branch = facts["defaultBranch"]
    for ref in (f"origin/{branch}", branch) if branch else ():
        if git(root, "rev-parse", "--verify", "--quiet", ref).strip():
            return ref
    return "HEAD"


def mainline_changes(root: Path, ref: str, days: int) -> list[dict]:
    """Each first-parent commit on ref (one per merged PR, merge or squash) with the files it brought in."""
    log = git(root, "log", ref, "--first-parent", "--diff-merges=first-parent", f"--since={days}.days",
              "--name-only", "--date=short", f"--format={CHANGE_HEADER}%H%x09%P%x09%ad%x09%an%x09%s")
    changes: list[dict] = []
    for line in log.splitlines():
        if line.startswith(CHANGE_HEADER):
            sha, parents, date, author, subject = line[len(CHANGE_HEADER):].split("\t", 4)
            changes.append({"sha": sha, "parents": parents.split(), "date": date, "author": author,
                            "subject": subject, "files": []})
        elif line.strip() and changes and not LOCKFILE.search(line):
            changes[-1]["files"].append(line.strip())
    return changes


def change_authors(root: Path, change: dict) -> list[str]:
    if len(change["parents"]) < 2:
        return [change["author"]]
    names = git(root, "log", "--format=%an", f"{change['parents'][0]}..{change['parents'][1]}").splitlines()
    return list(dict.fromkeys(names)) or [change["author"]]


def cmd_changes(args: argparse.Namespace) -> None:
    root = find_repo_root(args.repo)
    facts = repo_facts(root)
    ref = mainline_ref(root, facts, args.ref)
    areas = repo_areas(root, tracked_files(root))
    candidates = []
    for change in mainline_changes(root, ref, args.days):
        touched = collections.Counter(area_of(path, areas) for path in change["files"])
        tests = sum(1 for path in change["files"] if TEST_FILE.search(path))
        if len(touched) >= args.min_areas:
            candidates.append((change, touched, tests))
    candidates.sort(key=lambda c: (-len(c[1]), len(c[0]["files"])))
    print(f"# Changes on {ref} touching {args.min_areas}+ areas (last {args.days} days, first-parent history)\n")
    print("Each entry is one merged change, smallest first within the same spread. "
          "Diff it with: git diff <first parent> <sha>\n")
    for change, touched, tests in candidates[:args.limit]:
        kind = "merge" if len(change["parents"]) > 1 else "single commit"
        spread = ", ".join(f"{area} ({n})" for area, n in touched.most_common())
        print(f"- {change['sha'][:SHORT_SHA]} {change['date']}  {change['subject']}\n"
              f"  {len(change['files'])} files, {tests} test files · {kind}, first parent "
              f"{change['parents'][0][:SHORT_SHA] if change['parents'] else 'none'}\n"
              f"  areas: {spread}\n"
              f"  authors: {', '.join(change_authors(root, change))}")
    if len(candidates) > args.limit:
        print(f"\n… {len(candidates) - args.limit} more; narrow with --days or raise --min-areas")
    if not candidates:
        print("none — widen --days or lower --min-areas")


# ── faq ──────────────────────────────────────────────────────────────────────

FAQ_SOURCE = "notes/faq.md"
FAQ_PAGE = "faq/faq.html"
FAQ_META = re.compile(r"^<!--(.*)-->$")
FENCE = "```"
INLINE_CODE = re.compile(r"`([^`]+)`")
MD_LINK = re.compile(r"\[([^\]]*)\]\(([^)\s]+)\)")
CITATION_TARGET = re.compile(r"^[^\s:#]+\.[\w]+(?::\d+(?:-\d+)?)?$")
MD_LINK_TARGETS = re.compile(r"\]\(([^)\s#]+:\d[^)\s]*)\)")
INFERRED_TOKEN = "[inferred]"


def faq_entries(text: str) -> list[dict]:
    entries: list[dict] = []
    for line in text.splitlines():
        if line.startswith("## "):
            entries.append({"question": line[3:].strip(), "meta": {}, "body": []})
        elif entries and not entries[-1]["body"] and (meta := FAQ_META.match(line.strip())):
            for pair in meta[1].split("·"):
                key, _, value = pair.partition(":")
                entries[-1]["meta"][key.strip()] = value.strip()
        elif entries:
            entries[-1]["body"].append(line)
    return entries


def faq_inline(text: str) -> str:
    """Escape text and render `code`, **bold**, [inferred], and links: page links, web links and code citations."""
    codes: list[str] = []

    def stash(match: re.Match) -> str:
        codes.append(f"<code>{html.escape(match[1])}</code>")
        return f"\x00{len(codes) - 1}\x00"

    def link(match: re.Match) -> str:
        label, target = match[1], match[2]
        if EXTERNAL_LINK.match(target):
            return f'<a href="{html.escape(target)}">{label}</a>'
        if CITATION_TARGET.match(target) and not target.split(":")[0].endswith(".html"):
            return f'<a class="src" data-src="{html.escape(target)}">{label}</a>'
        return f'<a href="../{html.escape(target)}">{label}</a>'

    text = html.escape(INLINE_CODE.sub(stash, text), quote=False)
    text = MD_LINK.sub(link, text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = text.replace(html.escape(INFERRED_TOKEN), '<span class="badge inferred">inferred</span>')
    return re.sub("\x00(\\d+)\x00", lambda m: codes[int(m[1])], text)


def faq_body(lines: list[str]) -> str:
    """Paragraphs, bullet lists and fenced excerpts whose info string carries the citation (```ts path:40-52)."""
    blocks, i = [], 0
    while i < len(lines):
        line = lines[i]
        if line.strip().startswith(FENCE):
            info = line.strip()[len(FENCE):].split()
            src = next((token for token in info if CITATION_TARGET.match(token) and ":" in token), "")
            code, i = [], i + 1
            while i < len(lines) and not lines[i].strip().startswith(FENCE):
                code.append(lines[i])
                i += 1
            i += 1
            attrs = f' data-src="{html.escape(src)}"' if src else ""
            blocks.append(f'<figure class="code"{attrs}><pre><code>{html.escape(chr(10).join(code))}</code></pre></figure>')
        elif line.lstrip().startswith("- "):
            items = []
            while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith(FENCE):
                if lines[i].lstrip().startswith("- "):
                    items.append(lines[i].lstrip()[2:])
                elif items:
                    items[-1] += " " + lines[i].strip()
                i += 1
            blocks.append("<ul>" + "".join(f"<li>{faq_inline(item)}</li>" for item in items) + "</ul>")
        elif line.strip():
            paragraph = []
            while i < len(lines) and lines[i].strip() and not lines[i].lstrip().startswith(("- ", FENCE)):
                paragraph.append(lines[i].strip())
                i += 1
            blocks.append(f"<p>{faq_inline(' '.join(paragraph))}</p>")
        else:
            i += 1
    return "\n".join(blocks)


def faq_drift(root: Path, entry: dict, cache: dict) -> list[str]:
    commit = entry["meta"].get("commit", "")
    cited = {match["path"] for match in (SRC.match(t) for t in MD_LINK_TARGETS.findall("\n".join(entry["body"]))) if match}
    cited |= {token.split(":")[0] for line in entry["body"] if line.strip().startswith(FENCE)
              for token in line.split()[1:] if ":" in token}
    changed = changed_since(root, commit, cache) if commit else None
    return sorted(cited & changed) if changed else []


def page_title(ws: Path, link: str, repo: str) -> str:
    target = ws / link.partition("#")[0]
    title = parse_page(target).title.strip() if target.is_file() else ""
    return re.sub(rf"\s+[—–|-]\s+{re.escape(repo)}$", "", html.unescape(title)) or link


def faq_html(facts: dict, entries: list[dict], drift: dict, ws: Path) -> str:
    esc = html.escape
    sections = []
    for entry in entries:
        meta = entry["meta"]
        slug = meta.get("id") or re.sub(r"[^a-z0-9]+", "-", entry["question"].lower()).strip("-")
        times = int(meta["times"]) if meta.get("times", "").isdigit() else 1
        facts_line = [f"Asked {esc(meta.get('asked', '?'))}"]
        if times > 1:
            facts_line.append(f"{times} times")
        if meta.get("commit"):
            facts_line.append(f"answered at <code>{esc(meta['commit'][:SHORT_SHA])}</code>")
        stale = drift.get(slug)
        notice = (f'<aside class="callout warn"><strong>May be out of date</strong><p>Changed since this answer: '
                  f'{esc(", ".join(stale))}. Ask again to refresh it.</p></aside>') if stale else ""
        deeper = (f'<p class="muted">Go deeper: <a href="../{esc(meta["see"])}">'
                  f'{esc(page_title(ws, meta["see"], facts["repo"]))}</a></p>'
                  if meta.get("see") else "")
        sections.append(f'<section id="{esc(slug)}">\n<h2>{esc(entry["question"])}</h2>\n'
                        f'<p class="muted">{" · ".join(facts_line)}</p>\n{notice}{faq_body(entry["body"])}\n{deeper}\n</section>')
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Questions — {esc(facts['repo'])}</title>
<meta name="description" content="{len(entries)} questions newcomers asked about {esc(facts['repo'])}, each answered with links to the code.">
<meta name="onboarding:commit" content="{esc(facts['commit'])}">
<link rel="stylesheet" href="../assets/onboarding.css">
<script src="../assets/site.js"></script>
<script defer src="../assets/onboarding.js"></script>
</head>
<body>
<main class="page">
<header class="page-head">
<p class="eyebrow">Questions · {esc(facts['repo'])}</p>
<h1>Questions asked so far</h1>
<p class="lede">Short answers to real questions, each checked against the code. Generated from
<code>{FAQ_SOURCE}</code> by <code>onboarding.py faq</code>: edit that file, never this page.</p>
</header>
{chr(10).join(sections)}
<section id="confidence">
<h2>Confidence and gaps</h2>
<p>Each answer traced one path through the code at the commit it shows, and its code references were checked when
this page was built. Answers flagged out of date cite files that have changed since. A question that needs more than a
few hops of explanation belongs in a deep dive.</p>
</section>
</main>
</body>
</html>
"""


def cmd_faq(args: argparse.Namespace) -> None:
    root = find_repo_root(args.repo)
    ws = find_workspace(root, args.out)
    source = ws / FAQ_SOURCE
    if not source.exists():
        sys.exit(f"error: {source} does not exist — add a first entry, then run faq again")
    entries = faq_entries(source.read_text(encoding="utf-8"))
    cache: dict = {}
    drift = {}
    for entry in entries:
        slug = entry["meta"].get("id") or re.sub(r"[^a-z0-9]+", "-", entry["question"].lower()).strip("-")
        if stale := faq_drift(root, entry, cache):
            drift[slug] = stale
            print(f"drifted   {slug}: {', '.join(stale)}")
    page = ws / FAQ_PAGE
    page.parent.mkdir(parents=True, exist_ok=True)
    write_atomic(page, faq_html(repo_facts(root), entries, drift, ws))
    print(f"rendered  {len(entries)} questions to {page}\n")
    sys.exit(1 if check_pages(root, ws, [page]) else 0)


# ── open ─────────────────────────────────────────────────────────────────────

def cmd_open(args: argparse.Namespace) -> None:
    root = find_repo_root(args.repo)
    ws = find_workspace(root, args.out)
    target = Path(args.page) if args.page else ws / "index.html"
    if not target.is_absolute():
        target = ws / target if (ws / target).exists() else target.resolve()
    if not target.exists():
        sys.exit(f"error: {target} not found")
    if is_wsl():
        _, windows_path = run(["wslpath", "-w", str(target)])
        run(["explorer.exe", windows_path.strip()])
    elif sys.platform == "darwin":
        run(["open", str(target)])
    elif os.name == "nt":
        os.startfile(str(target))  # type: ignore[attr-defined]
    else:
        run(["xdg-open", str(target)])
    print(f"opened {target}")


# ── cli ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    commands = parser.add_subparsers(dest="command", required=True)
    for name, handler, help_text in (
            ("init", cmd_init, "create or refresh the workspace"),
            ("recon", cmd_recon, "print a repo fact sheet"),
            ("check", cmd_check, "verify pages, then rebuild the hub"),
            ("hub", cmd_hub, "rebuild the hub and site navigation"),
            ("open", cmd_open, "open a page in the browser"),
            ("changes", cmd_changes, "list merged changes that span several areas"),
            ("faq", cmd_faq, "render notes/faq.md into the questions page")):
        sub = commands.add_parser(name, help=help_text)
        sub.add_argument("--repo", default=".", help="any path inside the repository (default: cwd)")
        sub.add_argument("--out", help="workspace directory (default: <git root>/.onboarding)")
        sub.set_defaults(handler=handler)
        if name == "recon":
            sub.add_argument("--days", type=int, default=RECENT_DAYS, help="git activity window")
        if name == "check":
            sub.add_argument("pages", nargs="*", help="pages to check (default: all)")
        if name == "open":
            sub.add_argument("page", nargs="?", help="page path, absolute or relative to the workspace")
        if name == "changes":
            sub.add_argument("--ref", help="branch to read (default: the remote's default branch)")
            sub.add_argument("--days", type=int, default=CHANGES_DAYS, help="how far back to look")
            sub.add_argument("--min-areas", type=int, default=CHANGES_MIN_AREAS, help="areas a change must touch")
            sub.add_argument("--limit", type=int, default=CHANGES_LIMIT, help="candidates to list")
    args = parser.parse_args()
    args.handler(args)


if __name__ == "__main__":
    main()
