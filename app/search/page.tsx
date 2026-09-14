import Link from "next/link";
import { X, SearchX } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";
import { SearchForm } from "@/components/search-form";
import { SearchInput } from "@/components/search-input";
import { SearchControls } from "@/components/search-controls";
import { CategoryNav } from "@/components/category-nav";
import { SearchAnalyticsTracker } from "@/components/search-analytics-tracker";
import { getCatalogProducts } from "@/lib/catalog";
import { formatAvailabilityLabel, formatCategoryLabel, formatColorLabel, formatGenderLabel, formatTagLabel, getCopy, getLocale, withLocale } from "@/lib/i18n";
import { getCategoryOptions, getSizeOptions, getStoreOptions, sortProducts } from "@/lib/mock-products";
import { searchProductsWithRuntime } from "@/lib/search-runtime";
import { clearFilterValues, MAX_QUERY_LENGTH, normalizeSearchValues, scopeSearchProducts, searchHref, validPriceRange } from "@/lib/search-params";
import { removeInterpretedConstraint, type EditableConstraintKind } from "@/lib/semantic-search";

const unique = (values: string[]) => [...new Set(values)].filter(Boolean).sort();

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = normalizeSearchValues(await searchParams);
  const locale = getLocale(params), copy = getCopy(locale), t = copy.frontend;
  const products = await getCatalogProducts();
  const categories = getCategoryOptions(products);
  const colors = unique(products.map((p) => p.color));
  const departments = unique(products.map((p) => p.gender));
  const sizes = getSizeOptions(products);
  const stores = getStoreOptions(products, locale);
  const selectedStores = params.store?.split(",").filter(Boolean) ?? [];
  const selectedColors = params.color?.split(",").filter(Boolean) ?? [];
  const selectedSizes = params.size?.split(",").filter(Boolean) ?? [];
  const invalidFilter = Boolean(
    selectedStores.some((id) => !stores.some((store) => store.value === id)) ||
    selectedColors.some((color) => !colors.includes(color)) || selectedSizes.some((size) => !sizes.includes(size)) ||
    (params.category && !categories.includes(params.category)) ||
    (params.department && !departments.includes(params.department)) ||
    (params.status && !["in_stock", "limited", "out_of_stock", "unknown"].includes(params.status)));
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
  if (params.department) active.push({key:"department",label:formatGenderLabel(params.department,locale)});
  for (const color of selectedColors) active.push({key:"color",value:color,label:formatColorLabel(color,locale)});
  for (const size of selectedSizes) active.push({key:"size",value:size,label:`${t.size}: ${size}`});
  for (const id of selectedStores) active.push({key:"store",value:id,label:stores.find((store)=>store.value===id)?.label ?? t.storeFallback});
  if (params.status) active.push({key:"status",label:formatAvailabilityLabel(params.status,locale)});
  if (params.sale === "on") active.push({key:"sale",label:t.saleOnly});
  if (params.minPrice) active.push({key:"minPrice",label:`${t.minPrice}: ${params.minPrice}`});
  if (params.maxPrice) active.push({key:"maxPrice",label:`${t.maxPrice}: ${params.maxPrice}`});
  const interpretation = runtime?.interpretation;
  const query = params.query ?? "";
  const queryChip = (kind: EditableConstraintKind, term: string, label: string) => ({
    key: `${kind}-${term}`,
    label,
    href: searchHref(params, { query: removeInterpretedConstraint(query, kind, term) || undefined, page: undefined }),
  });
  const understood = interpretation ? [
    ...interpretation.constraints.garmentTypes.map((term) => queryChip("term", term, copy.search.interpretation.garment(formatCategoryLabel(term, locale)))),
    ...interpretation.constraints.colors.map((term) => queryChip("term", term, copy.search.interpretation.colour(formatColorLabel(term, locale)))),
    ...interpretation.constraints.materials.map((term) => queryChip("term", term, copy.search.interpretation.material(formatTagLabel(term, locale)))),
    ...interpretation.constraints.directAttributes.map((term) => queryChip("term", term, copy.search.interpretation.attribute(formatTagLabel(term, locale)))),
    ...interpretation.constraints.excludedTerms.map((term) => queryChip("exclusion", term, copy.search.interpretation.exclusion(formatTagLabel(term, locale)))),
    ...(interpretation.minPrice !== undefined || interpretation.maxPrice !== undefined ? [queryChip("price", "price", interpretation.minPrice !== undefined && interpretation.maxPrice !== undefined
      ? copy.search.interpretation.priceRange(interpretation.minPrice, interpretation.maxPrice)
      : copy.search.interpretation.priceCeiling(interpretation.maxPrice!))] : []),
    ...(interpretation.requiresInStock ? [queryChip("availability", "available", copy.search.interpretation.availability(formatAvailabilityLabel("in_stock", locale)))] : []),
  ] : [];
  const weakIntent = Boolean(query && interpretation && understood.length === 0 && interpretation.unknownTerms.length > 0);
  const pageLinks = [...new Set([1,totalPages,...[-1,0,1].map((offset)=>page+offset).filter((n)=>n>0&&n<=totalPages)])].sort((a,b)=>a-b);
  return <div className="route-shell search-route">
    {runtime && <SearchAnalyticsTracker committedUrl={returnTo} diagnostics={runtime.diagnostics} label={query.trim() || t.allClothing} resultCount={results.length} />}
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
      departments={departments.map((value)=>({value,label:formatGenderLabel(value,locale)}))}
      sizes={sizes.map((value)=>({value,label:value}))}>
      {active.length > 0 && <nav className="active-filters" aria-label={copy.search.active.aria}>
        {active.map(({key,label,value})=>{
          const selected = key === "store" ? selectedStores : key === "color" ? selectedColors : key === "size" ? selectedSizes : [];
          return <Link key={`${key}-${value??""}`} aria-label={t.removeFilter(label)} href={searchHref(params,{[key]:value ? selected.filter((item)=>item!==value).join(",") : undefined,page:undefined})}>{label}<X aria-hidden="true" size={14} /></Link>;
        })}
        <Link className="clear-link" href={searchHref(clearFilterValues(params))}>{t.clearFilters}</Link>
      </nav>}
      {interpretation && understood.length > 0 && <nav className="active-filters" aria-label={copy.search.interpretation.aria}>
        <span>{copy.search.interpretation.understood}</span>
        {understood.map((chip)=><Link key={chip.key} aria-label={copy.search.interpretation.remove(chip.label)} href={chip.href}>{chip.label}<X aria-hidden="true" size={14}/></Link>)}
      </nav>}
      {runtime?.approximate && results.length > 0 && <p className="search-interpretation"><span>{copy.search.interpretation.alternatives}</span>
        {runtime.relaxedConstraints.length>0 && <span>{copy.search.interpretation.relaxed(runtime.relaxedConstraints.join(", "))}</span>}</p>}
      {!runtime?.approximate && results.length > 0 && query && <p className="search-interpretation"><span>{copy.search.interpretation.exact}</span></p>}
      {invalid ? <section className="empty-state is-error" role="alert"><SearchX aria-hidden="true" size={32}/><h2>{invalidQuery ? t.queryTooLong : invalidPrice ? t.priceError : t.invalidFilters}</h2><p>{invalidQuery ? t.searchLabel : t.noFilteredLead}</p>{query && <p>{t.originalQuery(query)}</p>}<Link className="button secondary" href={invalidQuery ? searchHref(params,{query:undefined,page:undefined}) : searchHref(clearFilterValues(params))}>{invalidQuery?t.clearSearch:t.clearFilters}</Link></section>
        : results.length === 0 ? <section className="empty-state" role="status"><SearchX aria-hidden="true" size={32}/>
          <h2>{weakIntent ? t.weakIntentTitle : t.understoodNoMatchTitle}</h2>
          <p>{weakIntent ? t.weakIntentLead : t.understoodNoMatchLead}</p>
          {query && <p>{t.originalQuery(query)}</p>}
          {query && <Link className="button" href={`${returnTo}#catalog-query`}>{t.refineSearch}</Link>}
          <Link className="button secondary" href={withLocale("/search",locale)}>{t.browseAll}</Link>
          {active.length > 0 && <Link className="button secondary" href={searchHref(clearFilterValues(params))}>{t.clearFilters}</Link>}</section>
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
