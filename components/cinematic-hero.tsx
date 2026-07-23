import Link from "next/link";
import { Search } from "lucide-react";
import { getCopy, type Locale, withLocale } from "@/lib/i18n";

const heroImageUrl =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=80";

function delay(ms: number) {
  return { animationDelay: `${ms}ms` };
}

export function CinematicHero({ locale }: { locale: Locale }) {
  const t = getCopy(locale).hero;

  return (
    <section className="cinematic-hero">
      <img
        alt=""
        aria-hidden="true"
        className="cinematic-video"
        src={heroImageUrl}
      />
      <div className="cinematic-scrim" aria-hidden="true" />
      <div className="cinematic-bottom-blur" aria-hidden="true" />

      <div className="cinematic-content">
        <div className="cinematic-copy">
          <div className="hero-proof" style={delay(200)}>
            {t.proof.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <h1 style={delay(300)}>{t.title}</h1>
          <p style={delay(400)}>{t.lead}</p>

          <form action="/search" className="hero-search" style={delay(500)}>
            <Search aria-hidden="true" size={20} />
            {locale === "lt" ? <input name="lang" type="hidden" value="lt" /> : null}
            <input
              aria-label={t.searchAria}
              name="query"
              placeholder={t.searchPlaceholder}
            />
            <button type="submit">{t.submit}</button>
          </form>

          <div className="hero-departments" style={delay(600)}>
            {t.departments.map((department) => (
              <Link href={withLocale(department.href, locale)} key={department.label}>
                {department.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
