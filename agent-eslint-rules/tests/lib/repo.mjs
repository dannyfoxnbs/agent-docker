import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, writeFileSync, mkdirSync, symlinkSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import {
  HOOK_SETTINGS,
  HOOK_SHIM,
  LINK_NAME,
  PATH_FILE_NAME,
  RULES_DIR,
  RUNNER,
  SETTINGS_NAME,
  SHARED_MODULES,
  SHIM_NAME,
} from "./workspace.mjs";

export function repoWith(baseline, { installHook = false, branch = "main", remote = false } = {}) {
  const dir = mkdtempSync(resolve(tmpdir(), "agent-lint-"));
  writeFileSync(resolve(dir, "package.json"), JSON.stringify({ name: "scratch", private: true, type: "module" }));
  writeFileSync(resolve(dir, ".gitignore"), "node_modules/\n.claude/\n");
  symlinkSync(SHARED_MODULES, resolve(dir, "node_modules"), "dir");

  for (const [file, content] of Object.entries(baseline)) {
    mkdirSync(dirname(resolve(dir, file)), { recursive: true });
    writeFileSync(resolve(dir, file), content);
  }

  const git = (...args) => execFileSync("git", args, { cwd: dir, encoding: "utf8" });
  git("init", "--quiet", `--initial-branch=${branch}`);
  git("config", "user.email", "test@example.com");
  git("config", "user.name", "Test");
  git("config", "commit.gpgsign", "false");
  git("add", "--all");
  git("commit", "--quiet", "--message", "baseline");
  if (remote) {
    git("remote", "add", "origin", resolve(dir, "..", "no-such-remote.git"));
  }

  if (installHook) {
    installHookInto(dir, installHook === true ? {} : installHook);
  }

  return {
    dir,
    git,
    write: (file, content) => {
      mkdirSync(dirname(resolve(dir, file)), { recursive: true });
      writeFileSync(resolve(dir, file), content);
    },
    lint: (env = {}) => {
      const result = spawnSync("node", [RUNNER], {
        cwd: dir,
        encoding: "utf8",
        env: { ...process.env, LINT_AGENT_FORMAT: "json", LINT_AGENT_ONLY_FILES: "", LINT_AGENT_ALLOW_COMMENTS: "", ...env },
      });
      return {
        status: result.status,
        report: JSON.parse((result.stdout ?? "").trim().split("\n").at(-1)),
        stderr: result.stderr,
      };
    },
    hook: (file, env = {}) => {
      const result = spawnSync("node", [resolve(dir, ".claude/hooks/agent-lint-changed-file.mjs")], {
        cwd: dir,
        encoding: "utf8",
        input: JSON.stringify({ tool_name: "Edit", tool_input: { file_path: resolve(dir, file) } }),
        env: { ...process.env, AGENT_ESLINT_RUNNER: "", LINT_AGENT_TELEMETRY: "", ...env },
      });
      return { status: result.status, stdout: (result.stdout ?? "").trim(), stderr: result.stderr };
    },
  };
}

export function installHookInto(dir, { rules = resolve(RULES_DIR), link = true } = {}) {
  mkdirSync(resolve(dir, ".claude/hooks"), { recursive: true });
  writeFileSync(resolve(dir, SHIM_NAME), readFileSync(HOOK_SHIM));
  writeFileSync(resolve(dir, SETTINGS_NAME), readFileSync(HOOK_SETTINGS));

  if (link === "broken") {
    symlinkSync(resolve(dir, "no-such-clone"), resolve(dir, LINK_NAME), "dir");
    return;
  }
  if (link) {
    symlinkSync(rules, resolve(dir, LINK_NAME), "dir");
    return;
  }
  writeFileSync(
    resolve(dir, PATH_FILE_NAME),
    `# absolute path of the agent-eslint-rules clone\n${rules}\n`,
  );
}

export function runInstaller(dir, args = []) {
  const result = spawnSync("node", [resolve(RULES_DIR, "scripts/install.mjs"), dir, "--json", ...args], {
    encoding: "utf8",
    env: { ...process.env, AGENT_ESLINT_RUNNER: "", LINT_AGENT_TELEMETRY: "", LINT_AGENT_FORMAT: "", LINT_AGENT_ONLY_FILES: "" },
  });
  const stdout = (result.stdout ?? "").trim();
  let report = null;
  try {
    report = JSON.parse(stdout);
  } catch {
    report = null;
  }
  return { status: result.status, report, stdout, stderr: result.stderr };
}

export function cloneRules() {
  const clone = mkdtempSync(resolve(tmpdir(), "agent-rules-clone-"));
  for (const entry of ["lint-agent.mjs", "eslint.config.agent.mjs", "index.mjs", "rules", "claude-hook"]) {
    cpSync(resolve(RULES_DIR, entry), resolve(clone, entry), { recursive: true });
  }
  return clone;
}
