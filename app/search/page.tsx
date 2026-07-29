import { RotateCcw, Search } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";
import { FilterDisclosure } from "@/components/filter-disclosure";
import { MascotSearchForm } from "@/components/loading-mascot";
import { SearchAnalyticsTracker } from "@/components/search-analytics-tracker";
import {
  formatAvailabilityLabel, formatCategoryLabel, formatColorLabel, formatGenderLabel,
  getCopy, getLocale, normalizeParams, type SearchParamsInput, withLocale,
} from "@/lib/i18n";
import { filterProducts, getMockProducts, getStoreOptions, sortProducts } from "@/lib/mock-products";

type SearchPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const unique = (values: string[]) => Array.from(new Set(values)).filter(Boolean).sort();
const pageSizes = [20, 50, 100] as const;

function searchHref(
  params: Record<string, string | undefined>,
  updates: Record<string, string | undefined>,
) {
  const next = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) next.set(key, value);
  });
  Object.entries(updates).forEach(([key, value]) => {
    if (value) next.set(key, value);
    else next.delete(key);
  });
  return `/search${next.size ? `?${next}` : ""}`;
}

function paginationItems(page: number, totalPages: number) {
  const pages = new Set([1, totalPages]);
  for (let offset = -2; offset <= 2; offset += 1) {
    const candidate = page + offset;
    if (candidate >= 1 && candidate <= totalPages) pages.add(candidate);
  }
  return [...pages].sort((a, b) => a - b);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = normalizeParams((await searchParams) as SearchParamsInput);
  const locale = getLocale(params);
  const t = getCopy(locale).search;
  const products = getMockProducts();
  const results = sortProducts(filterProducts(products, params), params.sort);
  const parsedPageSize = Number(params.perPage);
  const perPage = pageSizes.includes(parsedPageSize as (typeof pageSizes)[number])
    ? parsedPageSize
    : 20;
  const totalPages = Math.max(1, Math.ceil(results.length / perPage));
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Math.min(
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    totalPages,
  );
  const pageStart = (page - 1) * perPage;
  const visibleResults = results.slice(pageStart, pageStart + perPage);
  const visibleEnd = pageStart + visibleResults.length;
  const pageLinks = paginationItems(page, totalPages);
  const stores = getStoreOptions(products, locale);
  const selectedStore = stores.find((store) => store.value === params.store);
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
    selectedStore && ["store", `${t.active.store}: ${selectedStore.label}`],
    params.category && ["category", `${t.active.category}: ${formatCategoryLabel(params.category, locale)}`],
    params.color && ["color", `${t.active.color}: ${formatColorLabel(params.color, locale)}`],
    status && ["status", status === "sale" ? formatAvailabilityLabel(status, locale) : `${t.active.availability}: ${formatAvailabilityLabel(status, locale)}`],
  ].filter(Boolean) as string[][];

  const removeUrl = (key: string) => {
    const next = new URLSearchParams();
    const remove = key === "status" ? new Set(["status", "sale", "availability"]) : new Set([key]);
    remove.add("page");
    Object.entries(params).forEach(([name, value]) => { if (value && !remove.has(name)) next.set(name, value); });
    return `/search${next.size ? `?${next}` : ""}`;
  };

  return (
    <div className="route-shell search-route">
      <SearchAnalyticsTracker resultCount={results.length} />
      <header className="route-heading">
        <div><h1>{t.title}</h1><p className="lead">{t.lead}</p></div>
      </header>

      <MascotSearchForm action="/search" className="catalog-form" role="search">
        {locale === "lt" && <input name="lang" type="hidden" value="lt" />}
        <input name="perPage" type="hidden" value={perPage} />
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
      </MascotSearchForm>

      <div className="results-toolbar">
        <p role="status" aria-live="polite" aria-atomic="true"><strong>{results.length}</strong> {locale === "lt" ? "prekių" : results.length === 1 ? "product" : "products"}</p>
        <div className="active-filters" aria-label={t.active.aria}>{active.map(([key,label])=><a href={removeUrl(key)} key={key}>{label}<span aria-hidden="true">×</span></a>)}{active.length>0&&<a className="clear-link" href={withLocale("/search",locale)}><RotateCcw aria-hidden="true" size={15}/>{t.actions.clearAll}</a>}</div>
      </div>
      <div className="catalog-view-controls">
        <p>
          {results.length > 0
            ? locale === "lt"
              ? `Rodoma ${pageStart + 1}–${visibleEnd} iš ${results.length}`
              : `Showing ${pageStart + 1}–${visibleEnd} of ${results.length}`
            : locale === "lt"
              ? "Rezultatų nėra"
              : "No results"}
        </p>
        <nav aria-label={locale === "lt" ? "Prekių skaičius puslapyje" : "Products per page"}>
          <span>{locale === "lt" ? "Rodyti" : "Show"}</span>
          {pageSizes.map((size) => (
            <a
              aria-current={perPage === size ? "page" : undefined}
              href={searchHref(params, { page: undefined, perPage: String(size) })}
              key={size}
            >
              {size}
            </a>
          ))}
        </nav>
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
            ? "Filtrai galioja, tačiau šiam deriniui rezultatų nėra."
            : "These filters are valid, but this combination has no results."}
        </p>
      ) : null}
      <ProductGrid
        ariaLabel={
          locale === "lt"
            ? `Produktų rezultatai ${pageStart + 1}–${visibleEnd} iš ${results.length}`
            : `Product results ${pageStart + 1}–${visibleEnd} of ${results.length}`
        }
        locale={locale}
        products={visibleResults}
      />
      {totalPages > 1 ? (
        <nav className="pagination" aria-label={locale === "lt" ? "Rezultatų puslapiai" : "Result pages"}>
          {page === 1 ? (
            <span aria-disabled="true" className="pagination-control is-disabled">
              {locale === "lt" ? "Ankstesnis" : "Previous"}
            </span>
          ) : (
            <a href={searchHref(params, { page: page - 1 === 1 ? undefined : String(page - 1), perPage: String(perPage) })}>
              {locale === "lt" ? "Ankstesnis" : "Previous"}
            </a>
          )}
          <div>
            {pageLinks.map((pageNumber, index) => (
              <span className="pagination-item" key={pageNumber}>
                {index > 0 && pageNumber - pageLinks[index - 1] > 1 ? <span aria-hidden="true">…</span> : null}
                <a
                  aria-current={page === pageNumber ? "page" : undefined}
                  href={searchHref(params, {
                    page: pageNumber === 1 ? undefined : String(pageNumber),
                    perPage: String(perPage),
                  })}
                >
                  {pageNumber}
                </a>
              </span>
            ))}
          </div>
          {page === totalPages ? (
            <span aria-disabled="true" className="pagination-control is-disabled">
              {locale === "lt" ? "Kitas" : "Next"}
            </span>
          ) : (
            <a href={searchHref(params, { page: String(page + 1), perPage: String(perPage) })}>
              {locale === "lt" ? "Kitas" : "Next"}
            </a>
          )}
        </nav>
      ) : null}
      <aside className="source-note" aria-label={t.sourceNoteAria}><div><strong>{t.sourceNoteTitle}</strong><p>{t.sourceNote}</p></div><a href={withLocale("/data-sources",locale)}>{t.sourceNoteCta}</a></aside>
    </div>
  );
}
