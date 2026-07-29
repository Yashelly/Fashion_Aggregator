import { InfoPage, ProseSection } from "@/components/info-page";
import { getCopy, getLocale, type SearchParamsInput } from "@/lib/i18n";

type PrivacyPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export default async function Page({
  searchParams,
}: PrivacyPageProps): Promise<React.ReactElement> {
  const locale = getLocale(await searchParams);
  const copy = getCopy(locale).pages.privacy;

  return (
    <InfoPage
      title={copy.title}
    >
      <ProseSection>
        <p>{copy.paragraphs[0]}</p>
        <p>{copy.paragraphs[1]}</p>
        <p>
          {locale === "lt"
            ? "Privatumo, pataisymų ar pašalinimo užklausų kontaktas bus paskelbtas kontaktų puslapyje prieš įjungiant realių parduotuvių katalogus."
            : "A privacy, correction, and removal contact will be published on the contact page before live retailer catalogs are enabled."}
        </p>
      </ProseSection>
    </InfoPage>
  );
}
