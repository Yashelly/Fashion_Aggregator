import fs from "node:fs";

/**
 * The single CSV parser for the TypeScript catalog loaders (mock products,
 * store tracker, product attributes, listings). It previously existed as four
 * byte-identical copies; keep new loaders on this one.
 *
 * The plain-JS twin `scripts/csv.mjs` mirrors `parseCsvLine`/`parseCsvRecords`
 * for the Node scripts, which cannot import TypeScript without a build step —
 * keep the two in sync.
 *
 * The grammar is deliberately small: comma-separated fields, `"`-quoted fields
 * that may contain commas, and `""` as an escaped quote inside a quoted field.
 */

/** Split one CSV line into fields, honoring quotes and `""` escapes. */
export function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"' && inQuotes && line[index + 1] === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }
    current += char;
  }

  values.push(current);
  return values;
}

/**
 * Parse CSV text into header-keyed records. A missing column yields `""` (not
 * `undefined`), matching every loader's prior behavior. Empty/whitespace-only
 * text yields `[]`.
 */
export function parseCsvRecords<T extends Record<string, string>>(text: string): T[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const [headerLine, ...rows] = trimmed.split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  return rows.map((row) => {
    const values = parseCsvLine(row);
    return Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    ) as T;
  });
}

/** Read and parse a CSV file. A missing file yields `[]`. */
export function readCsvFile<T extends Record<string, string>>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return [];
  return parseCsvRecords<T>(fs.readFileSync(filePath, "utf8"));
}

/**
 * Throw with a row-numbered message if any record repeats `key`. Row numbers
 * are 1-based over the data rows plus the header line, so they line up with what
 * an editor shows.
 */
export function assertUniqueBy<T extends Record<string, string>>(
  records: T[],
  key: keyof T,
  label: string,
): void {
  const seen = new Set<string>();
  records.forEach((record, index) => {
    const value = String(record[key] ?? "");
    if (seen.has(value)) {
      throw new Error(`[csv] duplicate ${label} "${value}" at row ${index + 2}`);
    }
    seen.add(value);
  });
}
