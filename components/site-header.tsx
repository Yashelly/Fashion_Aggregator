"use client";

import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { copy, getLocale, type Locale, withLocale } from "@/lib/i18n";

function languageHref(pathname: string, params: URLSearchParams, locale: Locale) {
  const next = new URLSearchParams(params.toString());
  next.set("lang", locale);
  return `${pathname}${next.size ? `?${next}` : ""}`;
}

function publicPathname(pathname: string) {
  const missingPreviewPrefix = "/__vibewear-missing-preview/";
  return pathname.startsWith(missingPreviewPrefix)
    ? `/out/${pathname.slice(missingPreviewPrefix.length)}`
    : pathname;
}

function persistLocale(locale: Locale) {
  document.documentElement.lang = locale;
  document.cookie = `vibewear-locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function SiteHeader() {
  const pathname = usePathname();
  const visiblePathname = publicPathname(pathname);
  const params = useSearchParams();
  const locale = getLocale({ lang: params.get("lang") ?? undefined });
  const t = copy[locale].header;
  const nav = [
    ["/search", t.nav.search],
    ["/stores", t.nav.stores],
    ["/how-it-works", locale === "lt" ? "Kaip veikia" : "How it works"],
    ["/about", t.nav.about],
  ] as const;

  useEffect(() => {
    persistLocale(locale);
  }, [locale]);

  return (
    <>
      <a className="skip-link" href="#main-content">{copy[locale].common.skipToContent}</a>
      <header className="site-header">
        <Link className="brand" href={withLocale("/", locale)} aria-label={locale === "lt" ? "VIBEWEAR pradinis puslapis" : "VIBEWEAR home"}>
          VIBEWEAR<span aria-hidden="true">/INDEX</span>
        </Link>
        <nav className="desktop-nav" aria-label={t.mainNavAria}>
          {nav.map(([href, label]) => (
            <Link aria-current={visiblePathname === href ? "page" : undefined} href={withLocale(href, locale)} key={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-tools">
          <Link className="header-search" href={withLocale("/search", locale)}>
            <Search aria-hidden="true" size={18} /> <span>{t.nav.search}</span>
          </Link>
          <nav className="language-switcher" aria-label={t.languageAria}>
            <a
              aria-current={locale === "en" ? "true" : undefined}
              href={languageHref(visiblePathname, params, "en")}
              onClick={() => persistLocale("en")}
            >
              EN
            </a>
            <span aria-hidden="true">/</span>
            <a
              aria-current={locale === "lt" ? "true" : undefined}
              href={languageHref(visiblePathname, params, "lt")}
              onClick={() => persistLocale("lt")}
            >
              LT
            </a>
          </nav>
          <details className="mobile-menu">
            <summary aria-label={locale === "lt" ? "Atverti navigaciją" : "Open navigation"}><Menu aria-hidden="true" size={20} /></summary>
            <nav aria-label={t.mainNavAria}>
              {nav.map(([href, label]) => <Link href={withLocale(href, locale)} key={href}>{label}</Link>)}
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
