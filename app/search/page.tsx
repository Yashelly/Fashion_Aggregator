import Link from "next/link";
import { X, SearchX } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";
import { SearchForm } from "@/components/search-form";
import { SearchInput } from "@/components/search-input";
import { SearchControls } from "@/components/search-controls";
import { CategoryNav } from "@/components/category-nav";
import { SearchAnalyticsTracker } from "@/components/search-analytics-tracker";
import { getCatalogProducts } from "@/lib/catalog";
import { formatAvailabilityLabel, formatCategoryLabel, formatColorLabel, formatGenderLabel, getCopy, getLocale, withLocale } from "@/lib/i18n";
import { getCategoryOptions, getStoreOptions, sortProducts } from "@/lib/mock-products";
import { searchProductsWithRuntime } from "@/lib/search-runtime";
import { clearFilterValues, MAX_QUERY_LENGTH, normalizeSearchValues, scopeSearchProducts, searchHref, validPriceRange } from "@/lib/search-params";

const unique = (values: string[]) => [...new Set(values)].filter(Boolean).sort();

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = normalizeSearchValues(await searchParams);
  const locale = getLocale(params), copy = getCopy(locale), t = copy.frontend;
  const products = await getCatalogProducts();
  const categories = getCategoryOptions(products);
  const colors = unique(products.map((p) => p.color));
  const genders = unique(products.map((p) => p.gender));
  const stores = getStoreOptions(products, locale);
  const selectedStores = params.store?.split(",").filter(Boolean) ?? [];
  const invalidFilter = Boolean(
    selectedStores.some((id) => !stores.some((store) => store.value === id)) ||
    (params.category && !categories.includes(params.category)) || (params.color && !colors.includes(params.color)) ||
    (params.gender && !genders.includes(params.gender)) || (params.status && !["in_stock", "limited", "out_of_stock", "sale"].includes(params.status)));
  const invalidPrice = !validPriceRange(params.minPrice, params.maxPrice);
  const invalidQuery = (params.query?.length ?? 0) > MAX_QUERY_LENGTH;
  const invalid = invalidFilter || invalidPrice || invalidQuery;
  // Scope first; the ranking engine can never return outside the shopper's explicit limits.
  const runtime = invalid ? null : await searchProductsWithRuntime(scopeSearchProducts(products, params), { ...params, store: undefined });
  const results = runtime ? sortProducts(runtime.results, params.sort, params.sort === "available" ? undefined : runtime.relevance) : [];
  const perPage = Number(params.perPage ?? 20), totalPages = Math.max(1, Math.ceil(results.length / perPage));
  const page = Math.min(Number(params.page ?? 1), totalPages), start = (page - 1) * perPage;
  const visible = results.slice(start, start + perPage);
  const committed = { ...params, page: page === 1 ? undefined : String(page) };
  const returnTo = searchHref(committed);
  const active: { key: string; label: string; value?: string }[] = [];
  if (params.category) active.push({key:"category",label:formatCategoryLabel(params.category,locale)});
  if (params.gender) active.push({key:"gender",label:formatGenderLabel(params.gender,locale)});
  if (params.color) active.push({key:"color",label:formatColorLabel(params.color,locale)});
  for (const id of selectedStores) active.push({key:"store",value:id,label:stores.find((store)=>store.value===id)?.label ?? t.storeFallback});
  if (params.status) active.push({key:"status",label:formatAvailabilityLabel(params.status,locale)});
  if (params.minPrice) active.push({key:"minPrice",label:`${t.minPrice}: ${params.minPrice}`});
  if (params.maxPrice) active.push({key:"maxPrice",label:`${t.maxPrice}: ${params.maxPrice}`});
  const pageLinks = [...new Set([1,totalPages,...[-1,0,1].map((offset)=>page+offset).filter((n)=>n>0&&n<=totalPages)])].sort((a,b)=>a-b);
  return <div className="route-shell search-route">
    {runtime && <SearchAnalyticsTracker diagnostics={runtime.diagnostics} resultCount={results.length} />}
    <div className="catalog-search-row">
      <SearchForm action="/search" className="catalog-form" role="search">
        {Object.entries(params).map(([key,value])=>value && key!=="query" && key!=="page" && <input key={key} name={key} value={value} type="hidden" />)}
        <SearchInput locale={locale} value={params.query} />
      </SearchForm>
    </div>
    <CategoryNav locale={locale} params={params} />
    <SearchControls key={`filters-${returnTo}`} locale={locale} params={params} count={results.length} title={params.query ? t.results : t.allClothing} stores={stores}
      categories={categories.map((value)=>({value,label:formatCategoryLabel(value,locale)}))}
      colors={colors.map((value)=>({value,label:formatColorLabel(value,locale)}))}
      genders={genders.map((value)=>({value,label:formatGenderLabel(value,locale)}))}>
      {active.length > 0 && <nav className="active-filters" aria-label={copy.search.active.aria}>
        {active.map(({key,label,value})=><Link key={`${key}-${value??""}`} aria-label={t.removeFilter(label)} href={searchHref(params,{[key]:key==="store"?selectedStores.filter((id)=>id!==value).join(","):undefined,page:undefined})}>{label}<X aria-hidden="true" size={14} /></Link>)}
        <Link className="clear-link" href={searchHref(clearFilterValues(params))}>{t.clearFilters}</Link>
      </nav>}
      {runtime?.interpretation && results.length > 0 && <p className="search-interpretation" aria-label={copy.search.interpretation.aria}>
        <span>{runtime.approximate ? copy.search.interpretation.approximate : copy.search.interpretation.ranked}</span>
        {runtime.interpretation.minPrice!==undefined && runtime.interpretation.maxPrice!==undefined ? <span>{copy.search.interpretation.priceRange(runtime.interpretation.minPrice,runtime.interpretation.maxPrice)}</span> : runtime.interpretation.maxPrice!==undefined ? <span>{copy.search.interpretation.priceCeiling(runtime.interpretation.maxPrice)}</span> : null}
        {runtime.approximate && runtime.relaxedConstraints.length>0 && <span>{copy.search.interpretation.relaxed(runtime.relaxedConstraints.join(", "))}</span>}
      </p>}
      {invalid ? <section className="empty-state is-error" role="alert"><SearchX aria-hidden="true" size={32}/><h2>{invalidQuery ? t.queryTooLong : invalidPrice ? t.priceError : t.invalidFilters}</h2><p>{invalidQuery ? t.searchLabel : t.noFilteredLead}</p><Link className="button secondary" href={invalidQuery ? searchHref(params,{query:undefined,page:undefined}) : searchHref(clearFilterValues(params))}>{invalidQuery?t.clearSearch:t.clearFilters}</Link></section>
        : results.length === 0 ? <section className="empty-state" role="status"><SearchX aria-hidden="true" size={32}/><h2>{active.length ? t.noFilteredResults : t.noResults}</h2><p>{active.length ? t.noFilteredLead : t.noResultsLead}</p><Link className="button secondary" href={active.length ? searchHref(clearFilterValues(params)) : withLocale("/search",locale)}>{active.length ? t.clearFilters : t.browseAll}</Link></section>
        : <ProductGrid locale={locale} products={visible} returnTo={returnTo} ariaLabel={t.showing(start+1,start+visible.length,results.length)} />}
      <div className="catalog-view-controls"><p>{results.length>0 ? t.showing(start+1,start+visible.length,results.length) : t.count(0)}</p>
        <nav aria-label={t.perPage}><span>{t.show}</span>{[20,50,100].map((size)=><Link key={size} aria-current={perPage===size?"page":undefined} href={searchHref(params,{perPage:String(size),page:undefined})}>{size}</Link>)}</nav>
      </div>
      {totalPages>1 && <nav className="pagination" aria-label={t.pages}>
        {page>1 ? <Link href={searchHref(params,{page:String(page-1)})}>{t.previous}</Link>:<span aria-disabled="true">{t.previous}</span>}
        <div>{pageLinks.map((number,index)=><span className="pagination-item" key={number}>{index>0&&number-pageLinks[index-1]>1&&<span aria-hidden="true">…</span>}<Link aria-current={page===number?"page":undefined} href={searchHref(params,{page:String(number)})}>{number}</Link></span>)}</div>
        {page<totalPages ? <Link href={searchHref(params,{page:String(page+1)})}>{t.next}</Link>:<span aria-disabled="true">{t.next}</span>}
      </nav>}
    </SearchControls>
  </div>;
}
