import { getCopy, getLocale, type SearchParamsInput } from "@/lib/i18n";

type PrivacyPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export default async function PrivacyPage({ searchParams }: PrivacyPageProps) {
  const locale = getLocale(await searchParams);
  const t = getCopy(locale).pages.privacy;

  return (
    <div className="stack">
      <h1 className="page-title">{t.title}</h1>
      <section className="section">
        <p>{t.paragraphs[0]}</p>
        <p>{t.paragraphs[1]}</p>
        <p>
          {t.paragraphs[2]} <a href="mailto:legal@vibewear.lt">legal@vibewear.lt</a>.
        </p>
      </section>
    </div>
  );
}
