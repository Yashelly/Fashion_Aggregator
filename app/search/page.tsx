import { RotateCcw, Search } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";
import { FilterDisclosure } from "@/components/filter-disclosure";
import { SearchAnalyticsTracker } from "@/components/search-analytics-tracker";
import {
  formatAvailabilityLabel, formatCategoryLabel, formatColorLabel, formatGenderLabel,
  formatStoreName, getCopy, getLocale, normalizeParams, type SearchParamsInput, withLocale,
} from "@/lib/i18n";
import { filterProducts, getMockProducts, getStoreOptions, sortProducts } from "@/lib/mock-products";

type SearchPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const unique = (values: string[]) => Array.from(new Set(values)).filter(Boolean).sort();

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = normalizeParams((await searchParams) as SearchParamsInput);
  const locale = getLocale(params);
  const t = getCopy(locale).search;
  const products = getMockProducts();
  const results = sortProducts(filterProducts(products, params), params.sort);
  const stores = getStoreOptions(products);
  const categories = unique(products.map((p) => p.category));
  const colors = unique(products.map((p) => p.color));
  const genders = unique(products.map((p) => p.gender));
  const status = params.status ?? (params.sale === "on" ? "sale" : params.availability ?? "");
  const invalidFilter = Boolean(
    (params.store && !stores.some((store) => store.value === params.store)) ||
    (params.category && !categories.includes(params.category)) ||
    (params.color && !colors.includes(params.color)) ||
    (params.gender && !genders.includes(params.gender)) ||
    (status && !["in_stock", "limited", "sale"].includes(status)),
  );
  const active = [
    params.query && ["query", `${t.active.search}: ${params.query}`],
    params.gender && ["gender", `${t.active.department}: ${formatGenderLabel(params.gender, locale)}`],
    params.store && ["store", `${t.active.store}: ${formatStoreName(params.store)}`],
    params.category && ["category", `${t.active.category}: ${formatCategoryLabel(params.category, locale)}`],
    params.color && ["color", `${t.active.color}: ${formatColorLabel(params.color, locale)}`],
    status && ["status", status === "sale" ? formatAvailabilityLabel(status, locale) : `${t.active.availability}: ${formatAvailabilityLabel(status, locale)}`],
  ].filter(Boolean) as string[][];

  const removeUrl = (key: string) => {
    const next = new URLSearchParams();
    const remove = key === "status" ? new Set(["status", "sale", "availability"]) : new Set([key]);
    Object.entries(params).forEach(([name, value]) => { if (value && !remove.has(name)) next.set(name, value); });
    return `/search${next.size ? `?${next}` : ""}`;
  };

  return (
    <div className="route-shell search-route">
      <SearchAnalyticsTracker resultCount={results.length} />
      <header className="route-heading">
        <div className="section-rail"><span>01</span><p>{locale === "lt" ? "Mados paieška" : "Fashion search"}</p></div>
        <div><p className="preview-kicker">PREVIEW CATALOG · SYNTHETIC PRODUCTS</p><h1>{t.title}</h1><p className="lead">{t.lead}</p></div>
      </header>

      <form action="/search" className="catalog-form" role="search">
        {locale === "lt" && <input name="lang" type="hidden" value="lt" />}
        <label className="query-field" htmlFor="catalog-query"><span>{t.labels.search}</span><div><Search aria-hidden="true" size={22}/><input id="catalog-query" defaultValue={params.query ?? ""} name="query" placeholder={t.placeholders.search}/><button type="submit">{t.actions.showResults}</button></div></label>
        <div className="primary-filters">
          <label><span>{t.labels.store}</span><select defaultValue={params.store ?? ""} name="store"><option value="">{t.options.allStores}</option>{stores.map((x)=><option key={x.value} value={x.value}>{x.label}</option>)}</select></label>
          <label><span>{t.labels.category}</span><select defaultValue={params.category ?? ""} name="category"><option value="">{t.options.allCategories}</option>{categories.map((x)=><option key={x} value={x}>{formatCategoryLabel(x,locale)}</option>)}</select></label>
          <label><span>{t.labels.sort}</span><select defaultValue={params.sort ?? ""} name="sort"><option value="">{t.options.availableFirst}</option><option value="price-low">{t.options.priceLow}</option><option value="price-high">{t.options.priceHigh}</option><option value="sale">{t.options.bestSale}</option></select></label>
        </div>
        <FilterDisclosure
          label={t.labels.advanced}
          defaultOpen={Boolean(params.gender || params.color || status)}
        >
          <div className="primary-filters">
            <label><span>{t.labels.department}</span><select defaultValue={params.gender ?? ""} name="gender"><option value="">{t.options.allDepartments}</option>{genders.map((x)=><option key={x} value={x}>{formatGenderLabel(x,locale)}</option>)}</select></label>
            <label><span>{t.labels.color}</span><select defaultValue={params.color ?? ""} name="color"><option value="">{t.options.allColors}</option>{colors.map((x)=><option key={x} value={x}>{formatColorLabel(x,locale)}</option>)}</select></label>
            <label><span>{t.labels.status}</span><select defaultValue={status} name="status"><option value="">{t.options.allItems}</option><option value="in_stock">{formatAvailabilityLabel("in_stock",locale)}</option><option value="limited">{formatAvailabilityLabel("limited",locale)}</option><option value="sale">{formatAvailabilityLabel("sale",locale)}</option></select></label>
          </div>
        </FilterDisclosure>
      </form>

      <div className="results-toolbar">
        <p role="status" aria-live="polite" aria-atomic="true"><strong>{String(results.length).padStart(2,"0")}</strong> {t.resultsFound(results.length)}</p>
        <div className="active-filters" aria-label={t.active.aria}>{active.map(([key,label])=><a href={removeUrl(key)} key={key}>{label}<span aria-hidden="true">×</span></a>)}{active.length>0&&<a className="clear-link" href={withLocale("/search",locale)}><RotateCcw aria-hidden="true" size={15}/>{t.actions.clearAll}</a>}</div>
      </div>
      {invalidFilter ? (
        <p className="result-state-note is-error" role="alert">
          {locale === "lt"
            ? "Vienas ar keli filtrai neatpažinti. Išvalykite filtrus ir pasirinkite galiojančias parinktis."
            : "One or more filters are not recognised. Clear the filters and choose from the available options."}
        </p>
      ) : results.length === 0 && active.length > 0 ? (
        <p className="result-state-note" role="status">
          {locale === "lt"
            ? "Filtrai galioja, tačiau šiam deriniui demonstracinių rezultatų nėra."
            : "These filters are valid, but this combination has no demo results."}
        </p>
      ) : null}
      <ProductGrid locale={locale} products={results}/>
      <aside className="source-note" aria-label={t.sourceNoteAria}><span className="index-stamp">NOTE</span><div><strong>{t.sourceNoteTitle}</strong><p>{t.sourceNote}</p></div><a href={withLocale("/data-sources",locale)}>{t.sourceNoteCta}</a></aside>
    </div>
  );
}
