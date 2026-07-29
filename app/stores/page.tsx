import fs from "node:fs";
import path from "node:path";
import { CircleDashed, Database, PauseCircle, Store } from "lucide-react";
import { getCopy, getLocale, type SearchParamsInput } from "@/lib/i18n";

type StoreRow = {
  application_status: string;
  market: string;
  network: string;
  source_status: string;
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

    if (char === '"' && inQuotes && line[index + 1] === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function getApplicationTargets() {
  const [headerLine, ...rows] = fs
    .readFileSync(path.join(process.cwd(), "data", "store_tracker.csv"), "utf8")
    .trim()
    .split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  return rows
    .map((row) => {
      const values = parseCsvLine(row);
      return Object.fromEntries(
        headers.map((header, index) => [header, values[index] ?? ""]),
      ) as StoreRow;
    })
    .filter(
      (store) =>
        store.application_status === "ready_to_apply" ||
        store.source_status === "market_suspended",
    );
}

export default async function StoresPage({
  searchParams,
}: StoresPageProps) {
  const locale = getLocale(await searchParams);
  const copy = getCopy(locale).pages.stores;

  return (
    <div className="route-shell stores-route">
      <header className="route-heading">
        <div className="section-rail">
          <span>01</span>
          <p>{locale === "lt" ? "Šaltinių registras" : "Source ledger"}</p>
        </div>
        <div>
          <p className="preview-kicker">
            <Database aria-hidden="true" size={16} /> NO LIVE RETAILER FEEDS
          </p>
          <h1>{copy.title}</h1>
          <p className="lead">{copy.lead}</p>
        </div>
      </header>
      <p className="ledger-intro">{copy.reviewLead}</p>
      <section className="store-ledger" aria-label={copy.title}>
        {getApplicationTargets().map((store, index) => {
          const isPaused = store.source_status === "market_suspended";
          const description =
            copy.descriptions[
              store.store_slug as keyof typeof copy.descriptions
            ] ?? copy.fallbackDescription;

          return (
            <article key={store.store_slug}>
              <span className="store-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Store aria-hidden="true" size={26} />
              <div className="store-main">
                <p className="store-eyebrow">
                  {store.market} · {store.network}
                </p>
                <h2>{store.store_name}</h2>
                <p>{description}</p>
              </div>
              <div className="store-status">
                <span>
                  {isPaused ? (
                    <PauseCircle aria-hidden="true" size={16} />
                  ) : (
                    <CircleDashed aria-hidden="true" size={16} />
                  )}
                  {isPaused
                    ? locale === "lt"
                      ? "Tik stebėjimui"
                      : "Monitoring only"
                    : copy.applicationTarget}
                </span>
                <strong>
                  {isPaused
                    ? locale === "lt"
                      ? "LT rinka sustabdyta"
                      : "LT market paused"
                    : copy.pendingApproval}
                </strong>
                <small>
                  {locale === "lt"
                    ? "Nėra patvirtinto tiesioginio katalogo"
                    : "No approved live catalog"}
                </small>
              </div>
              <span className="text-link disabled" aria-disabled="true">
                {locale === "lt" ? "Laukiama prieigos" : "Awaiting access"}
              </span>
            </article>
          );
        })}
      </section>
    </div>
  );
}
