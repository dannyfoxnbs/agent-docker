import { createRequire } from "node:module";
import { existsSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const RULES_DIR = fileURLToPath(new URL("../..", import.meta.url));
export const TESTS_DIR = fileURLToPath(new URL("..", import.meta.url));
export const DEPS_DIR = resolve(TESTS_DIR, "fixtures/_deps");
export const SHARED_MODULES = resolve(DEPS_DIR, "node_modules");
export const AGENT_CONFIG = resolve(RULES_DIR, "eslint.config.agent.mjs");

export function assertDepsInstalled() {
  if (!existsSync(SHARED_MODULES)) {
    throw new Error(
      `missing ${SHARED_MODULES}. Run: npm install --prefix tests/fixtures/_deps`,
    );
  }
}

const requireFromDeps = createRequire(pathToFileURL(resolve(DEPS_DIR, "package.json")).href);

export async function importFromDeps(specifier) {
  return import(pathToFileURL(requireFromDeps.resolve(specifier)).href);
}

export const MARKER_RULES = Object.freeze({
  "no-alert": "warn",
  "no-console": "warn",
  "no-debugger": "warn",
});

export function createTargetProject() {
  assertDepsInstalled();
  const dir = mkdtempSync(resolve(tmpdir(), "agent-contract-"));
  writeFileSync(
    resolve(dir, "package.json"),
    JSON.stringify({ name: "target-project", private: true, type: "module" }),
  );
  symlinkSync(SHARED_MODULES, resolve(dir, "node_modules"), "dir");
  writeFileSync(
    resolve(dir, "eslint.config.mjs"),
    `export default [\n  {\n    linterOptions: { noInlineConfig: false },\n    rules: ${JSON.stringify(MARKER_RULES)},\n  },\n];\n`,
  );
  writeFileSync(resolve(dir, "tsconfig.json"), JSON.stringify({ compilerOptions: { strict: true } }));
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

export const SAMPLE_FILES = Object.freeze(["sample.ts", "sample.tsx", "sample.js", "sample.jsx"]);

export async function resolveAgentConfig({ configPath = AGENT_CONFIG, cwd, files = SAMPLE_FILES } = {}) {
  const eslintModule = await importFromDeps("eslint");
  const ESLint = eslintModule.ESLint ?? eslintModule.default?.ESLint;
  const engine = new ESLint({ overrideConfigFile: configPath, cwd });

  const byFile = new Map();
  for (const file of files) {
    byFile.set(file, await engine.calculateConfigForFile(resolve(cwd, file)));
  }
  return byFile;
}

const SEVERITY_NAMES = ["off", "warn", "error"];

function severityOf(entry) {
  const raw = Array.isArray(entry) ? entry[0] : entry;
  return typeof raw === "number" ? SEVERITY_NAMES[raw] ?? String(raw) : String(raw);
}

export function enabledRules(byFile) {
  const found = [];
  for (const [file, config] of byFile) {
    for (const [ruleId, entry] of Object.entries(config.rules ?? {})) {
      const severity = severityOf(entry);
      if (severity !== "off") {
        found.push({ file, ruleId, severity, config });
      }
    }
  }
  return found;
}

export function configuredRules(byFile) {
  const found = [];
  for (const [file, config] of byFile) {
    for (const [ruleId, entry] of Object.entries(config.rules ?? {})) {
      found.push({ file, ruleId, severity: severityOf(entry) });
    }
  }
  return found;
}

function pluginRules(config, pluginName) {
  const plugin = config.plugins?.[pluginName];
  return plugin?.rules ?? null;
}

function lookup(rules, name) {
  if (!rules) {
    return undefined;
  }
  return typeof rules.get === "function" ? rules.get(name) : rules[name];
}

export function ruleDefinition(config, ruleId) {
  const slash = ruleId.lastIndexOf("/");
  if (slash === -1) {
    return lookup(pluginRules(config, "@"), ruleId);
  }
  return lookup(pluginRules(config, ruleId.slice(0, slash)), ruleId.slice(slash + 1));
}

export async function typeCheckedPresetRules() {
  const module = await importFromDeps("typescript-eslint");
  const tseslint = module.default ?? module;
  const names = new Set();
  for (const [presetName, preset] of Object.entries(tseslint.configs ?? {})) {
    if (!/TypeChecked$/.test(presetName)) {
      continue;
    }
    for (const block of [preset].flat(Infinity).filter(Boolean)) {
      for (const [ruleId, entry] of Object.entries(block.rules ?? {})) {
        const severity = severityOf(entry);
        if (severity !== "off") {
          names.add(ruleId);
        }
      }
    }
  }
  return names;
}

const TYPE_AWARE_PARSER_OPTIONS = Object.freeze([
  "project",
  "projectService",
  "EXPERIMENTAL_useProjectService",
  "programs",
]);

export function typeAwareFindings(byFile, presetRules) {
  const findings = [];

  for (const { file, ruleId, severity, config } of enabledRules(byFile)) {
    const definition = ruleDefinition(config, ruleId);
    if (!definition) {
      findings.push(
        `${ruleId} (enabled as "${severity}" for ${file}) has no resolvable rule definition, so this test cannot ` +
          "prove it is type-free. Either the plugin providing it is missing or the rule name is wrong.",
      );
      continue;
    }
    if (definition.meta?.docs?.requiresTypeChecking === true) {
      findings.push(
        `${ruleId} (enabled as "${severity}" for ${file}) declares meta.docs.requiresTypeChecking, so it needs a ` +
          "full TypeScript program.",
      );
      continue;
    }
    if (presetRules?.has(ruleId)) {
      findings.push(
        `${ruleId} (enabled as "${severity}" for ${file}) ships in one of typescript-eslint's *TypeChecked presets, ` +
          "which are type-aware by construction.",
      );
    }
  }

  for (const [file, config] of byFile) {
    const parserOptions = config.languageOptions?.parserOptions ?? {};
    for (const option of TYPE_AWARE_PARSER_OPTIONS) {
      if (parserOptions[option] !== undefined) {
        findings.push(
          `languageOptions.parserOptions.${option} is set for ${file}, which makes the parser build a TypeScript ` +
            "program on every file whether or not any rule asks for type information.",
        );
      }
    }
  }

  return findings;
}
