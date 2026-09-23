/**
 * A small RFC 4180 CSV parser for the contributor-facing series files. Quoted
 * fields may contain commas, newlines and doubled quotes. The first row is the
 * header; every record becomes an object keyed by it, with missing trailing
 * cells read as empty strings.
 */
export type CsvRecord = Record<string, string>;

const splitRows = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (inQuotes) {
      if (char !== '"') {
        field += char;
        continue;
      }
      if (text[index + 1] === '"') {
        field += '"';
        index += 1;
        continue;
      }
      inQuotes = false;
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim().length > 0));
};

export const parseCsv = (text: string): CsvRecord[] => {
  const rows = splitRows(text.replace(/^﻿/, ""));
  const header = rows[0];
  if (!header) return [];
  const keys = header.map((key) => key.trim());
  return rows.slice(1).map((cells) => {
    const record: CsvRecord = {};
    keys.forEach((key, index) => {
      record[key] = (cells[index] ?? "").trim();
    });
    return record;
  });
};
