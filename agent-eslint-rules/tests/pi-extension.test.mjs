import test from "node:test";
import assert from "node:assert/strict";
import { unlinkSync } from "node:fs";
import agentLintExtension from "../extensions/pi-agent-lint.mjs";
import { assertDepsInstalled } from "./lib/workspace.mjs";
import { repoWith } from "./lib/repo.mjs";

assertDepsInstalled();

const CLEAN = "export function scale(value: number): number {\n  return value + 1;\n}\n";
const VIOLATION = "// explain\nexport function scale(value: number): number {\n  return value * 42;\n}\n";

function toolResultHandler() {
  let handler;
  agentLintExtension({
    on(event, candidate) {
      if (event === "tool_result") {
        handler = candidate;
      }
    },
  });
  return handler;
}

function event(path, overrides = {}) {
  return {
    toolName: "write",
    input: { path },
    content: [{ type: "text", text: "Wrote file" }],
    isError: false,
    ...overrides,
  };
}

test("the Pi extension stays silent for clean edits and failed tools", async () => {
  const repo = repoWith({ "src/example.ts": CLEAN });
  repo.write("src/example.ts", CLEAN.replace("+ 1", "- 1"));
  const handle = toolResultHandler();

  assert.equal(await handle(event("src/example.ts"), { cwd: repo.dir }), undefined);
  assert.equal(await handle(event("src/example.ts", { isError: true }), { cwd: repo.dir }), undefined);
});

test("the Pi extension returns violations as a failed tool result", async () => {
  const repo = repoWith({ "src/example.ts": CLEAN });
  repo.write("src/example.ts", VIOLATION);

  const result = await toolResultHandler()(event("src/example.ts"), { cwd: repo.dir });
  assert.equal(result.isError, true);
  assert.match(result.content.at(-1).text, /Agent lint found violations/);
  assert.match(result.content.at(-1).text, /agent\/no-comments/);
  assert.match(result.content.at(-1).text, /no-magic-numbers/);
});

test("the Pi extension exposes tooling failures without failing the edit", async () => {
  const repo = repoWith({ "src/example.ts": CLEAN });
  repo.write("src/example.ts", VIOLATION);
  unlinkSync(`${repo.dir}/node_modules`);

  const result = await toolResultHandler()(event("src/example.ts"), { cwd: repo.dir });
  assert.equal(result.isError, undefined);
  assert.match(result.content.at(-1).text, /not checked/);
  assert.match(result.content.at(-1).text, /tooling failure, not a rule violation/);
});
