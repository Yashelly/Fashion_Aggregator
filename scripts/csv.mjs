/**
 * Plain-JS twin of `lib/csv.ts` for the Node scripts (listing generation,
 * search evaluation), which cannot import the TypeScript module without a build
 * step. Keep `parseCsvLine` / `parseCsvRecords` in sync with `lib/csv.ts`.
 */

/** Split one CSV line into fields, honoring quotes and `""` escapes. */
export function parseCsvLine(line) {
  const values = [];
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
 * Parse CSV text into header-keyed records. A missing column yields `""`.
 * Empty/whitespace-only text yields `[]`.
 */
export function parseCsvRecords(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const [headerLine, ...rows] = trimmed.split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  return rows.map((row) => {
    const values = parseCsvLine(row);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}
