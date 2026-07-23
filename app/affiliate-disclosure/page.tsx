import { getCopy, getLocale, type SearchParamsInput } from "@/lib/i18n";

type AffiliateDisclosurePageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export default async function AffiliateDisclosurePage({
  searchParams,
}: AffiliateDisclosurePageProps) {
  const locale = getLocale(await searchParams);
  const t = getCopy(locale).pages.affiliate;

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
