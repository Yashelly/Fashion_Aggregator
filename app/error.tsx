"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { getLocale, withLocale } from "@/lib/i18n";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useSearchParams();
  const lang = params.get("lang");
  const locale = lang
    ? getLocale({ lang })
    : typeof document !== "undefined" && document.documentElement.lang === "lt"
      ? "lt"
      : "en";
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="route-shell state-page" role="alert">
      <AlertTriangle aria-hidden="true" size={32} />
      <p className="preview-kicker">{locale === "lt" ? "KATALOGAS LAIKINAI NEPASIEKIAMAS" : "CATALOG TEMPORARILY UNAVAILABLE"}</p>
      <h1>{locale === "lt" ? "Pametėme giją." : "We lost the thread."}</h1>
      <p>{locale === "lt" ? "Peržiūros katalogo nepavyko įkelti. Pirkimas ar veiksmas parduotuvėje nebuvo pradėtas." : "The preview catalog could not be loaded. No purchase or retailer action was started."}</p>
      <div className="state-actions">
        <button className="button" onClick={reset} type="button"><RotateCcw aria-hidden="true" size={18} />{locale === "lt" ? "Bandyti dar kartą" : "Try again"}</button>
        <Link className="button secondary" href={withLocale("/", locale)}>{locale === "lt" ? "Grįžti į pradžią" : "Return home"}</Link>
      </div>
    </div>
  );
}
