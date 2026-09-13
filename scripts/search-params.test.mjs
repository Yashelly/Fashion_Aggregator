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
const {normalizeSearchValues,validPriceRange,scopeSearchProducts,clearFilterValues,searchHref} = load('lib/search-params.ts');
const {createSearchCacheKey} = load('lib/search-cache-key.ts');
const {filterProducts,getCategoryOptions,searchProducts} = load('lib/mock-products.ts');
const catalog = [
  {mock_product_id:'A',public_store_id:'demo-store-01',price_eur:'40'},
  {mock_product_id:'B',public_store_id:'demo-store-02',price_eur:'80'},
  {mock_product_id:'C',public_store_id:'demo-store-03',price_eur:'160'},
];
test('canonical params trim, take first repeated value and consume legacy aliases',()=>{
  assert.deepEqual(normalizeSearchValues({query:[' black ','coat'],store:'demo-store-02,demo-store-01,demo-store-02',minPrice:' 10,50 ',sale:'on',junk:'secret',page:'-1'}),{query:'black',store:'demo-store-01,demo-store-02',minPrice:'10.5',status:'sale'});
  assert.equal(normalizeSearchValues({status:'in_stock',sale:'on'}).status,'in_stock');
  assert.equal(normalizeSearchValues({status:'',sale:'on'}).status,undefined);
});
test('budget boundaries, malformed values and zero are explicit',()=>{
  for(const [a,b] of [['',''],['0','0'],['10,50','20.10'],['','150']]) assert.ok(validPriceRange(a,b));
  for(const [a,b] of [['30','20'],['-1','20'],['abc',''],['1e2','200'],['1.234','10']]) assert.equal(validPriceRange(a,b),false);
});
test('manual constraints intersect store selection and budget before semantic ranking',()=>{
  assert.deepEqual(scopeSearchProducts(catalog,{store:'demo-store-01,demo-store-02',minPrice:'40',maxPrice:'80'}).map(x=>x.mock_product_id),['A','B']);
  assert.deepEqual(scopeSearchProducts(catalog,{maxPrice:'0'}),[]);
  assert.deepEqual(scopeSearchProducts(catalog,{minPrice:'200',maxPrice:'100'}),[]);
});
test('clear filters keeps query, locale, sort and page size, resets page',()=>{
  const next = clearFilterValues({query:'wool coat',lang:'lt',sort:'price-low',perPage:'50',page:'3',minPrice:'20',store:'demo-store-01',color:'black'});
  assert.equal(searchHref(next),'/search?query=wool+coat&sort=price-low&perPage=50&lang=lt');
});
test('runtime cache identity isolates input scope and changed prices',()=>{
  assert.equal(createSearchCacheKey(catalog,{query:' BLACK  coat '}),createSearchCacheKey(catalog,{query:'black coat'}));
  assert.notEqual(createSearchCacheKey(catalog,{query:'black'}),createSearchCacheKey(catalog.slice(0,1),{query:'black'}));
  assert.notEqual(createSearchCacheKey(catalog,{query:'black'}),createSearchCacheKey([{...catalog[0],price_eur:'39'},...catalog.slice(1)],{query:'black'}));
});

const garments = [
  {mock_product_id:'JEANS',category:'bottoms',subcategory:'jeans',title:'Blue jeans'},
  {mock_product_id:'JACKET',category:'outerwear',subcategory:'denim_jacket',title:'Blue denim jacket'},
  {mock_product_id:'SKIRT',category:'bottoms',subcategory:'skirt',title:'Blue denim skirt'},
  {mock_product_id:'TROUSERS',category:'bottoms',subcategory:'trousers',title:'Blue trousers'},
  {mock_product_id:'MISSING',category:'bottoms',subcategory:'',title:'Denim jeans'},
  {mock_product_id:'MISCLASSIFIED',category:'tops',subcategory:'jeans',title:'Jeans-print top'},
].map((product)=>({public_store_id:'demo-store-01',price_eur:'40',old_price_eur:'',availability:'in_stock',
  gender:'women',color:'blue',brand:'',style_tags:'denim',...product}));

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
