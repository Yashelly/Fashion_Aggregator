"use client";

import { Menu, Moon, Palette, Sun, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
      localStorage.setItem("vibewear-theme", nextTheme);
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

function VariantToggle({ locale }: { locale: Locale }) {
  const [variant, setVariant] = useState<"a" | "b">("a");

  useEffect(() => {
    const current =
      document.documentElement.dataset.visualVariant === "b" ? "b" : "a";
    setVariant(current);
  }, []);

  const toggleVariant = () => {
    const nextVariant = variant === "b" ? "a" : "b";
    document.documentElement.dataset.visualVariant = nextVariant;
    setVariant(nextVariant);
    try {
      localStorage.setItem("vibewear-visual-variant", nextVariant);
    } catch {
      // The visible toggle still works for the current page session.
    }
  };

  const label =
    locale === "lt"
      ? variant === "b"
        ? "Grįžti prie A varianto"
        : "Peržiūrėti B variantą"
      : variant === "b"
        ? "Switch to variant A"
        : "Preview variant B";

  return (
    <button
      aria-label={label}
      aria-pressed={variant === "b"}
      className="theme-toggle variant-toggle"
      onClick={toggleVariant}
      title={label}
      type="button"
    >
      <Palette aria-hidden="true" size={18} />
    </button>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const visiblePathname = publicPathname(pathname);
  const params = useSearchParams();
  const locale = getLocale({ lang: params.get("lang") ?? undefined });
  const t = copy[locale].header;
  const nav = [
    { href: "/search", label: t.nav.search, temporary: false },
    { href: "/stores", label: t.nav.stores, temporary: false },
    {
      href: "/ai-fitting-room",
      label: locale === "lt" ? "AI matavimasis" : "AI fitting room",
      temporary: false,
    },
    {
      href: "/how-it-works",
      label: locale === "lt" ? "Kaip veikia" : "How it works",
      temporary: true,
    },
    { href: "/about", label: t.nav.about, temporary: true },
  ] as const;
  const accountLabel = locale === "lt" ? "Mano paskyra" : "My account";

  useEffect(() => {
    persistLocale(locale);
  }, [locale]);

  return (
    <>
      <a className="skip-link" href="#main-content">{copy[locale].common.skipToContent}</a>
      <header className="site-header">
        <Link className="brand" href={withLocale("/", locale)} aria-label={locale === "lt" ? "VIBEWEAR pradinis puslapis" : "VIBEWEAR home"}>
          VIBEWEAR
        </Link>
        <nav className="desktop-nav" aria-label={t.mainNavAria}>
          {nav.map(({ href, label, temporary }) => (
            <Link
              aria-current={visiblePathname === href ? "page" : undefined}
              className={temporary ? "nav-temporary" : undefined}
              href={withLocale(href, locale)}
              key={href}
              title={temporary ? (locale === "lt" ? "Laikinas puslapis" : "Temporary page") : undefined}
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
          <VariantToggle locale={locale} />
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
              {nav.map(({ href, label, temporary }) => (
                <Link
                  aria-current={visiblePathname === href ? "page" : undefined}
                  className={temporary ? "nav-temporary" : undefined}
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
