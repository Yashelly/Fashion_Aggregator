import { InfoPage, ProseSection } from "@/components/info-page";
import { getCopy, getLocale, type SearchParamsInput } from "@/lib/i18n";

type AffiliateDisclosurePageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export default async function Page({
  searchParams,
}: AffiliateDisclosurePageProps): Promise<React.ReactElement> {
  const locale = getLocale(await searchParams);
  const copy = getCopy(locale).pages.affiliate;

  return (
    <InfoPage
      title={copy.title}
    >
      <ProseSection>
        {copy.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </ProseSection>
    </InfoPage>
  );
}
