import { filterProducts, type MockProduct, type ProductSearchResult, type SearchFilterParams } from '@/lib/mock-products';
import { catalogColorFamilies, interpretQuery } from '@/lib/semantic-search';

type Sleeve = 'none' | 'short' | 'long';
export type ObjectiveConstraints = {
  garment?: string;
  color?: string;
  department?: string;
  sleeve?: Sleeve;
  maxPrice?: number;
  maxInclusive?: boolean;
  inStock?: boolean;
  sale?: boolean;
};

export type SearchRoute = {
  route: 'objective' | 'hybrid';
  reason: 'supported-objective' | 'style-suffix' | 'unsupported-grammar' | 'empty';
  constraints: ObjectiveConstraints | null;
};

function normalize(value: string) {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().trim().replace(/\s+/g, ' ');
}

// Intentionally narrower than the semantic graph: these aliases promise literal
// catalog predicates, not related garments, material families or style guesses.
const garments: Record<string, string[]> = {
  shirt: ['shirt', 'shirts', 'marskiniai', 'marskinius'],
  tshirt: ['t-shirt', 't-shirts', 'tshirt', 'tee', 'tees', 'marskineliai'],
  top: ['top', 'tops', 'palaidine', 'palaidines'],
  tank: ['tank top', 'tank tops', 'tank', 'tanks'],
  hoodie: ['hoodie', 'hoodies'], sweatshirt: ['sweatshirt', 'sweatshirts'],
  sweater: ['sweater', 'sweaters', 'megztinis', 'megztiniai'],
  cardigan: ['cardigan', 'cardigans', 'kardiganas'],
  jacket: ['jacket', 'jackets', 'striuke', 'striukes'],
  blazer: ['blazer', 'blazers', 'svarkas', 'svarkai'],
  coat: ['coat', 'coats', 'paltas', 'paltai'],
  vest: ['vest', 'vests', 'gilet', 'gilets', 'liemene', 'liemenes'],
  trousers: ['trousers'], pants: ['pants', 'kelnes'], jeans: ['jeans', 'dzinsai'],
  shorts: ['shorts', 'sortai'], skirt: ['skirt', 'skirts', 'sijonas', 'sijonai'],
  dress: ['dress', 'dresses', 'suknele', 'sukneles'],
  sneakers: ['sneakers', 'trainers', 'kedai'], boots: ['boots', 'auliniai'],
  shoes: ['shoes', 'footwear', 'avalyne'],
  bag: ['bag', 'bags', 'rankine', 'rankines'], backpack: ['backpack', 'backpacks', 'kuprine'],
  scarf: ['scarf', 'scarves', 'salikas'],
};
const colors: Record<string, string[]> = {
  black: ['black', 'juoda', 'juodas', 'juodi', 'juodos'],
  white: ['white', 'balta', 'baltas', 'balti', 'baltos'],
  grey: ['grey', 'gray', 'pilka', 'pilkas', 'pilki'],
  blue: ['blue', 'melyna', 'melynas', 'melyni'],
  green: ['green', 'zalia', 'zalias', 'zali'],
  red: ['red', 'raudona', 'raudonas', 'raudoni'],
  pink: ['pink', 'rozine', 'rozinis'], brown: ['brown', 'ruda', 'rudas'],
  beige: ['beige', 'bezine'], navy: ['navy'], ivory: ['ivory'], cream: ['cream'],
};
const departments: Record<string, string[]> = {
  men: ["men's", 'mens', 'men', 'vyrams', 'vyriski'],
  women: ["women's", 'womens', 'women', 'moterims', 'moteriskos'],
  unisex: ['unisex'],
};
const atoms = ([['garment', garments], ['color', colors], ['department', departments]] as const)
  .flatMap(([field, dictionary]) => Object.entries(dictionary).flatMap(([value, aliases]) =>
    aliases.map((alias) => ({ field, value, alias })))).sort((a, b) => b.alias.length - a.alias.length);

/** A small, full-consumption grammar. Unknown syntax must not become a filter. */
export function planSearchRoute(query: string): SearchRoute {
  const text = normalize(query);
  const hybrid = (reason: SearchRoute['reason'] = 'unsupported-grammar'): SearchRoute =>
    ({ route: 'hybrid', reason, constraints: null });
  if (!text) return hybrid('empty');
  // Corrections, alternatives and general negation need scope interpretation.
  // Only the complete, explicitly supported sleeve phrases below are exempt.
  const guardText = text.replace(/\b(?:without sleeves|no sleeves|be rankoviu)\b/g, 'sleeveless');
  if (/\b(?:not|no|without|except|excluding|rather|actually|but|only|or|nor|neither|and|ne|be|ar|arba|bet|tik|ir)\b/.test(guardText)) return hybrid();

  const constraints: ObjectiveConstraints = {};
  let remaining = text;
  while (remaining) {
    if (Object.keys(constraints).length > 0 && /^(?:for|skirta|skirti) .+/.test(remaining)) {
      return { route: 'hybrid', reason: 'style-suffix', constraints };
    }
    const sleeve = remaining.match(/^(without sleeves|no sleeves|be rankoviu|sleeveless|short[ -]sleeves?|short[ -]sleeved|long[ -]sleeves?|long[ -]sleeved|trumpomis rankovemis|ilgomis rankovemis)(?=\s|$)/);
    if (sleeve) {
      if (constraints.sleeve) return hybrid();
      constraints.sleeve = /^(short|trumpomis)/.test(sleeve[1]) ? 'short' : /^(long|ilgomis)/.test(sleeve[1]) ? 'long' : 'none';
      remaining = remaining.slice(sleeve[0].length).trim();
      continue;
    }
    const price = remaining.match(/^(under|below|up to|iki)\s+(\d+(?:[.,]\d{1,2})?)(?:\s*(€|eur|euros))?(?=\s|$)/);
    if (price) {
      if (constraints.maxPrice !== undefined) return hybrid();
      constraints.maxPrice = Number(price[2].replace(',', '.'));
      if (!Number.isFinite(constraints.maxPrice)) return hybrid();
      constraints.maxInclusive = price[1] === 'iki' || price[1] === 'up to';
      remaining = remaining.slice(price[0].length).trim();
      continue;
    }
    const stock = remaining.match(/^(in stock|turime sandelyje)(?=\s|$)/);
    const sale = remaining.match(/^(on sale|su nuolaida)(?=\s|$)/);
    if (stock || sale) {
      const field = stock ? 'inStock' : 'sale';
      if (constraints[field]) return hybrid();
      constraints[field] = true;
      remaining = remaining.slice((stock ?? sale)![0].length).trim();
      continue;
    }
    const atom = atoms.find(({ alias }) => remaining === alias || remaining.startsWith(`${alias} `));
    if (!atom || constraints[atom.field]) return hybrid();
    constraints[atom.field] = atom.value;
    remaining = remaining.slice(atom.alias.length).trim();
  }
  return { route: 'objective', reason: 'supported-objective', constraints };
}

