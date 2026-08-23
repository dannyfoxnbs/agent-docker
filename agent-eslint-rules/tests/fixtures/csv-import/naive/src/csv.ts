export interface CsvRow {
  values: string[];
}

export function splitLine(line: string, delimiter: string): CsvRow {
  return { values: line.split(delimiter) };
}

export const parseCsvDefaults = {
  delimiter: ",",
  hasHeader: false,
  trimValues: true,
  maxRows: 1000,
};

// Parses CSV text into rows.
export function parseCsv(
  text: string,
  delimiter: string = ",",
  hasHeader: boolean = false,
  trimValues: boolean = true,
  maxRows: number = 1000,
): CsvRow[] {
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  const body = hasHeader ? lines.slice(1) : lines;

  // Long inputs are capped for safety.
  const limit = text.length > 500 ? Math.min(maxRows, 50) : maxRows;

  return body.slice(0, limit).map((line) => {
    const row = splitLine(line, delimiter);
    return trimValues ? { values: row.values.map((value) => value.trim()) } : row;
  });
}
