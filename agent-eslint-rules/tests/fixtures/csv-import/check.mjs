import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const { parseCsv, parseCsvDefaults, splitLine } = await import(pathToFileURL(resolve(process.cwd(), "src/csv.ts")).href);

assert.equal(typeof parseCsv, "function", "parseCsv must be exported");
assert.equal(typeof parseCsvDefaults, "object", "parseCsvDefaults must be exported");

const defaults = Object.values(parseCsvDefaults);
assert.ok(defaults.includes(","), "parseCsvDefaults carries the comma delimiter");
assert.ok(defaults.includes(1000), "parseCsvDefaults carries the 1000 row maximum");

const callForms = [
  (text, o) => parseCsv(text, o),
  (text, o) => parseCsv({ text, ...o }),
  (text, o) => parseCsv({ ...o, csv: text }),
  (text, o) => parseCsv(text, o.delimiter, o.hasHeader, o.trimValues, o.maxRows),
];

const rowsOf = (result) => result.map((row) => row.values);

const probeText = "h1;h2\n\n a ; b \nc;d";
const probeOptions = { delimiter: ";", hasHeader: true, trimValues: true, maxRows: 1 };
const probeExpected = [["a", "b"]];

let call = null;
const attempts = [];
for (const form of callForms) {
  try {
    const rows = rowsOf(form(probeText, probeOptions));
    if (JSON.stringify(rows) === JSON.stringify(probeExpected)) {
      call = form;
      break;
    }
    attempts.push(JSON.stringify(rows));
  } catch (error) {
    attempts.push(error.message);
  }
}

assert.ok(
  call,
  `no supported parseCsv call form produced ${JSON.stringify(probeExpected)}; got ${attempts.join(" | ")}`,
);

assert.deepEqual(
  rowsOf(call("a,b\nc,d", { delimiter: ",", hasHeader: false, trimValues: true, maxRows: 1000 })),
  [["a", "b"], ["c", "d"]],
  "plain parse",
);

assert.deepEqual(
  rowsOf(call("a,b\n\n\nc,d\n", { delimiter: ",", hasHeader: false, trimValues: true, maxRows: 1000 })),
  [["a", "b"], ["c", "d"]],
  "blank lines skipped anywhere",
);

assert.deepEqual(
  rowsOf(call("head,er\na,b\nc,d", { delimiter: ",", hasHeader: true, trimValues: true, maxRows: 1000 })),
  [["a", "b"], ["c", "d"]],
  "header skipped",
);

assert.deepEqual(
  rowsOf(call(" a , b ", { delimiter: ",", hasHeader: false, trimValues: false, maxRows: 1000 })),
  [[" a ", " b "]],
  "untrimmed values preserved",
);

assert.deepEqual(
  rowsOf(call("a,b\nc,d\ne,f", { delimiter: ",", hasHeader: false, trimValues: true, maxRows: 2 })),
  [["a", "b"], ["c", "d"]],
  "row maximum applied",
);

{
  const long = Array.from({ length: 120 }, (_, index) => `row${index},${"x".repeat(6)}`).join("\n");
  assert.ok(long.length > 500, "fixture text exceeds the 500 character cap");
  const rows = rowsOf(call(long, { delimiter: ",", hasHeader: false, trimValues: true, maxRows: 1000 }));
  assert.equal(rows.length, 50, "long text capped at 50 rows");
}

assert.deepEqual(splitLine("x|y", "|").values, ["x", "y"], "splitLine unchanged");
