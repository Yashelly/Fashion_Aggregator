import { getCopy, getLocale, type SearchParamsInput } from "@/lib/i18n";

type HowItWorksPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export default async function HowItWorksPage({ searchParams }: HowItWorksPageProps) {
  const locale = getLocale(await searchParams);
  const t = getCopy(locale).pages.howItWorks;

  return (
    <div className="stack">
      <h1 className="page-title">{t.title}</h1>
      <section className="two-col">
        <div className="section">
          <h2>{t.shoppersTitle}</h2>
          <ol className="list">
            {t.shoppers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
        <div className="section">
          <h2>{t.retailersTitle}</h2>
          <ol className="list">
            {t.retailers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
