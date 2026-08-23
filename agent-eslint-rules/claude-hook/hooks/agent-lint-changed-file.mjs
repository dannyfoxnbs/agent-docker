// Installed shim: resolve the rules clone, then delegate all hook behaviour to it.

import { existsSync, lstatSync, readFileSync, readlinkSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const claudeDir = resolve(here, "..");
const projectDir = resolve(claudeDir, "..");
const LINK = resolve(claudeDir, "agent-eslint-rules");
const PATH_FILE = resolve(claudeDir, "agent-eslint-rules.path");

const found = resolveRules();

if (found.error) {
  console.error(`agent-lint: not checked - ${found.error}`);
  process.exit(0);
}

const hookMain = resolve(found.dir, "claude-hook/hook-main.mjs");
const runner = found.runner ?? resolve(found.dir, "lint-agent.mjs");

for (const required of [hookMain, runner]) {
  if (!existsSync(required)) {
    console.error(
      `agent-lint: not checked - ${found.source} resolves to ${found.dir}, but ` +
        `${required} is missing, so that is not an agent-eslint-rules clone.`,
    );
    process.exit(0);
  }
}

const { runHook } = await import(pathToFileURL(hookMain).href);
await runHook({ projectDir, rulesDir: found.dir, runner });

function resolveRules() {
  const override = process.env.AGENT_ESLINT_RUNNER;
  if (override) {
    return {
      dir: dirname(resolve(override)),
      runner: resolve(override),
      source: "AGENT_ESLINT_RUNNER",
    };
  }

  return fromLink() ?? fromPathFile() ?? { error: nothingConfigured() };
}

function fromLink() {
  if (!exists(LINK)) {
    return null;
  }
  try {
    return { dir: realpathSync(LINK), source: `the symlink ${LINK}` };
  } catch {
    return { error: `the symlink ${LINK} is broken: it points at ${target(LINK)}, which does not exist.` };
  }
}

function fromPathFile() {
  if (!exists(PATH_FILE)) {
    return null;
  }

  const recorded = readFileSync(PATH_FILE, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#"));

  if (!recorded) {
    return { error: `${PATH_FILE} records no path. It must contain the absolute path of your agent-eslint-rules clone.` };
  }
  if (!isAbsolute(recorded)) {
    return { error: `${PATH_FILE} records "${recorded}", which is not an absolute path.` };
  }
  if (!existsSync(recorded)) {
    return { error: `${PATH_FILE} records ${recorded}, which does not exist.` };
  }
  return { dir: recorded, source: PATH_FILE };
}

function nothingConfigured() {
  return (
    "no agent-eslint-rules clone is linked. Expected a symlink at " +
    `${LINK} pointing at your clone, or its absolute path recorded in ${PATH_FILE}. ` +
    "Re-run the installer in your clone to create it."
  );
}

// lstat rather than existsSync: a broken symlink still exists as an entry, and
// that case needs its own message.
function exists(path) {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}

function target(link) {
  try {
    return readlinkSync(link);
  } catch {
    return "an unreadable location";
  }
}
