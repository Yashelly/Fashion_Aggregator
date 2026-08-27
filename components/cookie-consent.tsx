"use client";

/**
 * Cookie consent banner — staged, not live.
 *
 * Rendered only when `NEXT_PUBLIC_COOKIE_BANNER_ENABLED` is `"true"`, so it can
 * be exercised in development without appearing in production before it is
 * needed. It ships ahead of the first real affiliate link rather than after,
 * because that is the point at which consent stops being optional.
 *
 * DECISION — this banner does NOT gate the analytics endpoints.
 * `app/api/analytics/search` and `app/api/analytics/click` are a genuine no-op
 * (no persistence, no identifier cookie) unless a sink is configured — neither
 * `POSTHOG_PROJECT_API_KEY` nor Supabase env — and both are deliberately unset
 * until there is real traffic. That no-op is the current cover. But once a sink
 * IS enabled, the choice recorded here still does not gate collection; wiring it
 * in is required before analytics is switched on for real. It is not done yet,
 * and this comment is the record that it was a decision rather than an oversight.
 *
 * The reject action is given the same weight as accept, which EU guidance
 * requires: refusing must not be harder than consenting.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { copy, withLocale } from "@/lib/i18n";
import { useClientLocale } from "@/lib/use-client-locale";

const STORAGE_KEY = "weft-cookie-consent";

type Consent = "accepted" | "essential";

export function CookieConsent() {
  const locale = useClientLocale();
  const t = copy[locale].cookieBanner;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_COOKIE_BANNER_ENABLED !== "true") return;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage blocked; show the banner rather than assume consent.
    }
    if (stored !== "accepted" && stored !== "essential") setVisible(true);
  }, []);

  const choose = (consent: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, consent);
    } catch {
      // The choice still applies to this page view.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside aria-label={t.ariaLabel} className="cookie-consent" role="region">
      <div className="cookie-consent-text">
        <p className="cookie-consent-title">{t.title}</p>
        <p>{t.body}</p>
        <Link href={withLocale("/privacy", locale)}>{t.privacyLink}</Link>
      </div>
      <div className="cookie-consent-actions">
        <button className="button" onClick={() => choose("accepted")} type="button">
          {t.accept}
        </button>
        <button className="button" onClick={() => choose("essential")} type="button">
          {t.reject}
        </button>
      </div>
    </aside>
  );
}
