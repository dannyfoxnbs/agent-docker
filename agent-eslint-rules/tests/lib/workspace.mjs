import { execFileSync } from "node:child_process";
import { cp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { HOUSE_STYLE_RULES } from "./corrections.mjs";

export const RULES_DIR = fileURLToPath(new URL("../..", import.meta.url));
export const TESTS_DIR = fileURLToPath(new URL("..", import.meta.url));
export const FIXTURES_DIR = resolve(TESTS_DIR, "fixtures");
export const SHARED_MODULES = resolve(FIXTURES_DIR, "_deps/node_modules");
export const RUNNER = resolve(RULES_DIR, "lint-agent.mjs");
export const HOOK_SHIM = resolve(RULES_DIR, "claude-hook/hooks/agent-lint-changed-file.mjs");
export const HOOK_SETTINGS = resolve(RULES_DIR, "claude-hook/settings.json");

export const SHIM_NAME = ".claude/hooks/agent-lint-changed-file.mjs";
export const SETTINGS_NAME = ".claude/settings.json";
export const LINK_NAME = ".claude/agent-eslint-rules";
export const PATH_FILE_NAME = ".claude/agent-eslint-rules.path";

const STYLE_GUIDE = `# Conventions

Code style for this repo. These are not negotiable and they are not restated per
task, so apply them to everything you write here:

${HOUSE_STYLE_RULES}
`;

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" });
}

export function assertDepsInstalled() {
  if (!existsSync(SHARED_MODULES)) {
    throw new Error(
      `missing ${SHARED_MODULES}. Run: npm install --prefix tests/fixtures/_deps`,
    );
  }
}

export async function createWorkspace({ taskId, root, treatment, replicate }) {
  assertDepsInstalled();
  const dir = resolve(root, `${taskId}--${treatment}--r${replicate}`);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  await cp(resolve(FIXTURES_DIR, taskId, "workspace"), dir, { recursive: true });

  await writeFile(
    resolve(dir, "package.json"),
    `${JSON.stringify({ name: `eval-${taskId}`, private: true, version: "0.0.0", type: "module" }, null, 2)}\n`,
  );
  await writeFile(resolve(dir, ".gitignore"), "node_modules/\n.claude/\n.eval/\n");
  await symlink(SHARED_MODULES, resolve(dir, "node_modules"), "dir");

  // Written before the baseline commit so it is part of the repo the agent
  // inherits rather than part of the diff it produces - the same position a real
  // conventions file occupies, and it keeps CLAUDE.md out of changedFiles().
  if (treatment === "prompt") {
    await writeFile(resolve(dir, "CLAUDE.md"), STYLE_GUIDE);
  }

  git(dir, ["init", "--quiet"]);
  git(dir, ["config", "user.email", "eval@example.com"]);
  git(dir, ["config", "user.name", "Agent Lint Evaluation"]);
  git(dir, ["config", "commit.gpgsign", "false"]);
  git(dir, ["add", "--all"]);
  git(dir, ["commit", "--quiet", "--message", "baseline"]);

  await mkdir(resolve(dir, ".eval"), { recursive: true });
  if (treatment === "lint") {
    await installHook(dir);
  }
  return dir;
}

async function installHook(dir) {
  await mkdir(resolve(dir, ".claude/hooks"), { recursive: true });
  await cp(HOOK_SHIM, resolve(dir, SHIM_NAME));
  await cp(HOOK_SETTINGS, resolve(dir, SETTINGS_NAME));
  await symlink(resolve(RULES_DIR), resolve(dir, LINK_NAME), "dir");
}

function baselineCommit(dir) {
  return git(dir, ["rev-list", "--max-parents=0", "HEAD"]).trim().split("\n")[0];
}

export function changedFiles(dir) {
  const tracked = git(dir, ["diff", "--name-only", baselineCommit(dir), "--"]).split("\n");
  const untracked = git(dir, ["ls-files", "--others", "--exclude-standard"]).split("\n");
  return [...new Set([...tracked, ...untracked].map((file) => file.trim()).filter(Boolean))];
}

export function diffStat(dir) {
  const numstat = git(dir, ["diff", "--numstat", baselineCommit(dir), "--"]);
  let added = 0;
  let removed = 0;
  for (const line of numstat.split("\n").filter(Boolean)) {
    const [plus, minus] = line.split("\t");
    added += Number(plus) || 0;
    removed += Number(minus) || 0;
  }
  return { added, removed };
}
