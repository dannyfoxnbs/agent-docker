export interface ReportRow {
  label: string;
  amount: number;
}

export function formatReportRow(row: ReportRow, width: number): string {
  const amount = row.amount.toFixed(2);
  const padding = Math.max(width - row.label.length - amount.length, 1);
  return `${row.label}${" ".repeat(padding)}${amount}`;
}
