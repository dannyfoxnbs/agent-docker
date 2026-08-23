import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const { renderReport, formatReportRow } = await import(pathToFileURL(resolve(process.cwd(), "src/report.ts")).href);

assert.equal(typeof renderReport, "function", "renderReport must be exported");

assert.equal(renderReport([], 20), "no data", "empty report");

const width = 24;
const pad = (left, right) => `${left}${" ".repeat(Math.max(width - left.length - right.length, 1))}${right}`;

{
  const rows = [
    { label: "Licences", amount: 120.5 },
    { label: "Support", amount: 40 },
  ];
  const lines = renderReport(rows, width).split("\n");
  assert.equal(lines[0], pad("LABEL", "AMOUNT"), "header line");
  assert.equal(lines[1], "-".repeat(width), "rule line");
  assert.equal(lines[2], formatReportRow(rows[0], width), "row 1 delegates to formatReportRow");
  assert.equal(lines[3], formatReportRow(rows[1], width), "row 2 delegates to formatReportRow");
  assert.equal(lines[4], "-".repeat(width), "closing rule line");
  assert.equal(lines[5], pad("TOTAL", "160.50"), "totals line");
  assert.equal(lines.length, 6, "no extra lines");
}

{
  const rows = [
    { label: "Licences", amount: 120 },
    { label: "Refund", amount: -20 },
  ];
  const lines = renderReport(rows, width).split("\n");
  assert.equal(lines[4], "** contains credits **", "credit notice after the rows");
  assert.equal(lines[6], pad("TOTAL", "100.00"), "totals line after the notice");
}

{
  const rows = Array.from({ length: 21 }, (_, index) => ({ label: `Row ${index}`, amount: 1 }));
  const lines = renderReport(rows, width).split("\n");
  assert.equal(lines.at(-1), "truncated: showing all 20+ rows", "truncation notice last");
  assert.equal(lines.at(-2), pad("TOTAL", "21.00"), "totals line before the notice");
}

assert.equal(
  formatReportRow({ label: "A", amount: 2 }, 10),
  `A${" ".repeat(5)}2.00`,
  "formatReportRow unchanged",
);
