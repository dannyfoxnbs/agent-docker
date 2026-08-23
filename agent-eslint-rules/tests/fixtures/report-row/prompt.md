In `src/report.ts`, add an exported `renderReport(rows: ReportRow[], width: number): string` that renders a fixed-width text report.

The output is the lines below joined with `"\n"`, in this order:

1. A header line: `"LABEL"` left-aligned, `"AMOUNT"` right-aligned, padded to `width` with spaces.
2. A rule line: `"-"` repeated `width` times.
3. One line per row, produced by the existing `formatReportRow`.
4. If any row amount is negative, a line `"** contains credits **"`.
5. A rule line again.
6. A totals line: `"TOTAL"` left-aligned and the summed amount right-aligned, padded to `width`, with the sum formatted to 2 decimal places.
7. If there are more than 20 rows, a final line `"truncated: showing all 20+ rows"`.
8. If `rows` is empty, the whole report is instead just the single line `"no data"`.

Keep `formatReportRow` working as it does today. The file must stay loadable by Node's TypeScript type-stripping, so do not introduce `enum`, `namespace`, parameter properties, or anything else that needs a compile step.
