import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { compare, parseJsonl } from "../lib/evaluation.mjs";
import { renderReport } from "../lib/report.mjs";

const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(name);
  return index === -1 || index === args.length - 1 ? undefined : args[index + 1];
};
const input = option("--input");
const output = option("--output") ?? "tests/reports/index.html";
if (!input || args.includes("--help")) {
  console.log("Usage: node tests/scripts/generate-report.mjs --input tests/results/runs.jsonl [--output tests/reports/index.html]");
  process.exit(input ? 0 : 1);
}
const runs = parseJsonl(await readFile(resolve(input), "utf8"));
const report = compare(runs);
await mkdir(dirname(resolve(output)), { recursive: true });
await writeFile(resolve(output), renderReport(report));
console.log(`Wrote ${output} from ${runs.length} runs.`);
