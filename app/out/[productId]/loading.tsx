/**
 * Instant skeleton for the product preview route.
 *
 * The `/out/[productId]` pages are prerendered static and prefetched by the
 * catalog's <Link>s, so navigation is normally instant. This is the fallback
 * for a cold/slow load: React streams it in immediately while the real page's
 * RSC payload arrives, so a click never leaves the viewport blank. It mirrors
 * the two-column detail layout (gallery + card) using the same containers so
 * there is no layout shift when the content swaps in.
 */
export default function Loading() {
  return (
    <div className="route-shell product-detail-page" aria-hidden="true">
      <div className="detail-skeleton">
        <span className="skeleton skeleton-line skeleton-back" />
        <div className="product-detail-layout">
          <section className="product-gallery">
            <div className="skeleton skeleton-media" />
            <div className="skeleton skeleton-media skeleton-media-secondary" />
          </section>
          <div className="product-detail-card">
            <span className="skeleton skeleton-line skeleton-line-sm" />
            <span className="skeleton skeleton-line skeleton-line-lg" />
            <span className="skeleton skeleton-line skeleton-line-md" />
            <span className="skeleton skeleton-line" />
            <span className="skeleton skeleton-line" />
            <span className="skeleton skeleton-line skeleton-line-md" />
            <span className="skeleton skeleton-cta" />
          </div>
        </div>
      </div>
    </div>
  );
}
