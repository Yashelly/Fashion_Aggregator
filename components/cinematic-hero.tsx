import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { getCopy, type Locale, withLocale } from "@/lib/i18n";
import { Wordmark } from "@/components/wordmark";

/**
 * The title page: the whole of `/`.
 *
 * Brand, one line of what this is, one way in. It used to carry a search
 * field, quick-search links, a category nav, a product grid and a trust band;
 * all of that duplicated `/search`, which is one click away and does it
 * better.
 *
 * The demo label stays. Everything else went, but the synthetic-catalog
 * boundary is a hard rule in DESIGN.md and this is now the first thing anyone
 * sees — dropping it here would be the one place it actually matters.
 */
export function CinematicHero({ locale }: { locale: Locale }) {
  const t = getCopy(locale).titlePage;

  return (
    <section className="title-page" aria-labelledby="home-title">
      {/*
        Decorative wardrobe still, softly blurred so it reads as texture behind
        the copy rather than a photo competing with it. aria-hidden and purely
        a background image (no video, no motion); the scrim over it keeps the
        headline's contrast.
      */}
      <div className="hero-media" aria-hidden="true" />

      <div className="title-page-copy">
        <p className="preview-kicker">
          <Sparkles aria-hidden="true" size={16} />
          {t.demoLabel}
        </p>
        {/* Plays the hidden-`i` reveal once on entry — "we fit" — and stays
            clickable (Enter/Space too) to replay it. */}
        <h1 id="home-title"><Wordmark animate trigger="load" /></h1>
        <p className="title-page-slogan">{t.slogan}</p>
        <p className="title-page-lead">{t.lead}</p>
        <Link className="button title-page-cta" href={withLocale("/search", locale)}>
          {t.cta}
          <ArrowRight aria-hidden="true" size={20} />
        </Link>
      </div>
    </section>
  );
}
