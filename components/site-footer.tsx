"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { copy, getLocale, withLocale } from "@/lib/i18n";

export function SiteFooter() {
  const params = useSearchParams();
  const locale = getLocale({ lang: params.get("lang") ?? undefined });
  const t = copy[locale].footer;
  const links = [
    ["/how-it-works", t.links.howItWorks], ["/about", t.links.about],
    ["/stores", locale === "lt" ? "Parduotuvės" : "Stores"], ["/contact", t.links.contact],
    ["/data-sources", t.links.dataSources], ["/affiliate-disclosure", t.links.affiliate],
    ["/privacy", t.links.privacy], ["/terms", t.links.terms],
  ] as const;

  return (
    <footer className="site-footer">
      <div className="footer-statement">
        <span className="index-stamp">05</span>
        <div>
          <Link className="footer-brand" href={withLocale("/", locale)}>VIBEWEAR</Link>
          <p>{t.text}</p>
          <p className="preview-line">PREVIEW CATALOG · SYNTHETIC PRODUCTS</p>
        </div>
      </div>
      <nav aria-label={t.aria}>
        {links.map(([href, label]) => (
          <Link href={withLocale(href, locale)} key={href}>{label}<ArrowUpRight aria-hidden="true" size={14} /></Link>
        ))}
      </nav>
    </footer>
  );
}