/** Unknown and inapplicable are deliberately distinct from a known absence. */
export function sleeveEvidence(product: MockProduct): Sleeve | 'sleeved' | 'unknown' | 'not-applicable' {
  if (!['tops', 'outerwear', 'knitwear', 'sweats', 'dresses'].includes(product.category)
    || ['sweatpants', 'joggers'].includes(product.subcategory)) return 'not-applicable';
  const details = normalize(product.visual_details ?? '').replace(/-/g, '_').split('|').map((tag) => tag.trim());
  const none = details.includes('sleeveless');
  const short = details.some((tag) => /^short(?:_[a-z]+)*_sleeve(?:s|d)?$/.test(tag));
  const long = details.some((tag) => /^long(?:_[a-z]+)*_sleeve(?:s|d)?$/.test(tag));
  const sleeved = details.some((tag) => /(?:^|_)sleeve(?:s|d)?(?:_|$)/.test(tag));
  if ((none && sleeved) || (short && long)) return 'unknown';
  if (none) return 'none';
  if (short) return 'short';
  if (long) return 'long';
  return sleeved ? 'sleeved' : 'unknown';
}

function matchesGarment(product: MockProduct, garment: string) {
  if (garment === 'pants') return ['trousers', 'jeans', 'joggers', 'sweatpants', 'leggings'].includes(product.subcategory);
  // Shopper-facing garment families are broader than leaf feed subcategories.
  // Do not copy the graph's associations (e.g. sweatshirt -> sweatpants).
  if (garment === 'jacket') return ['jacket', 'track_jacket', 'windbreaker', 'parka', 'overshirt'].includes(product.subcategory)
    || (product.subcategory === 'blazer' && /\bjacket\b/.test(normalize(product.title)));
  if (garment === 'sweatshirt') return ['sweatshirt', 'hoodie'].includes(product.subcategory);
  if (garment === 'dress') return product.category === 'dresses';
  if (garment === 'bag') return product.category === 'bags';
  if (garment === 'shoes') return product.category === 'shoes';
  if (garment === 'top') return ['tops', 'knitwear'].includes(product.category)
    || ['sweatshirt', 'hoodie'].includes(product.subcategory);
  return product.subcategory === garment;
}

export function matchesObjectiveQuery(product: MockProduct, constraints: ObjectiveConstraints | null) {
  if (!constraints) return true;
  if (constraints.garment && !matchesGarment(product, constraints.garment)) return false;
  // Broad colors share the existing EN/LT color families (green includes olive,
  // blue includes navy). An explicit shade remains exact. Read only the color
  // field so a contrasting detail in the title cannot change garment color.
  if (constraints.color) {
    const exactShade = ['navy', 'ivory', 'cream'].includes(constraints.color);
    const productColors = exactShade ? normalize(product.color).split(/[_| -]+/)
      : catalogColorFamilies(product.color);
    if (!productColors.includes(constraints.color)) return false;
  }
  if (constraints.department && normalize(product.gender) !== constraints.department) return false;
  if (constraints.sleeve && sleeveEvidence(product) !== constraints.sleeve) return false;
  if (constraints.inStock && product.availability !== 'in_stock') return false;
  if (constraints.sale && !(Number(product.old_price_eur) > Number(product.price_eur))) return false;
  if (constraints.maxPrice !== undefined) {
    const price = Number(product.price_eur);
    if (!product.price_eur.trim() || !Number.isFinite(price) || price < 0 || product.currency !== 'EUR') return false;
    if (constraints.maxInclusive ? price > constraints.maxPrice : price >= constraints.maxPrice) return false;
  }
  return true;
}

export function searchObjectiveProducts(products: MockProduct[], params: SearchFilterParams, constraints: ObjectiveConstraints): ProductSearchResult {
  const results = filterProducts(products, params).filter((product) => matchesObjectiveQuery(product, constraints));
  const interpretation = interpretQuery(params.query ?? '');
  // Preserve existing UI interpretation while using the precise plan for matching.
  interpretation.maxPrice = constraints.maxPrice;
  return {
    results,
    relevance: new Map(results.map((product) => [product.mock_product_id, 1])),
    interpretation,
    approximate: false,
    relaxedConstraints: [],
  };
}
