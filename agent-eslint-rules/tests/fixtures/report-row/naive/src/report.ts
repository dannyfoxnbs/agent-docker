export interface ReportRow {
  label: string;
  amount: number;
}

export function formatReportRow(row: ReportRow, width: number): string {
  const amount = row.amount.toFixed(2);
  const padding = Math.max(width - row.label.length - amount.length, 1);
  return `${row.label}${" ".repeat(padding)}${amount}`;
}

// Renders a fixed width report: header, rule, rows, credit notice, totals.
export function renderReport(rows: ReportRow[], width: number): string {
  if (rows.length === 0) {
    return "no data";
  }

  const lines: string[] = [];

  // Header
  const header = "LABEL";
  const amountHeader = "AMOUNT";
  lines.push(
    `${header}${" ".repeat(Math.max(width - header.length - amountHeader.length, 1))}${amountHeader}`,
  );
  lines.push("-".repeat(width));

  for (const row of rows) {
    lines.push(formatReportRow(row, width));
  }

  if (rows.some((row) => row.amount < 0)) {
    lines.push("** contains credits **");
  }

  lines.push("-".repeat(width));

  // Totals
  const sum = rows.reduce((accumulator, row) => accumulator + row.amount, 0).toFixed(2);
  lines.push(`TOTAL${" ".repeat(Math.max(width - 5 - sum.length, 1))}${sum}`);

  if (rows.length > 20) {
    lines.push("truncated: showing all 20+ rows");
  }

  return lines.join("\n");
}
