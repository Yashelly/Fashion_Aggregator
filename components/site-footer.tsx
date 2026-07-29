"use client";

import { ArrowRight } from "lucide-react";
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
        <Link className="footer-brand" href={withLocale("/", locale)}>VIBEWEAR</Link>
        <p>{t.text}</p>
      </div>
      <div className="footer-links">
        <nav aria-label={locale === "lt" ? "Atrasti" : "Discover"}>
          <p>{locale === "lt" ? "Atrasti" : "Discover"}</p>
          {links.slice(0, 4).map(([href, label]) => (
            <Link href={withLocale(href, locale)} key={href}>
              {label}<ArrowRight aria-hidden="true" size={14} />
            </Link>
          ))}
        </nav>
        <nav aria-label={locale === "lt" ? "Informacija" : "Information"}>
          <p>{locale === "lt" ? "Informacija" : "Information"}</p>
          {links.slice(4).map(([href, label]) => (
            <Link href={withLocale(href, locale)} key={href}>
              {label}<ArrowRight aria-hidden="true" size={14} />
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
