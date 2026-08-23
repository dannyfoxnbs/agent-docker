import test, { after } from "node:test";
import assert from "node:assert/strict";
import {
  MARKER_RULES,
  SAMPLE_FILES,
  configuredRules,
  createTargetProject,
  enabledRules,
  resolveAgentConfig,
  typeAwareFindings,
  typeCheckedPresetRules,
} from "./lib/agent-config-contract.mjs";

const target = createTargetProject();
process.chdir(target.dir);
after(() => target.cleanup());

const byFile = await resolveAgentConfig({ cwd: target.dir });
const presetRules = await typeCheckedPresetRules();
const EXPECTED_RULES = {
  "sample.ts": ["agent/no-comments", "max-lines-per-function", "@typescript-eslint/max-params", "@typescript-eslint/no-magic-numbers"],
  "sample.tsx": ["agent/no-comments", "max-lines-per-function", "@typescript-eslint/max-params", "@typescript-eslint/no-magic-numbers"],
  "sample.js": ["agent/no-comments", "max-lines-per-function", "max-params", "no-magic-numbers"],
  "sample.jsx": ["agent/no-comments", "max-lines-per-function", "max-params", "no-magic-numbers"],
};

test("the expected rules are enabled as errors", () => {
  const configured = configuredRules(byFile);
  assert.ok(configured.length > 0);
  assert.deepEqual(configured.filter((rule) => rule.severity !== "error"), []);

  const enabled = new Set(enabledRules(byFile).map((rule) => rule.ruleId));
  const plugin = byFile.get("sample.ts").plugins?.agent;
  assert.ok(plugin);
  for (const name of Object.keys(plugin.rules ?? {})) {
    assert.ok(enabled.has(`agent/${name}`));
  }
});

test("inline configuration stays disabled", () => {
  for (const config of byFile.values()) {
    assert.equal(config.linterOptions?.noInlineConfig, true);
  }
});

test("the configuration stays type-free", () => {
  assert.ok(presetRules.size > 0);
  assert.deepEqual(typeAwareFindings(byFile, presetRules), []);
  for (const config of byFile.values()) {
    assert.ok(config.languageOptions?.parser);
    assert.equal(config.languageOptions?.parserOptions?.project, undefined);
  }
});

test("the target project's configuration is not inherited", () => {
  const markers = Object.keys(MARKER_RULES);
  for (const [file, config] of byFile) {
    assert.deepEqual(markers.filter((ruleId) => config.rules?.[ruleId] !== undefined), []);
    assert.deepEqual(Object.keys(config.rules ?? {}).sort(), [...EXPECTED_RULES[file]].sort());
  }
});

test("all supported source extensions resolve a configuration", () => {
  assert.deepEqual([...byFile.keys()], [...SAMPLE_FILES]);
});
