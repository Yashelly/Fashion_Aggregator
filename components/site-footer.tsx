"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { copy, getLocale, withLocale } from "@/lib/i18n";

export function SiteFooter() {
  const searchParams = useSearchParams();
  const locale = getLocale({ lang: searchParams.get("lang") ?? undefined });
  const t = copy[locale].footer;

  return (
    <footer className="site-footer">
      <div>
        <Link className="footer-brand" href={withLocale("/", locale)}>
          VIBEWEAR
        </Link>
        <p>{t.text}</p>
      </div>
      <nav aria-label={t.aria}>
        <Link href={withLocale("/how-it-works", locale)}>{t.links.howItWorks}</Link>
        <Link href={withLocale("/data-sources", locale)}>{t.links.dataSources}</Link>
        <Link href={withLocale("/affiliate-disclosure", locale)}>
          {t.links.affiliate}
        </Link>
        <Link href={withLocale("/privacy", locale)}>{t.links.privacy}</Link>
        <Link href={withLocale("/terms", locale)}>{t.links.terms}</Link>
        <Link href={withLocale("/contact", locale)}>{t.links.contact}</Link>
      </nav>
    </footer>
  );
}
