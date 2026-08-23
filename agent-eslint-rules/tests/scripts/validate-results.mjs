import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseJsonl, validateRun } from "../lib/evaluation.mjs";

const input = process.argv[2];
if (!input) {
  console.log("Usage: node tests/scripts/validate-results.mjs tests/results/runs.jsonl");
  process.exit(1);
}
const runs = parseJsonl(await readFile(resolve(input), "utf8"));
const errors = runs.flatMap((run, index) => validateRun(run).map((error) => `line ${index + 1}: ${error}`));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`${runs.length} valid evaluation run(s).`);
