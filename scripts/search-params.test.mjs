import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
function load(file) {
  const code = require('typescript').transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:1,target:9}}).outputText;
  const localRequire = (name) => name.startsWith('@/') ? load(`${name.slice(2)}.ts`) : require(name);
  const m = {exports:{}}; new Function('module','exports','require',code)(m,m.exports,localRequire); return m.exports;
}
const {canonicalizeSearchHref,normalizeSearchValues,validPriceRange,scopeSearchProducts,clearFilterValues,searchHref} = load('lib/search-params.ts');
const {createSearchCacheKey} = load('lib/search-cache-key.ts');
const {filterProducts,getCategoryOptions,getSizeOptions,searchProducts} = load('lib/mock-products.ts');
const catalog = [
  {mock_product_id:'A',public_store_id:'demo-store-01',price_eur:'40'},
  {mock_product_id:'B',public_store_id:'demo-store-02',price_eur:'80'},
  {mock_product_id:'C',public_store_id:'demo-store-03',price_eur:'160'},
];
test('canonical params trim, canonicalize multi-values and consume legacy aliases',()=>{
  assert.deepEqual(normalizeSearchValues({query:[' black ','coat'],store:'demo-store-02,demo-store-01,demo-store-02',color:['navy,black','navy'],size:'M, S,M',gender:'women',minPrice:' 10,50 ',sale:'on',junk:'secret',page:'-1'}),{
    query:'black',department:'women',color:'black,navy',size:'M,S',store:'demo-store-01,demo-store-02',sale:'on',minPrice:'10.5'
  });
  assert.deepEqual(normalizeSearchValues({status:'sale'}),{sale:'on'});
  assert.deepEqual(normalizeSearchValues({availability:'limited'}),{status:'limited'});
  assert.deepEqual(normalizeSearchValues({status:'in_stock',sale:'on'}),{status:'in_stock',sale:'on'});
  assert.equal(searchHref({color:'navy,black',size:'S,M',store:'demo-store-02,demo-store-01'}),'/search?color=black%2Cnavy&size=M%2CS&store=demo-store-01%2Cdemo-store-02');
  assert.equal(searchHref({query:'coat',page:'1'}),'/search?query=coat');
  assert.equal(canonicalizeSearchHref('/search?color=navy&color=black&gender=women&page=1'),'/search?department=women&color=black%2Cnavy');
});
test('budget boundaries, malformed values and zero are explicit',()=>{
  for(const [a,b] of [['',''],['0','0'],['10,50','20.10'],['','150']]) assert.ok(validPriceRange(a,b));
  for(const [a,b] of [['30','20'],['-1','20'],['abc',''],['1e2','200'],['1.234','10']]) assert.equal(validPriceRange(a,b),false);
});
test('manual constraints use OR within multi-select facets and AND between facets',()=>{
  assert.deepEqual(scopeSearchProducts(catalog,{store:'demo-store-01,demo-store-02',minPrice:'40',maxPrice:'80'}).map(x=>x.mock_product_id),['A','B']);
  assert.deepEqual(scopeSearchProducts(catalog,{maxPrice:'0'}),[]);
  assert.deepEqual(scopeSearchProducts(catalog,{minPrice:'200',maxPrice:'100'}),[]);
});
test('clear filters keeps query, locale, sort and page size, resets page',()=>{
  const next = clearFilterValues({query:'wool coat',lang:'lt',sort:'price-low',perPage:'50',page:'3',minPrice:'20',store:'demo-store-01',color:'black',size:'M',sale:'on'});
  assert.equal(searchHref(next),'/search?query=wool+coat&sort=price-low&perPage=50&lang=lt');
});
test('runtime cache identity isolates input scope and changed prices',()=>{
  assert.equal(createSearchCacheKey(catalog,{query:' BLACK  coat '}),createSearchCacheKey(catalog,{query:'black coat'}));
  assert.notEqual(createSearchCacheKey(catalog,{query:'black'}),createSearchCacheKey(catalog.slice(0,1),{query:'black'}));
  assert.notEqual(createSearchCacheKey(catalog,{query:'black'}),createSearchCacheKey([{...catalog[0],price_eur:'39'},...catalog.slice(1)],{query:'black'}));
  assert.equal(createSearchCacheKey(catalog,{color:'navy,black',size:'S,M',store:'demo-store-02,demo-store-01'}),createSearchCacheKey(catalog,{color:'black,navy',size:'M,S',store:'demo-store-01,demo-store-02'}));
  assert.notEqual(createSearchCacheKey(catalog,{query:'black',minPrice:'40',maxPrice:'80'}),createSearchCacheKey(catalog,{query:'black',minPrice:'41',maxPrice:'80'}));
});

const garments = [
  {mock_product_id:'JEANS',category:'bottoms',subcategory:'jeans',title:'Blue jeans'},
  {mock_product_id:'JACKET',category:'outerwear',subcategory:'denim_jacket',title:'Blue denim jacket'},
  {mock_product_id:'SKIRT',category:'bottoms',subcategory:'skirt',title:'Blue denim skirt'},
  {mock_product_id:'TROUSERS',category:'bottoms',subcategory:'trousers',title:'Blue trousers'},
  {mock_product_id:'MISSING',category:'bottoms',subcategory:'',title:'Denim jeans'},
  {mock_product_id:'MISCLASSIFIED',category:'tops',subcategory:'jeans',title:'Jeans-print top'},
].map((product)=>({public_store_id:'demo-store-01',price_eur:'40',old_price_eur:'',availability:'in_stock',
  gender:'women',color:'blue',size_options:'S|M',brand:'',style_tags:'denim',...product}));

