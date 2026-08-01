import { ArrowRight, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { getCopy, type Locale, withLocale } from "@/lib/i18n";

export function CinematicHero({ locale }: { locale: Locale }) {
  const t = getCopy(locale).hero;
  const quickLinks = locale === "lt"
    ? [["Miesto juoda", "/search?query=juoda"], ["Vasaros minimalizmas", "/search?query=vasaros minimalizmas"], ["Sportbačiai iki €100", "/search?query=sportbačiai iki 100"]]
    : [["City black", "/search?query=black"], ["Summer minimal", "/search?query=summer minimal"], ["Sneakers under €100", "/search?query=sneakers under 100"]];

  return (
    <section className="discovery-hero" aria-labelledby="home-title">
      {/*
        Decorative wardrobe loop. aria-hidden and unfocusable: it carries no
        information the copy does not already give, so a screen reader gains
        nothing from it. `poster` paints frame one immediately, and CSS drops
        the video entirely under prefers-reduced-motion, leaving that still.
      */}
      <div className="hero-media" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/hero-assets/hero-poster.jpg"
          preload="metadata"
          tabIndex={-1}
        >
          <source src="/hero-assets/hero-loop.webm" type="video/webm" />
          <source src="/hero-assets/hero-loop.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero-copy">
        <p className="preview-kicker">
          <Sparkles aria-hidden="true" size={16} />
          {locale === "lt" ? "DEMO · SINTETINIS KATALOGAS" : "DEMO · SYNTHETIC CATALOG"}
        </p>
        <h1 id="home-title">{locale === "lt" ? <>RASK SAVO<br/><em>STILIŲ</em></> : <>FIND YOUR<br/><em>VIBE.</em></>}</h1>
        <p className="hero-lead">
          {locale === "lt"
            ? "Ieškok pagal drabužį, nuotaiką, spalvą ar kainą. Viena paieška, aiškūs filtrai ir lengvai naršomos atrankos."
            : "Search by item, mood, colour, or price. One search, clear filters, and easy-to-browse edits."}
        </p>
        <form action="/search" className="hero-search" role="search">
          {locale === "lt" ? <input name="lang" type="hidden" value="lt" /> : null}
          <label htmlFor="home-query">{locale === "lt" ? "Ko ieškai?" : "What are you looking for?"}</label>
          <div className="hero-search-row">
            <Search aria-hidden="true" size={22} />
            <input id="home-query" name="query" placeholder={t.searchPlaceholder} required />
            <button type="submit">{locale === "lt" ? "Ieškoti" : "Search"}<ArrowRight aria-hidden="true" size={20} /></button>
          </div>
          <small>{locale === "lt" ? "Pvz. „juodi batai iki 100“" : "Try “black boots under 100”"}</small>
        </form>
      </div>
      <nav className="runway-links" aria-label={locale === "lt" ? "Greitos paieškos" : "Quick searches"}>
        {quickLinks.map(([label, href]) => (
          <Link href={withLocale(href, locale)} key={href}>
            <strong>{label}</strong><ArrowRight aria-hidden="true" size={20} />
          </Link>
        ))}
      </nav>
    </section>
  );
}
