"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { LocaleContext } from "@/lib/use-client-locale";

const localeCookie = "weft-locale";

function persistLocale(locale: Locale) {
  document.documentElement.lang = locale;
  document.cookie = `${localeCookie}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitLocale = searchParams.get("lang");
  const routeLocale = explicitLocale === "en" || explicitLocale === "lt"
    ? explicitLocale
    : null;
  const [rememberedLocale, setRememberedLocale] = useState(initialLocale);
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);
  const localeIntent = useRef<Locale | null>(null);
  const locale = resolveLocale(routeLocale, rememberedLocale, pendingLocale);

  const setLocale = useCallback((nextLocale: Locale) => {
    localeIntent.current = nextLocale;
    setRememberedLocale(nextLocale);
    setPendingLocale(nextLocale);
    persistLocale(nextLocale);
  }, []);

  useEffect(() => {
    // Server-rendered links still describe the old locale until navigation
    // commits. Resolve a second click against the synchronous language intent.
    function preserveLocaleIntent(event: MouseEvent) {
      const intent = localeIntent.current;
      if (!intent || event.defaultPrevented || event.button !== 0
        || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.download
        || (anchor.target && anchor.target !== "_self")
        || anchor.closest(".language-switcher, .mobile-menu-locales")
        || anchor.getAttribute("href")?.startsWith("#")) return;
      const destination = new URL(anchor.href, location.href);
      if (destination.origin !== location.origin) return;
      destination.searchParams.set("lang", intent);
      event.preventDefault();
      event.stopImmediatePropagation();
      router.push(`${destination.pathname}${destination.search}${destination.hash}`);
    }
    document.addEventListener("click", preserveLocaleIntent, true);
    return () => document.removeEventListener("click", preserveLocaleIntent, true);
  }, [router]);

  useEffect(() => {
    if (pendingLocale) {
      if (routeLocale === pendingLocale) {
        localeIntent.current = null;
        setRememberedLocale(pendingLocale);
        setPendingLocale(null);
        persistLocale(pendingLocale);
      }
      return;
    }
    if (routeLocale && routeLocale !== rememberedLocale) {
      setRememberedLocale(routeLocale);
    }
    persistLocale(locale);
  }, [locale, pendingLocale, rememberedLocale, routeLocale]);

  const getNavigationLocale = useCallback(() => localeIntent.current ?? locale, [locale]);
  const value = useMemo(() => ({ locale, setLocale, getNavigationLocale }), [locale, setLocale, getNavigationLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function resolveLocale(
  routeLocale: Locale | null,
  rememberedLocale: Locale,
  pendingLocale: Locale | null,
) {
  return pendingLocale ?? routeLocale ?? rememberedLocale;
}
