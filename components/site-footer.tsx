"use client";

import Link from "next/link";
import { copy, withLocale } from "@/lib/i18n";
import { useClientLocale } from "@/lib/use-client-locale";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteFooter() {
  const locale = useClientLocale();
  const footer = copy[locale].footer;
  const links = [
    ["/search", copy[locale].header.nav.search],
    ["/stores", copy[locale].header.nav.stores],
    ["/ai-fitting-room", copy[locale].frontend.preview3d],
    ["/how-it-works", footer.links.howItWorks],
    ["/about", footer.links.about],
    ["/contact", footer.links.contact],
    ["/data-sources", footer.links.dataSources],
    ["/affiliate-disclosure", footer.links.affiliate],
    ["/privacy", footer.links.privacy],
    ["/terms", footer.links.terms],
  ] as const;

  return (
    <footer className="site-footer">
      <div className="footer-statement">
        <p>{footer.text}</p>
        <ThemeToggle locale={locale} />
      </div>
      <nav className="footer-links" aria-label={footer.aria}>
        {links.map(([href, label]) => (
          <Link href={withLocale(href, locale)} key={href}>{label}</Link>
        ))}
      </nav>
    </footer>
  );
}
