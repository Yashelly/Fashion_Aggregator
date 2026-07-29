import { cookies } from "next/headers";

export default async function Loading() {
  const locale = (await cookies()).get("vibewear-locale")?.value === "lt" ? "lt" : "en";
  return (
    <div className="route-shell state-page" aria-busy="true" aria-live="polite">
      <p className="preview-kicker">{locale === "lt" ? "VIBEWEAR / INDEKSUOJAMA" : "VIBEWEAR / INDEXING"}</p>
      <h1>{locale === "lt" ? "Atranka kraunama…" : "Loading the edit…"}</h1>
      <p>{locale === "lt" ? "Jūsų paieška išsaugoma, kol ruošiamas sintetinis peržiūros katalogas." : "Keeping your search in place while the synthetic preview catalog is prepared."}</p>
      <div className="loading-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => <span key={index} />)}
      </div>
    </div>
  );
}
