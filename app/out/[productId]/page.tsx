import { Ban, Database, Search } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClickoutAnalyticsTracker } from "@/components/clickout-analytics-tracker";
import {
  getLocale,
  normalizeParams,
  type SearchParamsInput,
  withLocale,
} from "@/lib/i18n";
import { getMockProducts } from "@/lib/mock-products";

type OutPageProps = {
  params: Promise<{
    productId: string;
  }>;
  searchParams: Promise<SearchParamsInput>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getMockProducts().map((product) => ({
    productId: product.mock_product_id,
  }));
}

export default async function OutPage({
  params,
  searchParams,
}: OutPageProps) {
  const { productId } = await params;
  const product = getMockProducts().find(
    (item) => item.mock_product_id === productId,
  );

  if (!product) notFound();

  const query = normalizeParams(await searchParams);
  const locale = getLocale(query);

  return (
    <div className="route-shell state-page preview-guard">
      <ClickoutAnalyticsTracker productId={product.mock_product_id} />
      <Ban aria-hidden="true" size={36} />
      <p className="preview-kicker">
        {locale === "lt"
          ? "SINTETINĖ PERŽIŪRA / NEPARDUODAMA"
          : "SYNTHETIC PREVIEW / NOT FOR SALE"}
      </p>
      <h1>
        {locale === "lt"
          ? "Tai demonstracinė prekė."
          : "This item is a demo."}
      </h1>
      <p>
        <strong>{product.title}</strong>{" "}
        {locale === "lt"
          ? "yra sintetinė VIBEWEAR peržiūros prekė. Ji nesusieta su tikra parduotuve ir jos negalima įsigyti."
          : "is a synthetic VIBEWEAR preview item. It is not associated with a real retailer and cannot be purchased."}
      </p>
      <div className="state-actions">
        <Link className="button" href={withLocale("/search", locale)}>
          <Search aria-hidden="true" size={18} />
          {locale === "lt" ? "Grįžti į rezultatus" : "Back to results"}
        </Link>
        <Link className="text-link" href={withLocale("/", locale)}>
          {locale === "lt"
            ? "Peržiūrėti kitas demo prekes"
            : "Explore other demo items"}
        </Link>
        <Link className="text-link" href={withLocale("/data-sources", locale)}>
          <Database aria-hidden="true" size={18} />
          {locale === "lt"
            ? "Kaip veikia duomenų šaltiniai"
            : "How data sources work"}
        </Link>
      </div>
    </div>
  );
}
