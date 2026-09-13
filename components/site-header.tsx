"use client";

import { Heart, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Wordmark } from "@/components/wordmark";
import { SearchForm } from "@/components/search-form";
import { SearchInput } from "@/components/search-input";
import { ThemeToggle } from "@/components/theme-toggle";
import { copy, formatGenderLabel, type Locale, withLocale } from "@/lib/i18n";
import { useLocaleContext } from "@/lib/use-client-locale";

function languageHref(pathname: string, params: { toString(): string }, locale: Locale) {
  const next = new URLSearchParams(params.toString());
  next.set("lang", locale);
  return `${pathname}${next.size ? `?${next}` : ""}`;
}

function publicPathname(pathname: string) {
  const missingPreviewPrefix = "/__weft-missing-preview/";
  return pathname.startsWith(missingPreviewPrefix)
    ? `/out/${pathname.slice(missingPreviewPrefix.length)}`
    : pathname;
}

export function SiteHeader() {
  const pathname = usePathname();
  const visiblePathname = publicPathname(pathname);
  const params = useSearchParams();
  const { locale, setLocale } = useLocaleContext();
  const header = copy[locale].header;
  const frontend = copy[locale].frontend;
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const locationKey = `${visiblePathname}?${params}`;
  const isHome = visiblePathname === "/";
  const nav = [
    { href: "/search", label: frontend.catalog, active: visiblePathname === "/search" && !params.get("gender") },
    ...["women", "men"].map((gender) => ({ href: `/search?gender=${gender}`, label: formatGenderLabel(gender, locale), active: visiblePathname === "/search" && params.get("gender") === gender })),
    { href: "/stores", label: header.nav.stores, active: visiblePathname === "/stores" },
  ];

  useEffect(() => {
    detailsRef.current?.removeAttribute("open");
  }, [locationKey]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      const details = detailsRef.current;
      if (event.key !== "Escape" || !details?.open) return;
      details.removeAttribute("open");
      details.querySelector("summary")?.focus();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  function closeMobileMenu() {
    detailsRef.current?.removeAttribute("open");
  }

  return (
    <>
      <a className="skip-link" href="#main-content">{copy[locale].common.skipToContent}</a>
      <header className={`site-header${isHome ? " is-home" : ""}`}>
        <Link className="brand" href={withLocale("/", locale)} aria-label={frontend.home}>
          <Wordmark />
        </Link>

        <nav className="desktop-nav" aria-label={header.mainNavAria}>
          {nav.map(({ href, label, active }) => (
            <Link aria-current={active ? "page" : undefined} href={withLocale(href, locale)} key={href}>
              {label}
            </Link>
          ))}
        </nav>

        {isHome && <SearchForm action="/search" className="header-search" role="search">
          {locale === "lt" && <input name="lang" type="hidden" value="lt" />}
          <SearchInput locale={locale} compact />
        </SearchForm>}

        <div className="header-tools">
          <nav className="language-switcher" aria-label={header.languageAria}>
            <Link
              aria-current={locale === "en" ? "true" : undefined}
              href={languageHref(visiblePathname, params, "en")}
              onClick={() => setLocale("en")}
              prefetch={false}
            >
              EN
            </Link>
            <Link
              aria-current={locale === "lt" ? "true" : undefined}
              href={languageHref(visiblePathname, params, "lt")}
              onClick={() => setLocale("lt")}
              prefetch={false}
            >
              LT
            </Link>
          </nav>

          <Link aria-current={visiblePathname === "/account" ? "page" : undefined} aria-label={frontend.saved}
            className="account-link" href={withLocale("/account", locale)} title={frontend.saved}>
            <Heart aria-hidden="true" size={18} strokeWidth={1.4} /><span>{frontend.savedShort}</span>
          </Link>

          <details className="mobile-menu" ref={detailsRef}>
            <summary aria-label={frontend.menu}><Menu aria-hidden="true" size={20} /></summary>
            <span aria-hidden="true" className="mobile-menu-scrim" onClick={closeMobileMenu} />
            <nav aria-label={header.mainNavAria}>
              {nav.map(({ href, label, active }) => (
                <Link
                  aria-current={active ? "page" : undefined}
                  href={withLocale(href, locale)}
                  key={href}
                  onClick={closeMobileMenu}
                >
                  {label}
                </Link>
              ))}
              <Link
                aria-current={visiblePathname === "/ai-fitting-room" ? "page" : undefined}
                className="mobile-menu-secondary"
                href={withLocale("/ai-fitting-room", locale)}
                onClick={closeMobileMenu}
              >
                {frontend.preview3d}
              </Link>
              <Link
                aria-current={visiblePathname === "/account" ? "page" : undefined}
                className="mobile-account-link"
                href={withLocale("/account", locale)}
                onClick={closeMobileMenu}
              >
                <Heart aria-hidden="true" size={18} />
                {frontend.saved}
              </Link>
              <Link href={withLocale("/how-it-works", locale)} onClick={closeMobileMenu}>{copy[locale].footer.links.howItWorks}</Link>
              <ThemeToggle locale={locale} />
              <div className="mobile-menu-locales" aria-label={header.languageAria}>
                <Link
                  aria-current={locale === "en" ? "true" : undefined}
                  href={languageHref(visiblePathname, params, "en")}
                  onClick={() => setLocale("en")}
                  prefetch={false}
                >
                  EN
                </Link>
                <Link
                  aria-current={locale === "lt" ? "true" : undefined}
                  href={languageHref(visiblePathname, params, "lt")}
                  onClick={() => setLocale("lt")}
                  prefetch={false}
                >
                  LT
                </Link>
              </div>
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
