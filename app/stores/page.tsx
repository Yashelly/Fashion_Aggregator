import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { getCopy, getLocale, type SearchParamsInput, withLocale } from "@/lib/i18n";

type StoreRow = {
  market: string;
  store_name: string;
  store_slug: string;
};

type StoresPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
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

function getStores(): StoreRow[] {
  const csv = fs
    .readFileSync(path.join(process.cwd(), "data", "store_tracker.csv"), "utf8")
    .trim();
  const [headerLine, ...rows] = csv.split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  return rows.map((row) => {
    const values = parseCsvLine(row);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])) as StoreRow;
  });
}

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const locale = getLocale(await searchParams);
  const t = getCopy(locale).pages.stores;
  const stores = getStores();

  return (
    <div className="stack">
      <div>
        <h1 className="page-title">{t.title}</h1>
        <p className="lead">{t.lead}</p>
      </div>

      <section className="grid">
        {stores.map((store) => {
          const description =
            t.descriptions[store.store_slug as keyof typeof t.descriptions] ??
            t.fallbackDescription;

          return (
            <article className="product-card" key={store.store_slug}>
              <div className="product-body">
                <h2 className="product-title">{store.store_name}</h2>
                <p className="meta">
                  {store.market} · {t.retailerSource}
                </p>
                <p>{description}</p>
                <p className="small">{t.checkDetails}</p>
                <Link
                  className="button secondary"
                  href={withLocale(`/search?store=${store.store_slug}`, locale)}
                >
                  {t.explore}
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
