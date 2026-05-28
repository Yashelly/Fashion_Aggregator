export default function DataSourcesPage() {
  return (
    <div className="stack">
      <h1 className="page-title">Data sources</h1>
      <section className="section">
        <p>
          Live product data should come from approved affiliate product feeds,
          approved affiliate deeplinks, merchant-provided exports, or direct
          merchant permission.
        </p>
        <p>
          The current demo uses synthetic mock products only. It is intentionally
          not a scraped retailer catalog.
        </p>
        <p>
          Retailers can request corrections, removal, or partnership discussion
          through the contact page.
        </p>
      </section>
    </div>
  );
}

