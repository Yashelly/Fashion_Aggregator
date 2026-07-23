import { getCopy, getLocale, type SearchParamsInput } from "@/lib/i18n";

type DataSourcesPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export default async function DataSourcesPage({ searchParams }: DataSourcesPageProps) {
  const locale = getLocale(await searchParams);
  const t = getCopy(locale).pages.dataSources;

  return (
    <div className="stack">
      <h1 className="page-title">{t.title}</h1>
      <section className="section">
        {t.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>
    </div>
  );
}
