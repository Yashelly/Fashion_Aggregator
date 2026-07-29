import { cookies } from "next/headers";

export default async function Loading() {
  const locale = (await cookies()).get("vibewear-locale")?.value === "lt" ? "lt" : "en";
  return (
    <div className="route-shell state-page" aria-busy="true" aria-live="polite">
      <h1>{locale === "lt" ? "Kraunama…" : "Loading…"}</h1>
      <div className="loading-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => <span key={index} />)}
      </div>
    </div>
  );
}
