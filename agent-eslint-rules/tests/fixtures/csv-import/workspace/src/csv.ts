export interface CsvRow {
  values: string[];
}

export function splitLine(line: string, delimiter: string): CsvRow {
  return { values: line.split(delimiter) };
}
