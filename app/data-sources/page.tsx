"use client";

import { InfoPage, ProseSection } from "@/components/info-page";
import { getCopy } from "@/lib/i18n";
import { useClientLocale } from "@/lib/use-client-locale";

export default function Page(): React.ReactElement {
  const locale = useClientLocale();
  const copy = getCopy(locale).pages.dataSources;

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
      <ProseSection title={copy.reviewTitle}>
        <ul>
          {copy.reviewItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </ProseSection>
    </InfoPage>
  );
}
