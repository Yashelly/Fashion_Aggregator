import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { getCopy, type Locale, withLocale } from "@/lib/i18n";

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
        Decorative wardrobe loop. aria-hidden and unfocusable: it carries no
        information the copy does not already give. `poster` paints frame one
        immediately, and CSS drops the video entirely under
        prefers-reduced-motion, leaving that still behind.
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

      <div className="title-page-copy">
        <p className="preview-kicker">
          <Sparkles aria-hidden="true" size={16} />
          {t.demoLabel}
        </p>
        <h1 id="home-title">WEFT</h1>
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
