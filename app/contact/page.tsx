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
      title={copy.title}
      intro={copy.intro}
    >
      <ProseSection>
        <p>
          {locale === "lt"
            ? "Kontaktiniai duomenys bus paskelbti prieš įjungiant realių parduotuvių katalogus. Iki tol ši versija nerenka žinučių per kontaktų formą."
            : "Contact details will be published before live retailer catalogs are enabled. Until then, this version does not collect messages through a contact form."}
        </p>
      </ProseSection>
    </InfoPage>
  );
}
