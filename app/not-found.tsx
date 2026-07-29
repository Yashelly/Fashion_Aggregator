import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { withLocale } from "@/lib/i18n";

export default async function NotFound() {
  const locale = (await cookies()).get("vibewear-locale")?.value === "lt" ? "lt" : "en";
  return (
    <div className="route-shell state-page">
      <SearchX aria-hidden="true" size={36} />
      <h1>{locale === "lt" ? "Šios prekės čia nėra." : "This piece isn’t here."}</h1>
      <p>{locale === "lt" ? "Puslapis galėjo būti perkeltas arba ši prekė nebepasiekiama." : "The page may have moved, or this item is no longer available."}</p>
      <div className="state-actions">
        <Link className="button" href={withLocale("/search", locale)}>{locale === "lt" ? "Ieškoti kataloge" : "Search the catalog"}</Link>
        <Link className="text-link" href={withLocale("/", locale)}><ArrowLeft aria-hidden="true" size={18} />{locale === "lt" ? "Grįžti į pradžią" : "Return home"}</Link>
      </div>
    </div>
  );
}
