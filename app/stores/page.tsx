import fs from "node:fs";
import path from "node:path";

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

function getStores() {
  const csv = fs
    .readFileSync(path.join(process.cwd(), "data", "store_tracker.csv"), "utf8")
    .trim();
  const [headerLine, ...rows] = csv.split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  return rows.map((row) => {
    const values = parseCsvLine(row);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

export default function StoresPage() {
  const stores = getStores();

  return (
    <div className="stack">
      <div>
        <h1 className="page-title">First-wave stores</h1>
        <p className="lead">
          These stores are application targets because a public affiliate/feed
          route is visible. They should not be treated as live product sources
          until approval is granted.
        </p>
      </div>

      <section className="grid">
        {stores.map((store) => (
          <article className="product-card" key={store.store_slug}>
            <div className="product-body">
              <h2 className="product-title">{store.store_name}</h2>
              <p className="meta">
                {store.market} · {store.network}
              </p>
              <p>
                Commission: <strong>{store.commission}</strong>
                <br />
                Cookie: <strong>{store.cookie_days} days</strong>
              </p>
              <p className="small">{store.feed_signal}</p>
              <p className="status">{store.application_status}</p>
              <a className="button secondary" href={store.program_source_url}>
                Program source
              </a>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

