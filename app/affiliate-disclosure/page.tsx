"use client";

import { InfoPage, ProseSection } from "@/components/info-page";
import { getCopy } from "@/lib/i18n";
import { useClientLocale } from "@/lib/use-client-locale";

export default function Page(): React.ReactElement {
  const locale = useClientLocale();
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
