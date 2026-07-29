import { InfoPage, ProseSection } from "@/components/info-page";
import { getCopy, getLocale, type SearchParamsInput } from "@/lib/i18n";

type DataSourcesPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export default async function Page({
  searchParams,
}: DataSourcesPageProps): Promise<React.ReactElement> {
  const locale = getLocale(await searchParams);
  const copy = getCopy(locale).pages.dataSources;

  return (
    <InfoPage
      eyebrow={locale === "lt" ? "Šaltinių politika" : "Source policy"}
      title={copy.title}
      intro={copy.paragraphs[0]}
    >
      <ProseSection number="02">
        {copy.paragraphs.slice(1).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </ProseSection>
      <ProseSection number="03" title={copy.reviewTitle}>
        <ul>
          {copy.reviewItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </ProseSection>
    </InfoPage>
  );
}
