export interface CsvRow {
  values: string[];
}

export function splitLine(line: string, delimiter: string): CsvRow {
  return { values: line.split(delimiter) };
}

export interface ParseCsvOptions {
  delimiter: string;
  hasHeader: boolean;
  trimValues: boolean;
  maxRows: number;
}

const DEFAULT_MAX_ROWS = 1000;
const LARGE_TEXT_CHARS = 500;
const LARGE_TEXT_MAX_ROWS = 50;

export const parseCsvDefaults: ParseCsvOptions = {
  delimiter: ",",
  hasHeader: false,
  trimValues: true,
  maxRows: DEFAULT_MAX_ROWS,
};

function rowLimit(text: string, maxRows: number): number {
  return text.length > LARGE_TEXT_CHARS ? Math.min(maxRows, LARGE_TEXT_MAX_ROWS) : maxRows;
}

export function parseCsv(text: string, options: ParseCsvOptions = parseCsvDefaults): CsvRow[] {
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  const body = options.hasHeader ? lines.slice(1) : lines;

  return body.slice(0, rowLimit(text, options.maxRows)).map((line) => {
    const row = splitLine(line, options.delimiter);
    return options.trimValues ? { values: row.values.map((value) => value.trim()) } : row;
  });
}
