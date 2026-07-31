"use client";

import { InfoPage, ProseSection } from "@/components/info-page";
import { getCopy } from "@/lib/i18n";
import { useClientLocale } from "@/lib/use-client-locale";

export default function Page(): React.ReactElement {
  const locale = useClientLocale();
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
