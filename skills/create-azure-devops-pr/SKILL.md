---
name: create-azure-devops-pr
description: Open a new Azure DevOps PR for the current branch from the local clone, optionally titled and linked from a PBI.
disable-model-invocation: true
argument-hint: "[pbi-id] [--target branch] [--source branch] [--title ...] [--description path|-] [--draft] [--push] [--no-link]"
---

# Create Azure DevOps PR

Open a PR in the `thenbs` org **from inside the repo clone** — the repository is read from `origin`, so whichever repo you're in is where the PR lands (you never pass a repo).

- **Repo + source branch** come from the local clone: `origin` → repo, current branch → source (override with `--source`).
- **Target** defaults to `dev`; override with `--target`.
- **PBI id** _(optional positional)_ → its title becomes the PR title, and the PR is linked to the work item (an ArtifactLink shown on both). Without one, the title falls back to the last commit subject.
- **Description** — a real templated body is the job of `write-local-azure-devops-pr-description` (it fills the repo's `pull_request_template.md`, grounded in the diff); this skill only publishes one. Run that skill first — this one auto-picks up the `pr-<branch>.md` it writes — or pass any file with `--description <path|->`. With neither, the body is a one-line PBI link.
- **`--title`** overrides the title; **`--draft`** opens a draft; **`--push`** pushes the current branch to `origin` first; **`--no-link`** skips the PBI link.

The source branch must be on `origin` first — the script stops with a clear message (or use `--push`). If an active PR for this source → target already exists, it prints that PR instead of making a duplicate. Prints the new PR id and URL.

Needs a PAT with **Code (Read & Write)** (and **Work Items (Read & Write)** to link a PBI). See README for setup.

!`python3 ${CLAUDE_SKILL_DIR}/scripts/create_pr.py $ARGUMENTS`
