#!/usr/bin/env python3
"""
Parse an LCOV coverage report and report per-file coverage stats.

Usage:
    python3 check_coverage.py <lcov_file> [file1.ts file2.ts ...]

If source file names are supplied, only those files are reported.
Otherwise every file in the report is shown.

Exit code:
    0  all files meet the threshold
    1  one or more files are below the threshold
"""

import re
import sys
from pathlib import Path

THRESHOLD = 80.0  # percent — matches SonarCloud's typical "new code" gate


def parse_lcov(path: str) -> dict:
    """Return a dict keyed by source-file path with coverage stats."""
    with open(path) as f:
        content = f.read()

    files = {}
    for record in content.split("end_of_record"):
        sf_match = re.search(r"^SF:(.+)$", record, re.MULTILINE)
        if not sf_match:
            continue

        sf = sf_match.group(1).strip()

        def _int(pattern):
            m = re.search(pattern, record, re.MULTILINE)
            return int(m.group(1)) if m else 0

        lh = _int(r"^LH:(\d+)$")
        lf = _int(r"^LF:(\d+)$")
        bh = _int(r"^BRH:(\d+)$")
        bf = _int(r"^BRF:(\d+)$")
        fnh = _int(r"^FNH:(\d+)$")
        fnf = _int(r"^FNF:(\d+)$")

        uncovered_lines = []
        for line in record.splitlines():
            if line.startswith("DA:"):
                parts = line[3:].split(",")
                if len(parts) >= 2 and parts[1] == "0":
                    uncovered_lines.append(int(parts[0]))

        uncovered_branches = []
        for line in record.splitlines():
            if line.startswith("BRDA:"):
                parts = line[5:].split(",")
                if len(parts) >= 4 and parts[3] == "0":
                    uncovered_branches.append(
                        f"line {parts[0]} block {parts[1]} branch {parts[2]}"
                    )

        files[sf] = {
            "lh": lh, "lf": lf,
            "bh": bh, "bf": bf,
            "fnh": fnh, "fnf": fnf,
            "uncovered_lines": uncovered_lines,
            "uncovered_branches": uncovered_branches,
        }

    return files


def pct(hit, total):
    if total == 0:
        return None  # no branches/lines to cover — not a failure
    return hit / total * 100


def passes(hit, total):
    p = pct(hit, total)
    return p is None or p >= THRESHOLD


def report(files: dict, filter_names: list[str]) -> bool:
    """Print a report. Returns True if all checked files pass."""
    all_pass = True

    for sf, s in sorted(files.items()):
        filename = Path(sf).name

        # Filter to requested files when a list was supplied
        if filter_names and not any(f == filename or f in sf for f in filter_names):
            continue

        line_pct = pct(s["lh"], s["lf"])
        br_pct   = pct(s["bh"], s["bf"])
        fn_pct   = pct(s["fnh"], s["fnf"])

        file_passes = (
            passes(s["lh"], s["lf"])
            and passes(s["bh"], s["bf"])
            and passes(s["fnh"], s["fnf"])
        )

        if not file_passes:
            all_pass = False

        icon = "✓" if file_passes else "✗"

        def fmt(p, hit, total):
            if p is None:
                return f"N/A ({total} total)"
            flag = " ⚠" if p < THRESHOLD else ""
            return f"{p:.1f}% ({hit}/{total}){flag}"

        print(f"\n{icon} {sf}")
        print(f"   Lines:    {fmt(line_pct, s['lh'], s['lf'])}")
        print(f"   Branches: {fmt(br_pct,   s['bh'], s['bf'])}")
        print(f"   Funcs:    {fmt(fn_pct,   s['fnh'], s['fnf'])}")

        if not file_passes:
            if s["uncovered_lines"]:
                lines_str = ", ".join(str(l) for l in s["uncovered_lines"])
                print(f"   Uncovered lines: {lines_str}")
            if s["uncovered_branches"]:
                print(f"   Uncovered branches ({len(s['uncovered_branches'])}):")
                for b in s["uncovered_branches"]:
                    print(f"     - {b}")

    return all_pass


def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <lcov_file> [file1.ts ...]", file=sys.stderr)
        sys.exit(2)

    lcov_path = sys.argv[1]
    filter_names = sys.argv[2:]

    if not Path(lcov_path).exists():
        print(f"Error: LCOV file not found: {lcov_path}", file=sys.stderr)
        sys.exit(2)

    files = parse_lcov(lcov_path)

    if not files:
        print("No coverage data found in LCOV file.", file=sys.stderr)
        sys.exit(2)

    print(f"Coverage threshold: {THRESHOLD}%")
    print(f"LCOV: {lcov_path}")
    if filter_names:
        print(f"Checking: {', '.join(filter_names)}")

    all_pass = report(files, filter_names)

    print()
    if all_pass:
        print(f"All files meet the {THRESHOLD}% threshold.")
    else:
        print(f"One or more files are below the {THRESHOLD}% threshold.")

    sys.exit(0 if all_pass else 1)


if __name__ == "__main__":
    main()
