"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { withLocale } from "@/lib/i18n";
import { useClientLocale } from "@/lib/use-client-locale";
import { getSecondaryCopy } from "@/lib/secondary-copy";

export default function ErrorPage({ error }: { error: Error & { digest?: string } }) {
  const locale = useClientLocale();
  const copy = getSecondaryCopy(locale).state;
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div aria-labelledby="error-title" className="route-shell state-page">
      <AlertTriangle aria-hidden="true" size={32} />
      <h1 id="error-title">{copy.errorTitle}</h1>
      <p role="alert">{copy.errorLead}</p>
      <div className="state-actions">
        <button className="button" onClick={() => window.location.reload()} type="button"><RotateCcw aria-hidden="true" size={18} />{copy.retry}</button>
        <Link className="button secondary" href={withLocale("/", locale)}>{copy.home}</Link>
      </div>
    </div>
  );
}
