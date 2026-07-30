"use client";

import { InfoPage, ProseSection } from "@/components/info-page";
import { getCopy } from "@/lib/i18n";
import { useClientLocale } from "@/lib/use-client-locale";

export default function Page(): React.ReactElement {
  const locale = useClientLocale();
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
