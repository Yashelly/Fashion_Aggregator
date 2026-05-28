export default function HowItWorksPage() {
  return (
    <div className="stack">
      <h1 className="page-title">How it works</h1>
      <section className="two-col">
        <div className="section">
          <h2>For shoppers</h2>
          <ol className="list">
            <li>Search by vibe, category, color, size, price, or store.</li>
            <li>Browse visual product cards across approved sources.</li>
            <li>Click through to the official retailer page to buy.</li>
          </ol>
        </div>
        <div className="section">
          <h2>For retailers</h2>
          <ol className="list">
            <li>Products are added through approved feeds or direct permission.</li>
            <li>Users are sent to official product pages.</li>
            <li>Outbound clicks can be tracked through approved affiliate links.</li>
          </ol>
        </div>
      </section>
    </div>
  );
}

