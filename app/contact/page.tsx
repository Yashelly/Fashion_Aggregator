import { getCopy, getLocale, type SearchParamsInput } from "@/lib/i18n";

type ContactPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const locale = getLocale(await searchParams);
  const t = getCopy(locale).pages.contact;

  return (
    <div className="stack">
      <h1 className="page-title">{t.title}</h1>
      <section className="section">
        <p>{t.intro}</p>
        <p>
          {t.partnerships}: <a href="mailto:partners@vibewear.lt">partners@vibewear.lt</a>
          <br />
          {t.legal}: <a href="mailto:legal@vibewear.lt">legal@vibewear.lt</a>
        </p>
      </section>
    </div>
  );
}
