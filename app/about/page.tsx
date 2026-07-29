import { InfoPage, ProseSection } from "@/components/info-page";
import { getCopy, getLocale, type SearchParamsInput } from "@/lib/i18n";

type AboutPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export default async function Page({
  searchParams,
}: AboutPageProps): Promise<React.ReactElement> {
  const locale = getLocale(await searchParams);
  const copy = getCopy(locale).pages.about;

  return (
    <InfoPage
      title={copy.title}
      intro={copy.paragraphs[0]}
    >
      <ProseSection>
        {copy.paragraphs.slice(1).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </ProseSection>
    </InfoPage>
  );
}
