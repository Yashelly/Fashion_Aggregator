"use client";

import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getLocale, withLocale, type Locale } from "@/lib/i18n";

export default function NotFound() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )vibewear-locale=([^;]+)/);
    setLocale(getLocale({ lang: match ? decodeURIComponent(match[1]) : undefined }));
  }, []);

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
