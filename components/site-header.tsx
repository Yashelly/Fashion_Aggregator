"use client";

import { Menu, Moon, Sun, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { copy, formatCategoryLabel, formatGenderLabel, getLocale, type Locale, withLocale } from "@/lib/i18n";
import { Wordmark } from "@/components/wordmark";

function languageHref(pathname: string, params: URLSearchParams, locale: Locale) {
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

function persistLocale(locale: Locale) {
  document.documentElement.lang = locale;
  document.cookie = `weft-locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

function ThemeToggle({ locale }: { locale: Locale }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current =
      document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(current);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    setTheme(nextTheme);
    try {
      localStorage.setItem("weft-theme", nextTheme);
    } catch {
      // The visible toggle still works for the current page session.
    }
  };

  const label =
    locale === "lt"
      ? theme === "dark"
        ? "Įjungti šviesų režimą"
        : "Įjungti naktinį režimą"
      : theme === "dark"
        ? "Use light mode"
        : "Use night mode";

  return (
    <button
      aria-label={label}
      className="theme-toggle"
      onClick={toggleTheme}
      title={label}
      type="button"
    >
      {theme === "dark" ? (
        <Sun aria-hidden="true" size={18} />
      ) : (
        <Moon aria-hidden="true" size={18} />
      )}
    </button>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const visiblePathname = publicPathname(pathname);
  const params = useSearchParams();
  const locale = getLocale({ lang: params.get("lang") ?? undefined });
  const t = copy[locale].header;
  /*
   * A shopping-first top bar, matching what every mainstream fashion site leads
   * with: audience departments (Women/Men/Unisex) first, a category entry, the
   * store list (our "brands" analog), the AI feature, and a highlighted Sale.
   * Discovery lives here now; the "about the product" pages (How it works,
   * About) moved to the footer, which already carries them.
   */
  const onSearch = visiblePathname === "/search";
  const genderParam = params.get("gender");
  const categoryParam = params.get("category");
  const statusParam = params.get("status");
  const nav = [
    { href: "/search?gender=women", label: formatGenderLabel("women", locale), active: onSearch && genderParam === "women" },
    { href: "/search?gender=men", label: formatGenderLabel("men", locale), active: onSearch && genderParam === "men" },
    { href: "/search?gender=unisex", label: formatGenderLabel("unisex", locale), active: onSearch && genderParam === "unisex" },
    { href: "/search?category=shoes", label: formatCategoryLabel("shoes", locale), active: onSearch && categoryParam === "shoes" },
    { href: "/stores", label: t.nav.stores, active: visiblePathname === "/stores" },
    { href: "/ai-fitting-room", label: locale === "lt" ? "AI matavimasis" : "AI fitting room", active: visiblePathname === "/ai-fitting-room" },
    { href: "/search?status=sale", label: locale === "lt" ? "Išpardavimas" : "Sale", active: onSearch && statusParam === "sale", highlight: true },
  ];
  const accountLabel = locale === "lt" ? "Mano paskyra" : "My account";

  useEffect(() => {
    persistLocale(locale);
  }, [locale]);

  return (
    <>
      <a className="skip-link" href="#main-content">{copy[locale].common.skipToContent}</a>
      <header className="site-header">
        <Link className="brand" href={withLocale("/", locale)} aria-label={locale === "lt" ? "Weft pradinis puslapis" : "Weft home"}>
          <Wordmark />
        </Link>
        <nav className="desktop-nav" aria-label={t.mainNavAria}>
          {nav.map(({ href, label, active, highlight }) => (
            <Link
              aria-current={active ? "page" : undefined}
              className={highlight ? "nav-sale" : undefined}
              href={withLocale(href, locale)}
              key={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-tools">
          <Link
            aria-current={visiblePathname === "/account" ? "page" : undefined}
            aria-label={accountLabel}
            className="account-link"
            href={withLocale("/account", locale)}
            title={accountLabel}
          >
            <UserRound aria-hidden="true" size={19} />
          </Link>
          <ThemeToggle locale={locale} />
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
            <span
              aria-hidden="true"
              className="mobile-menu-scrim"
              onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}
            />
            <nav aria-label={t.mainNavAria}>
              {nav.map(({ href, label, active, highlight }) => (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={highlight ? "nav-sale" : undefined}
                  href={withLocale(href, locale)}
                  key={href}
                  onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}
                >
                  {label}
                </Link>
              ))}
              <Link
                aria-current={visiblePathname === "/account" ? "page" : undefined}
                className="mobile-account-link"
                href={withLocale("/account", locale)}
                onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}
              >
                <UserRound aria-hidden="true" size={18} />
                {accountLabel}
              </Link>
              <div className="mobile-menu-locales" aria-label={t.languageAria}>
                <a
                  aria-current={locale === "en" ? "true" : undefined}
                  href={languageHref(visiblePathname, params, "en")}
                  onClick={() => persistLocale("en")}
                >
                  EN
                </a>
                <a
                  aria-current={locale === "lt" ? "true" : undefined}
                  href={languageHref(visiblePathname, params, "lt")}
                  onClick={() => persistLocale("lt")}
                >
                  LT
                </a>
              </div>
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
