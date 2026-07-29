import { ArrowRight, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { getCopy, type Locale, withLocale } from "@/lib/i18n";

export function CinematicHero({ locale }: { locale: Locale }) {
  const t = getCopy(locale).hero;
  const quickLinks = locale === "lt"
    ? [["01", "Miesto juoda", "/search?query=juoda"], ["02", "Vasaros minimalizmas", "/search?query=vasaros minimalizmas"], ["03", "Sportbačiai iki €100", "/search?query=sportbačiai iki 100"]]
    : [["01", "City black", "/search?query=black"], ["02", "Summer minimal", "/search?query=summer minimal"], ["03", "Sneakers under €100", "/search?query=sneakers under 100"]];

  return (
    <section className="discovery-hero" aria-labelledby="home-title">
      <div className="hero-copy">
        <p className="preview-kicker"><Sparkles aria-hidden="true" size={16} /> PREVIEW CATALOG · SYNTHETIC PRODUCTS</p>
        <h1 id="home-title">{locale === "lt" ? <>RASK SAVO<br/><em>STILIŲ.</em></> : <>FIND YOUR<br/><em>VIBE.</em></>}</h1>
        <p className="hero-lead">{locale === "lt" ? "Ieškok pagal drabužį, nuotaiką, spalvą ar kainą. Pirkimas vyks pardavėjo svetainėje, kai šaltiniai bus patvirtinti." : "Search by item, mood, colour, or price. Checkout will happen on retailer sites once sources are approved."}</p>
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
        {quickLinks.map(([number, label, href]) => (
          <Link href={withLocale(href, locale)} key={number}>
            <span>{number}</span><strong>{label}</strong><ArrowRight aria-hidden="true" size={20} />
          </Link>
        ))}
      </nav>
    </section>
  );
}
