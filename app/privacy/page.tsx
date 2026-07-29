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
      eyebrow={locale === "lt" ? "Duomenys ir privatumas" : "Data and privacy"}
      title={copy.title}
    >
      <ProseSection number="02">
        <p>{copy.paragraphs[0]}</p>
        <p>{copy.paragraphs[1]}</p>
        <p>
          {locale === "lt"
            ? "Privatumo, pataisymų ar pašalinimo užklausų kontaktas bus paskelbtas kontaktų puslapyje, kai bus patvirtintas domeno ir pašto dėžutės valdymas."
            : "A privacy, correction, and removal-request contact will be published on the contact page after domain and mailbox control are verified."}
        </p>
      </ProseSection>
    </InfoPage>
  );
}
