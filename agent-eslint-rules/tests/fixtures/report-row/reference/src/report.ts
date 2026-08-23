export interface ReportRow {
  label: string;
  amount: number;
}

export function formatReportRow(row: ReportRow, width: number): string {
  const amount = row.amount.toFixed(2);
  const padding = Math.max(width - row.label.length - amount.length, 1);
  return `${row.label}${" ".repeat(padding)}${amount}`;
}

const AMOUNT_DECIMALS = 2;
const MAX_UNTRUNCATED_ROWS = 20;
const EMPTY_REPORT = "no data";
const CREDIT_NOTICE = "** contains credits **";
const TRUNCATION_NOTICE = "truncated: showing all 20+ rows";

function pad(left: string, right: string, width: number): string {
  return `${left}${" ".repeat(Math.max(width - left.length - right.length, 1))}${right}`;
}

function total(rows: ReportRow[]): number {
  return rows.reduce((sum, row) => sum + row.amount, 0);
}

export function renderReport(rows: ReportRow[], width: number): string {
  if (rows.length === 0) {
    return EMPTY_REPORT;
  }

  const rule = "-".repeat(width);
  const lines = [pad("LABEL", "AMOUNT", width), rule];

  for (const row of rows) {
    lines.push(formatReportRow(row, width));
  }
  if (rows.some((row) => row.amount < 0)) {
    lines.push(CREDIT_NOTICE);
  }

  lines.push(rule, pad("TOTAL", total(rows).toFixed(AMOUNT_DECIMALS), width));

  if (rows.length > MAX_UNTRUNCATED_ROWS) {
    lines.push(TRUNCATION_NOTICE);
  }

  return lines.join("\n");
}
