import { InfoPage, ProseSection } from "@/components/info-page";
import { getCopy, getLocale, type SearchParamsInput } from "@/lib/i18n";

type ContactPageProps = {
  searchParams: Promise<SearchParamsInput>;
};

export default async function Page({
  searchParams,
}: ContactPageProps): Promise<React.ReactElement> {
  const locale = getLocale(await searchParams);
  const copy = getCopy(locale).pages.contact;

  return (
    <InfoPage
      eyebrow={locale === "lt" ? "Susisiekite" : "Get in touch"}
      title={copy.title}
      intro={copy.intro}
    >
      <ProseSection number="02">
        <p>
          {locale === "lt"
            ? "Kontaktiniai kanalai šiame peržiūros etape dar neskelbiami. Partnerystės, pataisymų ir teisinių užklausų adresai bus pateikti tik patvirtinus domeno ir pašto dėžučių valdymą."
            : "Contact channels are not published during this preview stage. Partnership, correction, and legal-request addresses will appear only after domain and mailbox control are verified."}
        </p>
      </ProseSection>
    </InfoPage>
  );
}