test('Jeans is an exact manual category, not a denim text or material match',()=>{
  assert.deepEqual(filterProducts(garments,{category:'jeans'}).map(p=>p.mock_product_id),['JEANS']);
  assert.deepEqual(filterProducts(garments,{category:'bottoms'}).map(p=>p.mock_product_id),['JEANS','SKIRT','TROUSERS','MISSING']);
  assert.equal(filterProducts(garments,{category:'jeans',color:'black'}).length,0);
  assert.equal(filterProducts(garments,{category:'jeans',gender:'men'}).length,0);
  assert.equal(filterProducts(garments,{category:'jeans',maxPrice:30}).length,0);
});

test('available category options include Jeans only when exact garment identity exists',()=>{
  assert.ok(getCategoryOptions(garments).includes('jeans'));
  assert.equal(getCategoryOptions(garments.slice(1)).includes('jeans'),false);
  assert.deepEqual(getCategoryOptions([]),[]);
});

test('Jeans browsing does not become search and typed-query alternatives cannot leave the facet',()=>{
  const browsed = searchProducts(garments,{category:'jeans'});
  assert.deepEqual(browsed.results.map(p=>p.mock_product_id),['JEANS']);
  assert.equal(browsed.interpretation,null);
  assert.equal(browsed.relevance.size,0);
  for (const query of ['blue','denim','blue denim jacket']) {
    const searched = searchProducts(garments,{category:'jeans',query});
    assert.ok(searched.results.every(p=>p.mock_product_id==='JEANS'));
  }
  assert.deepEqual(searchProducts(garments,{category:'jeans',query:'blue'}).results.map(p=>p.mock_product_id),['JEANS']);
});

test('category URLs preserve literal shopper queries and isolate Jeans from other categories',()=>{
  const values = normalizeSearchValues({query:'denim',category:'jeans',lang:'lt',sort:'sale',maxPrice:'100',page:'2'});
  const destination = new URL(searchHref(values,{category:'outerwear',page:undefined}),'http://localhost');
  assert.equal(destination.searchParams.get('query'),'denim');
  assert.equal(destination.searchParams.get('category'),'outerwear');
  assert.equal(destination.searchParams.get('lang'),'lt');
  assert.equal(destination.searchParams.get('maxPrice'),'100');
  assert.equal(destination.searchParams.get('sort'),'sale');
  assert.equal(destination.searchParams.has('page'),false);
  assert.equal(clearFilterValues(values).query,'denim');
  assert.notEqual(createSearchCacheKey(garments,{category:'jeans'}),createSearchCacheKey(garments,{category:'bottoms'}));
});

const facetProducts = [
  {mock_product_id:'ONE',public_store_id:'demo-store-01',category:'outerwear',subcategory:'coat',gender:'women',color:'black',size_options:'S|M',price_eur:'60',old_price_eur:'80',availability:'in_stock',title:'Black wool coat'},
  {mock_product_id:'TWO',public_store_id:'demo-store-02',category:'outerwear',subcategory:'coat',gender:'women',color:'navy',size_options:'L|XL',price_eur:'70',old_price_eur:'',availability:'limited',title:'Navy wool coat'},
  {mock_product_id:'THREE',public_store_id:'demo-store-03',category:'outerwear',subcategory:'jacket',gender:'men',color:'black',size_options:'M|L',price_eur:'50',old_price_eur:'65',availability:'out_of_stock',title:'Black wool jacket'},
].map((product)=>({brand:'',style_tags:'wool',...product}));

test('size, color and store are OR groups that intersect with single-value and sale facets',()=>{
  assert.deepEqual(filterProducts(facetProducts,{color:'black,navy',size:'M,XL',store:'demo-store-01,demo-store-02',category:'outerwear',department:'women',sale:'on'}).map(p=>p.mock_product_id),['ONE']);
  assert.deepEqual(filterProducts(facetProducts,{color:'black,navy',size:'M,XL',store:'demo-store-01,demo-store-02',category:'outerwear',department:'women'}).map(p=>p.mock_product_id),['ONE','TWO']);
  assert.deepEqual(filterProducts(facetProducts,{size:'35-38'}),[], 'listed size ranges are matched literally, not expanded or invented');
  assert.deepEqual(getSizeOptions(facetProducts),['L','M','S','XL']);
});

test('out of stock is excluded by default and available only through explicit status',()=>{
  assert.deepEqual(filterProducts(facetProducts,{}).map(p=>p.mock_product_id),['ONE','TWO']);
  assert.deepEqual(filterProducts(facetProducts,{status:'out_of_stock'}).map(p=>p.mock_product_id),['THREE']);
  assert.deepEqual(searchProducts(facetProducts,{query:'wool'}).results.map(p=>p.mock_product_id).sort(),['ONE','TWO']);
});

test('semantic exact and fallback alternatives cannot escape explicit URL constraints',()=>{
  const hard = {color:'navy,black',size:'M',store:'demo-store-01',category:'outerwear',department:'women',status:'in_stock',sale:'on',minPrice:'55',maxPrice:'65'};
  const exact = searchProducts(facetProducts,{query:'wool',...hard});
  assert.deepEqual(exact.results.map((product)=>product.mock_product_id),['ONE']);
  const fallback = searchProducts(facetProducts,{query:'tailored wool',...hard});
  assert.ok(fallback.results.every((product)=>product.mock_product_id==='ONE'));
  assert.deepEqual(searchProducts(facetProducts,{query:'wool',...hard,minPrice:'broken'}).results,[]);
});
