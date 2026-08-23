import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import agent from "./index.mjs";

// Rule configuration only. lint-agent.mjs handles git scope, attribution, and execution.
const requireFromRepo = createRequire(
  pathToFileURL(resolve(process.cwd(), "package.json")).href,
);

// Resolve before importing so failures inside an installed package are not
// mistaken for the package itself being absent.
async function importFromRepo(specifier) {
  let resolved;
  try {
    resolved = requireFromRepo.resolve(specifier);
  } catch (error) {
    if (isMissing(error, specifier)) {
      return null;
    }
    throw error;
  }
  return await import(pathToFileURL(resolved).href);
}

function isMissing(error, specifier) {
  const code = error?.code;
  if (code !== "MODULE_NOT_FOUND" && code !== "ERR_MODULE_NOT_FOUND") {
    return false;
  }
  return typeof error.message === "string" && error.message.includes(`'${specifier}'`);
}

async function resolveTypescriptEslint() {
  const unified = await importFromRepo("typescript-eslint");
  if (unified) {
    const resolved = unified.default ?? unified;
    return { parser: resolved.parser, plugin: resolved.plugin };
  }

  const [parser, plugin] = await Promise.all([
    importFromRepo("@typescript-eslint/parser"),
    importFromRepo("@typescript-eslint/eslint-plugin"),
  ]);

  if (!parser || !plugin) {
    throw new Error(
      "agent lint: could not resolve typescript-eslint from " +
        `${process.cwd()}. Run the linted repo's install step (e.g. npm install) ` +
        "first, or add `typescript-eslint` as a devDependency there.",
    );
  }

  return { parser: parser.default ?? parser, plugin: plugin.default ?? plugin };
}

const tseslint = await resolveTypescriptEslint();

const MAX_PARAMS = 3;
const MAX_LINES_PER_FUNCTION = 100;
const IGNORED_MAGIC_NUMBERS = [-1, 0, 1];

export default [
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    linterOptions: {
      noInlineConfig: true,
    },
    languageOptions: {
      parser: tseslint.parser,
      sourceType: "module",
    },
    plugins: {
      agent,
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "agent/no-comments": "error",
      "max-lines-per-function": [
        "error",
        { max: MAX_LINES_PER_FUNCTION, skipBlankLines: true },
      ],
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/max-params": ["error", { max: MAX_PARAMS }],
      "@typescript-eslint/no-magic-numbers": [
        "error",
        {
          ignore: IGNORED_MAGIC_NUMBERS,
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreEnums: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
        },
      ],
    },
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    rules: {
      "max-params": ["error", { max: MAX_PARAMS }],
      "no-magic-numbers": [
        "error",
        {
          ignore: IGNORED_MAGIC_NUMBERS,
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
        },
      ],
    },
  },
];
