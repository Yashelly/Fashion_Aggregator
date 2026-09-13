"use client";

import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";
import { withLocale } from "@/lib/i18n";
import { getSecondaryCopy } from "@/lib/secondary-copy";
import { useClientLocale } from "@/lib/use-client-locale";

export default function NotFound() {
  const locale = useClientLocale();
  const copy = getSecondaryCopy(locale).state;

  return (
    <div className="route-shell state-page">
      <SearchX aria-hidden="true" size={36} />
      <h1>{copy.notFoundTitle}</h1>
      <p>{copy.notFoundLead}</p>
      <div className="state-actions">
        <Link className="button" href={withLocale("/search", locale)}>{copy.search}</Link>
        <Link className="text-link" href={withLocale("/", locale)}><ArrowLeft aria-hidden="true" size={18} />{copy.home}</Link>
      </div>
    </div>
  );
}
