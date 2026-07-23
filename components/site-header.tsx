"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { copy, getLocale, type Locale, withLocale } from "@/lib/i18n";

function useCurrentLocale() {
  const searchParams = useSearchParams();
  return getLocale({ lang: searchParams.get("lang") ?? undefined });
}

function useLanguageHref(targetLocale: Locale) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  if (targetLocale === "lt") {
    params.set("lang", "lt");
  } else {
    params.delete("lang");
  }

  const queryString = params.toString();
  return `${pathname}${queryString ? `?${queryString}` : ""}`;
}

function LanguageDocumentSync({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}

export function SiteHeader() {
  const locale = useCurrentLocale();
  const common = copy[locale].common;
  const t = copy[locale].header;
  const englishHref = useLanguageHref("en");
  const lithuanianHref = useLanguageHref("lt");

  return (
    <>
      <a className="skip-link" href="#main-content">
        {common.skipToContent}
      </a>
      <LanguageDocumentSync locale={locale} />
      <header className="site-header">
        <div className="header-left">
          <Link className="menu-link" href={withLocale("/search", locale)}>
            {t.browse}
          </Link>
          <nav className="department-nav" aria-label={t.departmentsAria}>
            <Link href={withLocale("/search?gender=women", locale)}>{t.departments.women}</Link>
            <Link href={withLocale("/search?gender=men", locale)}>{t.departments.men}</Link>
            <Link href={withLocale("/search?gender=unisex", locale)}>
              {t.departments.unisex}
            </Link>
            <Link href={withLocale("/search?query=accessories", locale)}>
              {t.departments.accessories}
            </Link>
          </nav>
        </div>
        <Link className="brand" href={withLocale("/", locale)}>
          VIBEWEAR
        </Link>
        <div className="header-right">
          <nav className="nav" aria-label={t.mainNavAria}>
            <Link href={withLocale("/search", locale)}>{t.nav.search}</Link>
            <Link href={withLocale("/stores", locale)}>{t.nav.stores}</Link>
            <Link href={withLocale("/data-sources", locale)}>{t.nav.sources}</Link>
            <Link href={withLocale("/contact", locale)}>{t.nav.contact}</Link>
          </nav>
          <nav className="language-switcher" aria-label={t.languageAria}>
            <Link aria-current={locale === "en" ? "true" : undefined} href={englishHref}>
              EN
            </Link>
            <Link aria-current={locale === "lt" ? "true" : undefined} href={lithuanianHref}>
              LT
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
