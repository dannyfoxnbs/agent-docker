// An arm is allowed to finish while its diff still violates the standard. In real
// use that is not the end of the work - it is the point where a human reads the
// diff and sends it back. Not charging anybody for that turn makes an unenforced
// arm look free, so every arm runs the same review loop until the work is
// acceptable or the round budget runs out.
//
// Two styles, because they bracket the real cost of a re-prompt:
//   standard - what a reviewer says from memory, the correction DESIGN.md §1
//              says should not have to be repeated every session. The realistic
//              case, and the default.
//   lint     - the reviewer pastes the exact violations. Cheapest possible
//              re-prompt, so it is a lower bound on what a human round costs.
export const CORRECTION_STYLES = ["standard", "lint"];

// The house style in prose, stated once. This is the single source of truth for
// what a human would say from memory, and it is deliberately shared by two
// different arms of the experiment:
//
//   no-lint - never sees it until the work comes back for review
//   prompt  - sees it up front, in CLAUDE.md, before writing a line
//
// Sharing the text is what makes those two arms informationally comparable: the
// only difference is *when* the agent is told, not what it is told. Every rule
// in README.md's table appears here, so an arm that follows it exactly can
// reach a clean diff without guessing.
export const HOUSE_STYLE_RULES = [
  "- no comments anywhere in the code, it needs to read on its own",
  "- no bare numeric literals - pull them out into named constants",
  "- at most 3 parameters on a function",
  "- no function longer than 100 lines - split it up",
].join("\n");

const STANDARD_STYLE_NOTE = [
  "Before I can take this, the usual house style:",
  "",
  HOUSE_STYLE_RULES,
  "",
  "Same as every time. Please fix it.",
].join("\n");

function behaviourCorrection(checkOutput) {
  return [
    "I ran this and it does not behave correctly:",
    "",
    "```",
    (checkOutput ?? "").split("\n").slice(-20).join("\n").trim(),
    "```",
    "",
    "Please fix it.",
  ].join("\n");
}

function lintCorrection(violations) {
  return [
    "Our agent lint flags these on the lines you changed:",
    "",
    "```",
    violations.map((violation) => `${violation.file}:${violation.line}  ${violation.message}  ${violation.ruleId}`).join("\n"),
    "```",
    "",
    "Please fix them.",
  ].join("\n");
}

// Behaviour always takes priority: a reviewer who finds broken code sends that
// back first and does not spend the round on style.
export function correctionPrompt({ verdict, style }) {
  if (!verdict.taskPassed) {
    return { kind: "behaviour", prompt: behaviourCorrection(verdict.taskCheckOutput) };
  }
  if (verdict.residualViolations > 0) {
    return style === "lint"
      ? { kind: "lint", prompt: lintCorrection(verdict.residualDetail) }
      : { kind: "standard", prompt: STANDARD_STYLE_NOTE };
  }
  return null;
}
