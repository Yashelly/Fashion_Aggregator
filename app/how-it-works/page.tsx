import { InfoPage, ProseSection } from "@/components/info-page";
import { getCopy, getLocale, type SearchParamsInput } from "@/lib/i18n";

type HowItWorksPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export default async function Page({
  searchParams,
}: HowItWorksPageProps): Promise<React.ReactElement> {
  const locale = getLocale(await searchParams);
  const copy = getCopy(locale).pages.howItWorks;

  return (
    <InfoPage
      title={copy.title}
    >
      <div className="info-columns">
        <ProseSection title={copy.shoppersTitle}>
          <ol>
            {copy.shoppers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </ProseSection>
        <ProseSection title={copy.retailersTitle}>
          <ol>
            {copy.retailers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </ProseSection>
      </div>
      <ProseSection title={copy.reviewModeTitle}>
        <ul>
          {copy.reviewMode.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </ProseSection>
    </InfoPage>
  );
}
