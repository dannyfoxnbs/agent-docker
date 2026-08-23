import test from "node:test";
import { assertDepsInstalled, importFromDeps } from "./lib/agent-config-contract.mjs";
import { noComments } from "../rules/no-comments.mjs";

assertDepsInstalled();

const eslintModule = await importFromDeps("eslint");
const RuleTester = eslintModule.RuleTester ?? eslintModule.default?.RuleTester;

// The rule is exercised through the runner elsewhere; these tests state its own
// contract directly, which is the only place every comment form it claims to
// catch is enumerated.
const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

const unexpected = { messageId: "unexpected" };

function run(cases) {
  ruleTester.run("no-comments", noComments, { valid: [], invalid: [], ...cases });
}

test("comment-free code is valid", () => {
  run({
    valid: [
      { code: "export const total = price * quantity;\n" },
      { code: "export function scale(value) {\n  return value * factor;\n}\n" },
      { code: 'export const path = "https://example.com//not-a-comment";\n' },
      { code: 'export const divider = "/* not a comment */";\n' },
      { code: "export const view = <div className=\"row\">{label}</div>;\n" },
      { code: "" },
    ],
  });
});

test("line, block and doc comments are reported", () => {
  run({
    invalid: [
      {
        name: "line comment on its own line",
        code: "// explain the next line\nexport const total = 1;\n",
        errors: [unexpected],
      },
      {
        name: "block comment",
        code: "/* explain the next line */\nexport const total = 1;\n",
        errors: [unexpected],
      },
      {
        name: "multi-line block comment counts once",
        code: "/*\n * still one comment token\n */\nexport const total = 1;\n",
        errors: [unexpected],
      },
      {
        name: "doc comment",
        code: "/**\n * Scales a value.\n */\nexport function scale(value) {\n  return value;\n}\n",
        errors: [unexpected],
      },
      {
        name: "comment inside a function body",
        code: "export function scale(value) {\n  // adjust\n  return value;\n}\n",
        errors: [unexpected],
      },
    ],
  });
});

test("comments trailing code on the same line are reported", () => {
  run({
    invalid: [
      {
        name: "line comment after a statement",
        code: "export const total = 1; // trailing\n",
        errors: [unexpected],
      },
      {
        name: "block comment after a statement",
        code: "export const total = 1; /* trailing */\n",
        errors: [unexpected],
      },
    ],
  });
});

test("comments in JSX are reported", () => {
  run({
    invalid: [
      {
        name: "expression-container comment",
        code: "export const view = <div>{/* placeholder */}</div>;\n",
        errors: [unexpected],
      },
      {
        name: "comment among JSX attributes",
        code: "export const view = (\n  <div\n    // a stray attribute comment\n    className=\"row\"\n  />\n);\n",
        errors: [unexpected],
      },
    ],
  });
});

test("several comments in one file are reported individually", () => {
  run({
    invalid: [
      {
        code: [
          "// header",
          "export const total = 1; // trailing",
          "/** doc */",
          "export function scale(value) {",
          "  /* inner */",
          "  return value;",
          "}",
          "",
        ].join("\n"),
        errors: [unexpected, unexpected, unexpected, unexpected],
      },
    ],
  });
});

test("an eslint-disable directive is itself a comment and is still reported", () => {
  run({
    invalid: [
      {
        code: "// eslint-disable-next-line agent/no-comments\nexport const total = 1;\n",
        linterOptions: { noInlineConfig: true },
        errors: [{ message: /has no effect because you have 'noInlineConfig'/ }, unexpected],
      },
    ],
  });
});
