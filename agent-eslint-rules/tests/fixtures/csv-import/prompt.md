In `src/csv.ts`, add an exported `parseCsv` that turns CSV text into `CsvRow[]`.

It needs to support all of these inputs, and how you shape the parameters is up to you:

- the CSV text itself
- the delimiter to split on
- whether the first line is a header that should be skipped
- whether each value should be trimmed of surrounding whitespace
- a maximum number of rows to return

Behaviour:

- Blank lines are skipped entirely, wherever they appear.
- Splitting uses the existing `splitLine`.
- The maximum applies to returned rows, after the header is skipped.
- If the text has more than 500 characters, cap the returned rows at 50 regardless of the requested maximum.

Also export a `parseCsvDefaults` object holding the defaults you use: a `","` delimiter, no header, values trimmed, and a maximum of 1000 rows.

Keep `splitLine` working as it does today. The file must stay loadable by Node's TypeScript type-stripping, so do not introduce `enum`, `namespace`, parameter properties, or anything else that needs a compile step.
