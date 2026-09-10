/**
 * Semantic search over the synthetic demo catalog.
 *
 * The old query path was a boolean AND over raw tokens: every word the shopper
 * typed had to appear literally somewhere in the product row. That answers
 * "black hoodie" and nothing else — "something warm for winter" returned zero
 * results because no row contains the word "warm".
 *
 * This module replaces that with interpretable concept matching. It is not a
 * neural embedding model, and deliberately so: the app must run with no API
 * keys, no database, and no model download (see CLAUDE.md — every external
 * service is optional). Instead the vocabulary of the catalog is modelled
 * explicitly as a weighted concept graph, which gives three things a bag of
 * tokens cannot:
 *
 *   1. Intent terms reach concrete garments. "winter" is an edge to parka,
 *      coat, wool, knitwear — so the query matches products that never use
 *      the word.
 *   2. Results are *ranked* by relevance rather than filtered by presence, so
 *      a partial match still surfaces instead of collapsing to "no results".
 *   3. Every match is explainable. `matchedTerms` records which concepts fired,
 *      which is what makes the eval harness in `scripts/semantic-eval.mjs`
 *      meaningful — a regression points at a specific edge, not at a black box.
 *
 * When a real retailer feed replaces the synthetic catalog, this graph becomes
 * the fallback/reranking layer under embedding similarity rather than being
 * thrown away — see `docs/feed-format-research-2026-07-31.md`.
 */

export type SearchableProduct = {
  mock_product_id: string;
  title: string;
  category: string;
  subcategory: string;
  brand: string;
  gender: string;
  color: string;
  style_tags: string;
  old_price_eur: string;
  availability: string;
  price_eur: string;
  /** Visual attributes read off the product photo (see lib/product-attributes.ts). */
  motif?: string;
  surface?: string;
  visual_details?: string;
  visual_description?: string;
};

export type QueryInterpretation = {
  /** Query with the price phrase removed, as actually scored. */
  text: string;
  /** Canonical terms recognised from what the shopper typed. */
  terms: string[];
  /** Canonical attributes the shopper explicitly ruled out. Hard filters. */
  excludedTerms: string[];
  /** Tokens no part of the vocabulary could explain. */
  unknownTerms: string[];
  /** Hard floor parsed from "100-150" / "from 100 to 150". */
  minPrice?: number;
  /** Hard ceiling parsed from "under 50" / "iki 50" / "100-150". */
  maxPrice?: number;
  /** Soft price direction from "cheap" / "premium". Ranking signal only. */
  pricePreference?: "low" | "high";
  /** True when the shopper asked for discounts. */
  wantsSale: boolean;
  /** True when the shopper explicitly requires an immediately purchasable item. */
  requiresInStock: boolean;
  /** Reviewable structured plan used by hard filtering and diagnostics. */
  constraints: QueryConstraints;
};

export type QueryConstraints = {
  garmentTypes: string[];
  colors: string[];
  directAttributes: string[];
  departments: string[];
  excludedTerms: string[];
  minPrice?: number;
  maxPrice?: number;
  availability?: "in_stock";
};

export type ProductScore = {
  score: number;
  matchedTerms: string[];
};

type ScoreOptions = {
  /** Alternatives may soften explicit visual/material attributes, never subject, colour, price or availability. */
  enforceDirectAttributes?: boolean;
};

/**
 * Surface forms (English and Lithuanian, diacritics already stripped) mapped
 * onto a single canonical term. Lithuanian is inflected, so several endings of
 * the same word are listed rather than stemmed — with a vocabulary this size,
 * an explicit list is more accurate than a stemmer and far easier to audit.
 */
const LEXICON: Record<string, string[]> = {
  // Garment types
  shirt: ["shirt", "shirts", "buttonup", "button-ups", "marskiniai", "marskinius", "marskiniu"],
  tee: ["tee", "tees", "tshirt", "t-shirt", "tshirts", "marskineliai", "marskinelis", "marskineliu"],
  top: ["top", "tops", "virsus", "palaidine", "palaidines"],
  tank: ["tank", "tanks", "camisole", "petnesos"],
  hoodie: ["hoodie", "hoodies", "hood", "gobtuvas", "dzemperis", "dzemperiai", "dzemperiu", "[removed]", "[removed]"],
  sweatshirt: ["sweatshirt", "sweatshirts", "sweat", "sweats", "crewneck"],
  sweater: ["sweater", "sweaters", "jumper", "megztinis", "megztiniai", "megztini"],
  // Kept distinct from `sweater`: a pullover can be a hooded top, and making
  // it a garment identity incorrectly hard-filtered hoodies out of the result.
  pullover: ["pullover", "pullovers"],
  cardigan: ["cardigan", "cardigans", "kardiganas", "megztukas"],
  knitwear: ["knit", "knits", "knitwear", "knitted", "megzta", "megztas"],
  blazer: ["blazer", "blazers", "svarkas", "svarkai"],
  jacket: ["jacket", "jackets", "striuke", "striukes", "striuku", "svarkelis"],
  coat: ["coat", "coats", "paltas", "paltai", "palta"],
  parka: ["parka", "parkas"],
  windbreaker: ["windbreaker", "windbreakers", "vejastriuke", "vejo"],
  overshirt: ["overshirt", "overshirts", "shacket"],
  vest: ["vest", "vests", "gilet", "liemene"],
  trousers: ["trousers", "trouser", "pants", "kelnes", "kelniu", "kelnems", "kelniuku"],
  jeans: ["jeans", "dzinsai", "dzinsu", "dzinsus"],
  joggers: ["joggers", "jogger", "sportines"],
  sweatpants: ["sweatpants", "trackpants", "sportkelnes"],
  leggings: ["leggings", "legging", "tamprios", "tampres"],
  shorts: ["shorts", "short", "sortai", "sortu"],
  skirt: ["skirt", "skirts", "sijonas", "sijonai", "sijona"],
  dress: ["dress", "dresses", "suknele", "sukneles", "suknelesu", "sukneliu"],
  sneakers: ["sneakers", "sneaker", "trainers", "trainer", "runners", "runner", "kedai", "kedus", "sportbaciai", "sportbacius"],
  boots: ["boots", "boot", "botai", "auliniai", "batai", "batus"],
  shoes: ["shoes", "shoe", "footwear", "avalyne", "avalynes"],
  bag: ["bag", "bags", "purse", "handbag", "rankine", "rankines", "krepsys", "krepsi"],
  tote: ["tote", "totes", "pirkiniu"],
  backpack: ["backpack", "backpacks", "rucksack", "kuprine", "kuprines"],
  crossbody: ["crossbody", "petes"],
  belt: ["belt", "belts", "dirzas", "dirzai"],
  cap: ["cap", "caps", "hat", "kepure", "kepures", "kepuraite"],
  scarf: ["scarf", "scarves", "salikas", "salika", "salikai"],
  socks: ["socks", "sock", "kojines", "kojiniu"],
  jewelry: ["jewelry", "jewellery", "earrings", "earring", "hoops", "papuosalai", "auskarai", "auskarus"],
  accessories: ["accessory", "accessories", "aksesuarai", "aksesuaru", "aksesuaras"],
  outerwear: ["outerwear", "virsutinis", "virsutiniai"],

  // Fit and cut
  oversized: ["oversized", "oversize", "baggy", "loose", "relaxed", "platus", "laisvas", "laisvi"],
  cropped: ["cropped", "crop", "trumpintas", "trumpas"],
  slim: ["slim", "fitted", "skinny", "siauras", "priglundantis"],
  wide: ["wide", "flared", "platus", "kliosas"],
  mini: ["mini", "trumpa"],
  midi: ["midi", "vidutinio"],
  long: ["long", "longline", "ilgas", "ilga", "ilgi"],
  high: ["high", "highrise", "aukstas", "aukstu"],
  chunky: ["chunky", "platform", "platforma", "platformos", "storapadis", "storapadziai"],
  small: ["small", "tiny", "miniature", "maza", "mazas"],
  low: ["low", "low-profile", "zemas", "zemu"],
  faded: ["faded", "washed", "worn", "worn-in", "nuskalbtas"],
  bottoms: ["bottoms", "bottom", "legwear", "apatine"],
  breathable: ["breathable", "airy", "orui"],
  reflective: ["reflective", "reflective-looking", "atspindintis"],
  baselayer: ["baselayer"],
  quietluxury: ["quietluxury"],
  fluid: ["fluid"],
  architectural: ["architectural"],

  // Materials and finishes
  cotton: ["cotton", "medvilne", "medvilnes"],
  leather: ["leather", "suede", "oda", "odos", "odiniai", "odine"],
  wool: ["wool", "merino", "cashmere", "vilna", "vilnos", "vilnonis", "kasmyras"],
  linen: ["linen", "linas", "lino"],
  satin: ["satin", "silk", "satinas", "silkas", "silko"],
  velvet: ["velvet", "aksomas", "aksominis"],
  nylon: ["nylon", "technical", "nailonas"],
  waterproof: ["waterproof", "weatherproof", "neperslampamas", "neperslampami", "neperlyjamas"],
  ribbed: ["ribbed", "rumbuotas"],
  quilted: ["quilted", "puffer", "padded", "dygsniuotas", "pukine"],
  // A fabric, deliberately not a surface form of `jeans`: "denim jacket"
  // asks for a jacket made of denim, and treating the word as the garment
  // let every pair of jeans through the garment gate.
  denim: ["denim", "dzinsinis", "dzinsine"],
  // "trail" is a property of the product; "hiking" is what the shopper is
  // doing. They must stay separate canonicals — the whole fix depends on the
  // intent reaching the property rather than being the same token.
  trail: ["trail"],
  utility: ["utility", "cargo", "tactical", "darbinis"],
  tracksuit: ["tracksuit", "tracksuits", "sportkostiumas"],
  graphic: ["graphic", "print", "printed", "logo", "logos", "piesinys", "printas", "spauda"],
  grotesque: ["grotesque", "[removed]", "[removed]", "[removed]"],

  // Motifs and construction read off the product photos. Only vocabulary the
  // catalog actually contains is listed — there are no stars, stripes, checks
  // or animal prints in these 64 products, so those words stay unknown and
  // honestly return nothing rather than a near-miss.
  geometric: ["geometric", "geometry", "bauhaus", "geometrinis", "geometrija"],
  abstract: ["abstract", "abstraktus", "abstrakcija"],
  floral: ["floral", "flower", "flowers", "blossom", "gelete", "geles", "geliu", "geletas"],
  stripe: ["stripe", "stripes", "striped", "dryzuotas", "dryzuota"],
  star: ["star", "stars", "starred", "[removed]", "[removed]", "[removed]", "[removed]", "[removed]", "[removed]", "[removed]"],
  circle: ["circle", "circles", "round", "dot", "dots", "apskritimas", "apskritimai", "taskai"],
  square: ["square", "squares", "rectangle", "rectangles", "kvadratas", "kvadratai", "staciakampis"],
  triangle: ["triangle", "triangles", "trikampis", "trikampiai"],
  hood: ["hood", "hooded", "gobtuvu"],
  drawstring: ["drawstring", "drawcord", "raiscia", "virvute"],
  zip: ["zip", "zipper", "zipped", "uztrauktukas", "uztrauktuku"],
  closure: ["closure", "fastening", "fastener", "[removed]", "[removed]", "[removed]", "[removed]"],
  pocket: ["pocket", "pockets", "kisene", "kisenes", "kiseniu"],
  pleated: ["pleat", "pleats", "pleated", "klostes", "klostuotas"],
  laceup: ["lace", "laces", "laced", "lacing", "raisteliai", "sunerti"],
  fringe: ["fringe", "fringed", "tassels", "kutai", "kutais"],
  cowl: ["cowl", "draped", "draping", "kriokle"],
  wrap: ["wrap", "wrapped", "apvyniojamas"],
  canvas: ["canvas", "drobe", "drobinis"],
  fleece: ["fleece", "flisas", "flisinis"],
  jersey: ["jersey", "trikotazas"],

  // Photo-derived construction vocabulary. These are properties, not garment
  // identities, so they can safely be matched from the attribute table.
  button: ["button", "buttons", "buttoned", "buttoning", "saga", "sagos"],
  collar: ["collar", "collared", "lapel", "lapels", "apykakle", "apykakles"],
  sleeve: ["sleeve", "sleeves", "sleeved", "rankove", "rankoves", "rankoviu"],
  strap: ["strap", "straps", "shoulder", "petnele", "petneles"],
  waist: ["waist", "waistband", "liemuo", "liemens"],
  handsfree: ["handsfree", "hands-free"],
  tapered: ["tapered", "taper", "tapering", "siaurejantis"],
  straight: ["straight", "tiesus", "tiesios"],
  pointed: ["pointed", "pointy", "smailus", "smailia"],
  almond: ["almond", "migdolinis"],
  open: ["open", "open-top", "open top", "atviras", "atvira"],
  flap: ["flap", "flaps", "atvartas", "atvartu"],
  structured: ["structured", "structure", "boxy", "formuota"],
  cargopocket: ["cargo-pocket", "cargo pockets"],
  nobeltloops: ["no-belt-loops"],
  glossy: ["glossy", "shiny", "high-shine", "high shine", "liquid-looking", "liquid"],
  matte: ["matte", "matte", "matt", "matinis"],
  soft: ["soft", "soft-looking", "brushed", "plush", "minkstas", "minksta"],

  // Colours and colour families
  black: ["black", "juoda", "juodas", "juodi", "juodos", "juoduma", "[removed]", "[removed]", "[removed]", "[removed]", "[removed]", "[removed]", "[removed]", "[removed]"],
  white: ["white", "ivory", "cream", "balta", "baltas", "balti", "baltos"],
  grey: ["grey", "gray", "charcoal", "pilka", "pilkas", "pilki"],
  blue: ["blue", "navy", "melyna", "melynas", "melyni", "melynos"],
  green: ["green", "olive", "sage", "emerald", "khaki", "forest", "zalia", "zalias", "zali"],
  red: ["red", "burgundy", "raudona", "raudonas", "raudoni"],
  pink: ["pink", "rose", "rozine", "rozinis", "rozines"],
  purple: ["purple", "lilac", "violetine", "violetinis", "alyvine"],
  brown: ["brown", "chocolate", "camel", "tan", "ruda", "rudas", "rudi"],
  beige: ["beige", "sand", "stone", "nude", "smelio", "bezine", "smelis"],
  orange: ["orange", "oranzine", "oranzinis"],
  yellow: ["yellow", "mustard", "gold", "golden", "geltona", "geltonas", "geltoni"],
  silver: ["silver", "metallic", "sidabrine", "sidabrinis"],
  // Kept as a separate shade rather than folded into green: there is no lime
  // item in this catalog, and returning an emerald item would be deceptive.
  lime: ["lime", "lime-green", "laimu"],
  neutral: ["neutral", "neutralus", "neutrali", "ramus"],
  bright: ["bright", "bold", "colourful", "colorful", "ryskus", "ryski", "spalvingas"],
  dark: ["dark", "tamsus", "tamsi", "tamsios"],
  light: ["light", "pastel", "sviesus", "sviesi", "pastelinis"],

  // Occasions, seasons, situations
  office: ["office", "work", "business", "meeting", "biuras", "biurui", "darbas", "darbui", "susitikimas"],
  formal: ["formal", "suit", "tailored", "elegant", "smart", "oficialus", "eleganti", "elegantiskas", "kostiumas"],
  party: ["party", "club", "clubbing", "vakarelis", "vakareliui", "klubas", "klubui"],
  evening: ["evening", "night", "vakaras", "vakarui", "naktis"],
  date: ["date", "romantic", "pasimatymas", "pasimatymui", "romantiskas"],
  wedding: ["wedding", "occasion", "vestuves", "vestuvems", "proga", "sventei"],
  casual: ["casual", "everyday", "daily", "kasdien", "kasdienis", "kasdieniai", "laisvalaikio"],
  streetwear: ["streetwear", "street", "urban", "gatves", "gatve"],
  minimal: ["minimal", "minimalist", "clean", "simple", "minimalistinis", "paprastas", "svarus"],
  retro: ["retro", "vintage", "nineties", "y2k", "senovinis"],
  sport: ["sport", "sporty", "athletic", "active", "sportas", "sportinis", "sportiniai"],
  gym: ["gym", "training", "workout", "run", "running", "sportsale", "treniruote", "treniruotei", "begimas"],
  outdoor: ["outdoor", "hiking", "hike", "walking", "walk", "lauko", "zygis", "zygiui", "zygiams", "zygio", "pasivaiksciojimui", "gamta"],
  travel: ["travel", "trip", "commute", "kelione", "kelionei", "keliauti"],
  campus: ["campus", "school", "university", "student", "mokykla", "universitetas", "studentas"],
  festival: ["festival", "festivalis", "festivaliui"],
  cozy: ["cozy", "cosy", "soft", "comfy", "comfortable", "jauku", "jaukus", "minkstas", "patogus", "patogi"],
  warm: ["warm", "warmth", "siltas", "silta", "silti", "sildantis"],
  cold: ["cold", "freezing", "salta", "saltas", "salcio"],
  winter: ["winter", "ziema", "ziemai", "zieminis", "zieminiai"],
  autumn: ["autumn", "fall", "ruduo", "rudeniui", "rudeninis"],
  spring: ["spring", "pavasaris", "pavasariui", "pavasarinis"],
  summer: ["summer", "vasara", "vasarai", "vasarinis", "vasariniai", "vasarine", "vasarini"],
  rain: ["rain", "rainy", "wet", "lietus", "lietui", "lietinga", "slapias"],
  beach: ["beach", "holiday", "vacation", "paplūdimys", "pajuris", "atostogos", "atostogoms"],
  layering: ["layering", "layer", "sluoksniavimas", "sluoksniuoti"],
  gift: ["gift", "present", "dovana", "dovanai"],

  // Departments
  women: ["women", "woman", "womens", "female", "ladies", "moterims", "moteriska", "moteriski", "moteris"],
  men: ["men", "man", "mens", "male", "vyrams", "vyriska", "vyriski", "vyras"],
  unisex: ["unisex", "universalus"],

  // Commercial signals
  sale: ["sale", "discount", "discounted", "reduced", "deal", "deals", "nuolaida", "nuolaidos", "ispardavimas", "akcija"],
  cheap: ["cheap", "budget", "affordable", "inexpensive", "pigus", "pigiai", "pigu", "nebrangus", "nebrangiai"],
  premium: ["premium", "luxury", "expensive", "designer", "brangus", "prabangus", "kokybiskas"],
  available: ["available", "instock", "stock", "sandelyje", "turima"],
  laptop: ["laptop", "computer", "notebook", "kompiuteris", "kompiuteriui", "nesiojamas"],
};

/**
 * Terms that describe *how to rank* rather than *what to match*. They are
 * consumed as signals in `interpretQuery` and then removed from the concept
 * set, because leaving them in would put weight in the denominator that no
 * product row can ever satisfy — every result in a "cheap accessories" search
 * would be penalised for the word "cheap".
 */
const RANKING_ONLY_TERMS = new Set(["cheap", "premium", "available"]);

/** Multi-word phrases collapsed to a canonical term before tokenising. */
const PHRASES: Array<[RegExp, string]> = [
  [/\bnight out\b/g, "party"],
  [/\bgoing out\b/g, "party"],
  [/\bdate night\b/g, "date"],
  [/\bwork out\b/g, "gym"],
  [/\bworking out\b/g, "gym"],
  [/\brainy day\b/g, "rain"],
  [/\bsmart casual\b/g, "smart"],
  [/\bwide leg\b/g, "wide"],
  [/\bhigh top\b/g, "high"],
  [/\bt shirt\b/g, "tshirt"],
  [/\bbutton[- ]up\b/g, "buttonup"],
  [/\bhands[- ]free\b/g, "handsfree"],
  [/\bacross the body\b/g, "crossbody"],
  [/\bshort sleeves?\b/g, "sleeve"],
  [/\bno visible closure\b/g, "open"],
  [/\bankle[- ]height\b/g, "ankle"],
  [/\bbelow the knee\b/g, "midi"],
  [/\bouter layer\b/g, "outerwear"],
  [/\bfront pouch\b/g, "pocket"],
  [/\bfull outfit\b/g, "dress"],
  [/\bbase layer\b/g, "baselayer"],
  [/\bpressed (?:centre|center) crease\b/g, "crease"],
  [/\bwide leg\b/g, "wide"],
  [/\bcargo pockets?\b/g, "cargopocket"],
  [/\bno belt loops?\b/g, "nobeltloops"],
  [/\binstead of\b/g, "not"],
  [/\bsuitable for movement\b/g, "gym"],
  [/\bfor stretching\b/g, "gym"],
  [/\bone[- ]piece\b/g, "dress"],
  [/\bworn[- ]in\b/g, "faded"],
  [/\blong sleeves?\b/g, "sleeve"],
  [/\bflared silhouette\b/g, "wide"],
  [/\bhands[- ]free for carrying essentials\b/g, "handsfree"],
  [/\bgo with everything\b/g, "minimal"],
  [/\bpolished dark\b/g, "formal dark"],
  [/\bcosy for my upper body\b/g, "cozy"],
  [/\boutfit[- ]finishing small gift\b/g, "gift"],
  [/\bquiet luxury\b/g, "quietluxury"],
  [/\bkeeps its shape\b/g, "structured"],
  [/\bfeel dressed up\b/g, "evening"],
  [/\btemperature keeps changing\b/g, "layering"],
  [/\bcommuting and meetings\b/g, "office travel"],
  [/\bsoft shape fluid movement\b/g, "fluid"],
  [/\barchitectural but wearable\b/g, "architectural"],
  [/\bpuffer jacket\b/g, "quilted jacket"],
  [/\bi vakareli\b/g, "party"],
  [/\bi biura\b/g, "office"],
  [/\bi darba\b/g, "office"],
  [/\bi sporto sale\b/g, "gym"],
];

/**
 * Directed edges from an intent concept to the concrete vocabulary that
 * satisfies it. Weight is how strongly the target answers the concept: 1.0
 * means "this is literally what was asked for", 0.5 means "plausible, show it
 * lower down". Edges are intentionally one-way — "winter" should reach "parka",
 * but typing "parka" should not pull in every scarf in the catalog.
 */
const ASSOCIATIONS: Record<string, Array<[string, number]>> = {
  winter: [["coat", 0.95], ["parka", 0.95], ["quilted", 0.9], ["wool", 0.9], ["knitwear", 0.85], ["sweater", 0.85], ["scarf", 0.85], ["cardigan", 0.8], ["outerwear", 0.9], ["boots", 0.7], ["hoodie", 0.6], ["warm", 0.9]],
  cold: [["winter", 0.95], ["warm", 0.95], ["coat", 0.85], ["parka", 0.85], ["wool", 0.85], ["scarf", 0.8], ["knitwear", 0.8]],
  warm: [["wool", 0.9], ["knitwear", 0.9], ["quilted", 0.9], ["coat", 0.85], ["parka", 0.85], ["sweater", 0.9], ["cardigan", 0.85], ["hoodie", 0.8], ["scarf", 0.8], ["cozy", 0.8]],
  autumn: [["coat", 0.8], ["knitwear", 0.8], ["overshirt", 0.8], ["boots", 0.75], ["cardigan", 0.75], ["layering", 0.8], ["jacket", 0.7]],
  spring: [["jacket", 0.75], ["overshirt", 0.7], ["shirt", 0.7], ["windbreaker", 0.7], ["layering", 0.6]],
  summer: [["tank", 0.9], ["shorts", 0.9], ["linen", 0.9], ["tee", 0.85], ["dress", 0.8], ["skirt", 0.75], ["sneakers", 0.5]],
  beach: [["summer", 0.9], ["shorts", 0.85], ["tank", 0.85], ["linen", 0.8], ["dress", 0.75]],
  // Same reasoning: leather boots keep rain off your feet, but they are a much
  // weaker answer than a waterproof upper, so they must not outrank one.
  rain: [["waterproof", 0.95], ["nylon", 0.9], ["parka", 0.9], ["windbreaker", 0.9], ["outerwear", 0.8], ["coat", 0.7], ["boots", 0.45]],
  // No edge to `outerwear`: that would make every wool coat and blazer in the
  // catalog a 70% answer to "waterproof", which is how wool coats used to rank
  // in a waterproof search. The garment word already supplies the category.
  waterproof: [["nylon", 0.9], ["parka", 0.9], ["windbreaker", 0.9], ["trail", 0.85], ["outdoor", 0.7]],

  office: [["blazer", 0.95], ["formal", 0.9], ["trousers", 0.85], ["shirt", 0.85], ["tote", 0.8], ["crossbody", 0.55], ["minimal", 0.6], ["coat", 0.6], ["belt", 0.6], ["boots", 0.5]],
  formal: [["blazer", 0.95], ["trousers", 0.85], ["dress", 0.7], ["shirt", 0.75], ["boots", 0.55], ["office", 0.7]],
  smart: [["formal", 0.9], ["blazer", 0.85], ["trousers", 0.8], ["minimal", 0.6]],
  // Occasion → garment edges stay deliberately weaker than occasion → mood
  // edges. "Party" must not certify every dress in the catalog as a party
  // dress; the pieces actually tagged party/evening/satin have to win, and
  // a plain shirt dress has to place below them.
  wedding: [["formal", 0.9], ["evening", 0.85], ["satin", 0.8], ["dress", 0.7], ["blazer", 0.7], ["jewelry", 0.6]],
  // "mini" is weak here on purpose: it means a short hem on a dress, but the
  // same word means "small" on a bag, and the ranker cannot tell them apart
  // from the title alone. At 0.7 it put a mini backpack in "night out".
  party: [["evening", 0.95], ["satin", 0.85], ["velvet", 0.85], ["jewelry", 0.7], ["dress", 0.6], ["boots", 0.5], ["bright", 0.5], ["mini", 0.45]],
  evening: [["satin", 0.8], ["velvet", 0.8], ["jewelry", 0.7], ["dress", 0.6], ["formal", 0.6], ["boots", 0.5]],
  date: [["evening", 0.8], ["satin", 0.7], ["dress", 0.6], ["skirt", 0.5], ["jewelry", 0.6]],

  gym: [["sport", 0.95], ["leggings", 0.9], ["shorts", 0.85], ["joggers", 0.8], ["sweatpants", 0.75], ["tank", 0.7], ["sneakers", 0.7]],
  breathable: [["linen", 0.95], ["cotton", 0.8], ["nylon", 0.55]],
  reflective: [["silver", 0.9], ["metallic", 0.85]],
  sport: [["leggings", 0.85], ["shorts", 0.8], ["joggers", 0.8], ["sneakers", 0.75], ["sweatpants", 0.7], ["cap", 0.5]],
  // Hiking is answered by trail/weatherproof construction, NOT by footwear in
  // general. An earlier version pointed outdoor → sneakers at 0.75, which told
  // the ranker that every platform sneaker in the catalog was a 75% answer to
  // "hiking". The garment type is already carried by the word "shoes"; this
  // edge only has to supply the qualities.
  outdoor: [["trail", 0.95], ["waterproof", 0.9], ["nylon", 0.8], ["utility", 0.7], ["parka", 0.6], ["windbreaker", 0.6], ["boots", 0.5], ["vest", 0.5], ["sneakers", 0.35]],
  travel: [["backpack", 0.9], ["crossbody", 0.8], ["tote", 0.75], ["nylon", 0.7], ["sneakers", 0.6], ["cozy", 0.5]],
  campus: [["backpack", 0.85], ["hoodie", 0.8], ["sneakers", 0.75], ["jeans", 0.7], ["tee", 0.65], ["casual", 0.7]],
  festival: [["streetwear", 0.8], ["shorts", 0.6], ["cap", 0.6], ["graphic", 0.6]],
  grotesque: [["graphic", 0.9], ["abstract", 0.8], ["geometric", 0.7], ["dark", 0.55]],
  closure: [["zip", 0.9], ["button", 0.8], ["flap", 0.55]],

  streetwear: [["hoodie", 0.85], ["sneakers", 0.8], ["graphic", 0.8], ["oversized", 0.75], ["cap", 0.7], ["joggers", 0.7], ["sweatshirt", 0.7]],
  casual: [["jeans", 0.8], ["tee", 0.8], ["hoodie", 0.75], ["sneakers", 0.7], ["shirt", 0.6], ["sweatshirt", 0.65]],
  cozy: [["knitwear", 0.9], ["sweater", 0.9], ["cardigan", 0.85], ["hoodie", 0.8], ["sweatpants", 0.75], ["scarf", 0.8], ["wool", 0.8]],
  minimal: [["clean", 0.6], ["neutral", 0.6]],
  layering: [["cardigan", 0.85], ["overshirt", 0.85], ["vest", 0.8], ["shirt", 0.6], ["jacket", 0.6]],
  gift: [["jewelry", 0.8], ["scarf", 0.8], ["socks", 0.7], ["accessories", 0.8]],

  // Garment-level relations, used to bridge near-identical items.
  //
  // These edges only ever point from the general word to the specific one.
  // The reverse ("boots" → "shoes") looks harmless but is not: the second hop
  // would then walk back down into every sibling, so "black boots" would rank
  // black sneakers alongside actual boots.
  shoes: [["sneakers", 0.9], ["boots", 0.9]],
  bag: [["tote", 0.85], ["backpack", 0.8], ["crossbody", 0.6]],
  handsfree: [["crossbody", 0.9], ["backpack", 0.85], ["waist", 0.85]],
  baselayer: [["tank", 0.95], ["tee", 0.9], ["top", 0.85]],
  quietluxury: [["minimal", 0.9], ["formal", 0.85], ["satin", 0.75], ["leather", 0.7], ["wool", 0.7]],
  fluid: [["satin", 0.95], ["cowl", 0.85]],
  architectural: [["structured", 0.9], ["geometric", 0.8], ["formal", 0.65]],
  bottoms: [["trousers", 0.9], ["jeans", 0.9], ["leggings", 0.85], ["shorts", 0.85], ["skirt", 0.8], ["joggers", 0.75], ["sweatpants", 0.75]],
  // Likewise no generic `bag` edge — a waist bag does not hold a laptop. Any
  // bag still reaches the results through the shopper's own word "bag".
  laptop: [["tote", 1], ["backpack", 1]],
  hoodie: [["sweatshirt", 0.75]],
  pullover: [["hoodie", 0.95], ["sweater", 0.8]],
  hood: [["hoodie", 0.85], ["sweatshirt", 0.5]],
  sweatshirt: [["hoodie", 0.75]],
  sweater: [["knitwear", 0.9], ["cardigan", 0.6]],
  knitwear: [["sweater", 0.9], ["cardigan", 0.85]],
  cardigan: [["knitwear", 0.9]],
  top: [["tee", 0.8], ["shirt", 0.75], ["tank", 0.75], ["sweatshirt", 0.6]],
  tee: [["top", 0.7]],
  outerwear: [["jacket", 0.9], ["coat", 0.9], ["parka", 0.85], ["windbreaker", 0.8], ["vest", 0.7]],
  jacket: [["outerwear", 0.8]],
  coat: [["outerwear", 0.8]],
  accessories: [["belt", 0.8], ["cap", 0.8], ["scarf", 0.8], ["socks", 0.75], ["jewelry", 0.8], ["bag", 0.4]],
  // A tracksuit is a set, not a row in this catalog; it resolves to the
  // pieces that make one up.
  tracksuit: [["sweatpants", 0.9], ["joggers", 0.9], ["jacket", 0.7], ["sport", 0.8]],
  denim: [["jeans", 0.9]],
  jeans: [["denim", 0.85]],
  // "kelnės" is the general Lithuanian word for legwear, so trousers has to
  // reach its siblings. English "trousers" is narrower but shares the entry;
  // the weights keep actual trousers ahead.
  trousers: [["jeans", 0.7], ["joggers", 0.7], ["sweatpants", 0.65], ["leggings", 0.6], ["shorts", 0.45]],
  joggers: [["sweatpants", 0.85]],
  sweatpants: [["joggers", 0.85]],

  // Colour families expand to the concrete colours present in the catalog.
  dark: [["black", 0.9], ["grey", 0.7], ["blue", 0.6], ["brown", 0.6], ["green", 0.5]],
  light: [["white", 0.85], ["beige", 0.8], ["pink", 0.6], ["blue", 0.5]],
  neutral: [["beige", 0.9], ["white", 0.85], ["grey", 0.85], ["brown", 0.7], ["black", 0.6]],
  bright: [["orange", 0.9], ["red", 0.85], ["pink", 0.8], ["purple", 0.8], ["green", 0.7]],

  cheap: [["sale", 0.5]],
  premium: [["leather", 0.6], ["wool", 0.6]],
};

const STOPWORDS = new Set([
  "a", "an", "the", "for", "with", "and", "or", "of", "to", "in", "on", "at", "my", "me", "some",
  "something", "anything", "that", "this", "is", "are", "am", "be", "i", "want", "need", "needs",
  "looking", "look", "find", "show", "please", "nice", "good", "really", "very", "any", "kind",
  "sort", "thing", "things", "wear", "wearing", "it", "its", "im", "ive", "can", "you", "do",
  "clothes", "clothing", "outfit", "outfits", "piece", "pieces", "item", "items", "should", "finish",
  "carry", "carrying", "essentials", "upper", "body", "alone", "built", "around",
  "drabuziai", "drabuziu", "apranga", "aprangos", "rubai", "rubu", "preke", "prekes",
  "ir", "su", "be", "del", "kazkas", "kazka", "kazko", "kazkoki", "kazkokia", "man", "as", "noriu",
  "reikia", "ieskau", "rodyk", "labai", "kad", "kuris", "kuri", "apie", "yra", "buti", "tai",
  "koks", "kokia", "kokie", "gerai", "geras", "gera", "prie", "per", "pas", "nes", "bet", "ar",
  "not", "without", "no", "rather", "than", "actually", "quite", "over", "now", "ne",
  "[removed]", "[removed]", "[removed]", "[removed]", "[removed]", "[removed]", "[removed]", "[removed]", "[removed]", "[removed]", "[removed]",
]);

const PRICE_RANGE_PATTERNS = [
  /\b(?:between|from|nuo|[removed])\s*(\d+(?:[.,]\d+)?)\s*(?:to|and|iki|[removed]|-)\s*(\d+(?:[.,]\d+)?)(?:\s*(?:euros?|eur|euro|[removed]))?/,
  /\b(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)(?:\s*(?:euros?|eur|euro|[removed]))?/,
] as const;
const PRICE_PATTERN = /\b(?:under|below|less than|up to|no more than|at|iki|pigiau nei|maziau nei|[removed])\s*(\d+(?:[.,]\d+)?)(?:\s*(?:euros?|eur|euro|[removed]))?(?:\s+or\s+less)?/;

/** Field weights when building a product's own term vector. */
const FIELD_WEIGHTS = {
  subcategory: 1,
  title: 0.9,
  color: 0.85,
  styleTag: 0.85,
  category: 0.8,
  gender: 0.7,
  sale: 0.6,
  brand: 0.45,
  // What is printed on a garment is as distinguishing as its subcategory.
  motif: 0.95,
  surface: 0.8,
  visualDetail: 0.7,
  // The prose sentence repeats what the fields above already say; it is here to
  // catch wording the tag lists missed, so it must not outweigh them.
  visualDescription: 0.5,
} as const;

/**
 * Terms that name a kind of thing rather than describe one.
 *
 * When a shopper types one of these they have set the subject of the sentence:
 * "shoes for hiking in the rain" is a request for shoes, and a waterproof parka
 * is a wrong answer no matter how well it satisfies "rain". Descriptive terms
 * (colours, moods, occasions, materials) carry no such constraint — "something
 * warm" deliberately leaves the garment open.
 */
const GARMENT_TERMS = new Set([
  "shirt", "tee", "top", "tank", "hoodie", "sweatshirt", "sweater", "cardigan", "knitwear",
  "blazer", "jacket", "coat", "parka", "windbreaker", "overshirt", "vest", "trousers", "jeans",
  "joggers", "sweatpants", "leggings", "shorts", "skirt", "dress", "sneakers", "boots", "shoes",
  "bag", "tote", "backpack", "crossbody", "belt", "cap", "scarf", "socks", "jewelry",
  "accessories", "outerwear", "tracksuit",
]);

/**
 * Naming a garment excludes other garments outright — it does not merely push
 * them down. A shopper asking for shoes is not offered a slightly-less-good
 * parka; the parka is a wrong answer, and burying it at position 10 still puts
 * it on the page. Damping was tried first and let jackets through under the
 * relative cut whenever the top result scored high enough.
 */
const EXCLUDE_OFF_SUBJECT = true;
/** Expansion weight at which a garment still counts as answering the subject. */
const GARMENT_TARGET_FLOOR = 0.5;

/**
 * Concrete colours — the lexicon terms that name an actual colour a product's
 * `color` field can hold, as opposed to the *qualities* `neutral`/`bright`/
 * `dark`/`light`, which describe a range and expand to several colours. A
 * directly-named concrete colour is a hard constraint (below), so this set must
 * stay to actual colours: adding `dark` here would wrongly exclude a brown coat
 * from "dark coat".
 */
const COLOR_TERMS = new Set([
  "black", "white", "grey", "blue", "green", "red", "pink",
  "purple", "brown", "beige", "orange", "yellow", "silver", "lime",
]);

/** Explicit departments are catalog facts, not ranking preferences. */
const DEPARTMENT_TERMS = new Set(["women", "men", "unisex"]);

/**
 * Concrete properties are conjunctions when a shopper names them. Intent
 * words such as `winter` and `office` intentionally stay soft/expandable;
 * materials and observed construction do not. This prevents a partial match
 * (for example a nylon backpack) from impersonating a "leather backpack".
 */
const DIRECT_ATTRIBUTE_TERMS = new Set([
  "cotton", "leather", "wool", "linen", "satin", "velvet", "nylon",
  "ribbed", "quilted", "denim", "canvas", "fleece", "jersey", "utility", "graphic",
  "button", "collar", "sleeve", "strap", "waist", "tapered", "straight", "pointed",
  "almond", "open", "flap", "structured", "glossy", "matte", "soft", "cargopocket",
  "nobeltloops", "zip", "pocket", "pleated", "laceup", "fringe", "cowl", "wrap",
  "wide", "cropped", "slim", "mini", "midi", "long", "high", "low", "chunky",
  "floral", "geometric", "abstract", "stripe", "star",
]);

/**
 * Naming a colour excludes the wrong colours outright, exactly as naming a
 * garment excludes the wrong categories. Without this, an unstocked colour only
 * *lightly* penalises: "yellow dress" scored every dress ~0.35 and returned four
 * non-yellow dresses instead of the honest "not stocked". A product satisfies
 * the constraint when its (canonicalised) colour is one the shopper named.
 */
const EXCLUDE_OFF_COLOR = true;

/**
 * Floor of the coverage multiplier — how much a product keeps when it answers
 * only one of several concepts. Lower is stricter about partial answers.
 */
const COVERAGE_FLOOR = 0.4;

const EXPANSION_FLOOR = 0.2;
const SECOND_HOP_DECAY = 0.7;

/** Absolute relevance a product must clear to be shown at all. */
export const RELEVANCE_FLOOR = 0.25;
/** …and it must also be within this fraction of the best result. */
export const RELEVANCE_RATIO = 0.65;

const surfaceToCanonical = new Map<string, string>();
for (const [canonical, surfaces] of Object.entries(LEXICON)) {
  surfaceToCanonical.set(normalizeText(canonical), canonical);
  for (const surface of surfaces) surfaceToCanonical.set(normalizeText(surface), canonical);
}
const vocabulary = [...surfaceToCanonical.keys()];

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[–—]/g, "-")
    .replace(/[_/]+/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ");
}

/**
 * Damerau-Levenshtein distance, short-circuited at `limit`.
 *
 * Transposition has to count as one edit, not two: the most common typo people
 * make on a keyboard is swapping adjacent letters, and plain Levenshtein scores
 * "snekaers" two edits away from "sneakers" — far enough to be rejected.
 */
function editDistanceWithin(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let twoBack: number[] = [];
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowBest = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, twoBack[j - 2] + 1);
      }
      current.push(value);
      if (value < rowBest) rowBest = value;
    }
    if (rowBest > limit) return limit + 1;
    twoBack = previous;
    previous = current;
  }

  return previous[b.length];
}

/**
 * Resolve a token to a canonical term.
 *
 * `allowFuzzy` must be false for catalog text. The one-edit rescue exists for
 * what a shopper types, where "snekaers" is obviously "sneakers"; applied to
 * product data it silently rewrites the catalog. It read the "dropped_shoulder"
 * on a shirt as "cropped" — one letter — and every dropped-shoulder garment in
 * the catalog then answered "cropped top" as well as the actual cropped ones.
 *
 * Only tokens of 5+ characters are rescued even for queries: at four
 * characters a single edit turns real words into different real words
 * ("tank" → "tan").
 */
function canonicalize(token: string, allowFuzzy = true): string | undefined {
  const direct = surfaceToCanonical.get(token);
  if (direct) return direct;

  if (allowFuzzy && token.length >= 5) {
    let best: string | undefined;
    let bestDistance = 2;
    for (const candidate of vocabulary) {
      if (Math.abs(candidate.length - token.length) > 1) continue;
      const distance = editDistanceWithin(token, candidate, 1);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
        if (distance === 0) break;
      }
    }
    if (best) return surfaceToCanonical.get(best);
  }

  return undefined;
}

function tokenize(text: string): string[] {
  return text
    // Hyphens are editorial punctuation in product prose ("forest-coloured",
    // "ankle-height"), not a semantic atom. Phrase normalization above keeps
    // the small set of true compounds (for example "t-shirt") intact first.
    .replace(/-/g, " ")
    .split(/[\s,]+/)
    .map((token) => token.trim().replace(/^-+|-+$/g, ""))
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

const NEGATION_STARTERS = new Set(["not", "without", "no", "ne", "be"]);
const NEGATION_FILLER = new Set(["a", "an", "the", "actually", "quite", "over", "looking", "paying"]);
const NEGATION_BREAKERS = new Set(["but", "rather", "than", "for", "that", "at", "under", "below", "with"]);

/**
 * Pull direct exclusions out of ordinary shopper phrasing before concept
 * expansion. An exclusion deliberately never walks the association graph:
 * "without a zipper" must reject a zip, not every item associated with one.
 */
function extractExcludedTerms(text: string): string[] {
  const rawTokens = text.split(/\s+/).filter(Boolean);
  const excluded = new Set<string>();

  for (let index = 0; index < rawTokens.length; index += 1) {
    const token = rawTokens[index];
    const isRatherThan = token === "rather" && rawTokens[index + 1] === "than";
    if (!NEGATION_STARTERS.has(token) && !isRatherThan) continue;

    let cursor = index + (isRatherThan ? 2 : 1);
    while (NEGATION_FILLER.has(rawTokens[cursor])) cursor += 1;
    const candidates: string[] = [];
    while (cursor < rawTokens.length && candidates.length < 3) {
      const candidate = rawTokens[cursor];
      if (NEGATION_BREAKERS.has(candidate) || NEGATION_STARTERS.has(candidate)) break;
      if (candidate === "and" || candidate === "or") {
        cursor += 1;
        continue;
      }
      const canonical = canonicalize(candidate);
      if (canonical) candidates.push(canonical);
      cursor += 1;
    }

    // "not black shoes" means shoes are the positive subject and black is the
    // excluded attribute. In all other cases the short exclusion phrase is a
    // list ("not a coat or parka"), so retain every recognised term.
    if (
      candidates.length >= 2 &&
      (COLOR_TERMS.has(candidates[0]) && GARMENT_TERMS.has(candidates[1]) ||
        GARMENT_TERMS.has(candidates[candidates.length - 1]))
    ) {
      excluded.add(candidates[0]);
    } else {
      for (const candidate of candidates) excluded.add(candidate);
    }
  }

  return [...excluded];
}

export function interpretQuery(rawQuery: string): QueryInterpretation {
  let text = normalizeText(rawQuery).replace(/\s+/g, " ").trim();

  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  for (const pattern of PRICE_RANGE_PATTERNS) {
    const rangeMatch = text.match(pattern);
    if (!rangeMatch) continue;

    const first = Number(rangeMatch[1].replace(",", "."));
    const second = Number(rangeMatch[2].replace(",", "."));
    if (Number.isFinite(first) && Number.isFinite(second)) {
      minPrice = Math.min(first, second);
      maxPrice = Math.max(first, second);
      text = text.replace(pattern, " ").replace(/\s+/g, " ").trim();
    }
    break;
  }

  if (maxPrice === undefined) {
    const priceMatch = text.match(PRICE_PATTERN);
    maxPrice = priceMatch ? Number(priceMatch[1].replace(",", ".")) : undefined;
    if (priceMatch) text = text.replace(PRICE_PATTERN, " ").replace(/\s+/g, " ").trim();
  }

  for (const [pattern, replacement] of PHRASES) text = text.replace(pattern, replacement);

  const excludedTerms = extractExcludedTerms(text);

  const terms: string[] = [];
  const unknownTerms: string[] = [];
  for (const token of tokenize(text)) {
    const canonical = canonicalize(token);
    if (canonical) {
      if (excludedTerms.includes(canonical)) continue;
      if (!terms.includes(canonical)) terms.push(canonical);
    } else if (!unknownTerms.includes(token)) {
      unknownTerms.push(token);
    }
  }

  const scoredTerms = terms.filter((term) => !RANKING_ONLY_TERMS.has(term));
  const requiresInStock = terms.includes("available");

  return {
    text,
    terms: scoredTerms,
    excludedTerms,
    unknownTerms,
    minPrice,
    maxPrice,
    pricePreference: terms.includes("cheap") ? "low" : terms.includes("premium") ? "high" : undefined,
    wantsSale: terms.includes("sale"),
    requiresInStock,
    constraints: {
      garmentTypes: scoredTerms.filter((term) => GARMENT_TERMS.has(term)),
      colors: scoredTerms.filter((term) => COLOR_TERMS.has(term)),
      directAttributes: scoredTerms.filter((term) => DIRECT_ATTRIBUTE_TERMS.has(term)),
      departments: scoredTerms.filter((term) => DEPARTMENT_TERMS.has(term)),
      excludedTerms,
      minPrice,
      maxPrice,
      availability: requiresInStock ? "in_stock" : undefined,
    },
  };
}

/**
 * One concept the shopper asked for, plus every catalog term that would answer
 * it and how well.
 */
export type QueryConcept = {
  /** The word actually typed, canonicalised. */
  term: string;
  /** Terms that satisfy it → how completely, including `term` itself at 1. */
  satisfiedBy: Map<string, number>;
};

/**
 * Expand each recognised term across the association graph, keeping the
 * expansions grouped by the term they came from.
 *
 * Grouping matters more than it looks. A flat term→weight map forces every
 * expansion into the scoring denominator, so a wide concept punishes itself:
 * "gym" reaches eight garments, and a product that is exactly one of them
 * scores one eighth. Keeping the groups lets each concept be satisfied by its
 * best answer, which is what the shopper meant — they asked for one thing
 * ("gym clothes"), not eight things at once.
 *
 * Two hops is enough to get from "cold" to "parka" (cold → winter → parka)
 * without letting a query bleed across the whole catalog.
 */
function buildQueryConcepts(terms: string[]): QueryConcept[] {
  return terms.map((term) => {
    const satisfiedBy = new Map<string, number>([[term, 1]]);
    const raise = (candidate: string, weight: number) => {
      if (weight < EXPANSION_FLOOR) return;
      const existing = satisfiedBy.get(candidate) ?? 0;
      if (weight > existing) satisfiedBy.set(candidate, weight);
    };

    for (const [firstHop, firstWeight] of ASSOCIATIONS[term] ?? []) {
      raise(firstHop, firstWeight);

      // Naming a kind of thing ends the walk. "Office" reaching "trousers" is
      // the point of the graph; carrying on from trousers to its siblings made
      // jeans a good answer to "smart trousers for the office". A garment is
      // where a concept lands, not somewhere it passes through.
      if (GARMENT_TERMS.has(firstHop)) continue;

      for (const [secondHop, secondWeight] of ASSOCIATIONS[firstHop] ?? []) {
        raise(secondHop, firstWeight * secondWeight * SECOND_HOP_DECAY);
      }
    }

    return { term, satisfiedBy };
  });
}

/** The product's own vocabulary, canonicalised, with per-field confidence. */
export function buildProductTerms(product: SearchableProduct): Map<string, number> {
  const terms = new Map<string, number>();
  const add = (value: string, weight: number) => {
    for (const token of tokenize(normalizeText(value))) {
      const canonical = canonicalize(token, false) ?? token;
      const existing = terms.get(canonical) ?? 0;
      if (weight > existing) terms.set(canonical, weight);
    }
  };

  add(product.subcategory, FIELD_WEIGHTS.subcategory);
  add(product.title, FIELD_WEIGHTS.title);
  add(product.color, FIELD_WEIGHTS.color);
  add(product.category, FIELD_WEIGHTS.category);
  add(product.gender, FIELD_WEIGHTS.gender);
  add(product.brand, FIELD_WEIGHTS.brand);
  for (const tag of product.style_tags.split("|")) add(tag, FIELD_WEIGHTS.styleTag);
  if (product.old_price_eur) add("sale", FIELD_WEIGHTS.sale);

  // Visual attributes describe *qualities*, never identity. A shirt dress has
  // a "self_tie_belt" and a cargo skirt has "belt_loops" — if those fed the
  // garment vocabulary, a search for "black belt" would return dresses and
  // skirts. Identity stays the job of subcategory, category and title.
  addQualitiesOnly(terms, product.motif, FIELD_WEIGHTS.motif);
  addQualitiesOnly(terms, product.surface, FIELD_WEIGHTS.surface);
  addQualitiesOnly(terms, product.visual_details, FIELD_WEIGHTS.visualDetail);
  addQualitiesOnly(terms, product.visual_description, FIELD_WEIGHTS.visualDescription);

  const details = normalizeText([product.visual_details, product.visual_description].filter(Boolean).join(" "));
  // These attributes are encoded compositionally in the source table. Preserve
  // their meaningful compound/absence semantics instead of making a query for
  // "no belt loops" look like a request to remove every belt from the result.
  if (/\bcargo\b/.test(details) && /\bpocket/.test(details)) terms.set("cargopocket", FIELD_WEIGHTS.visualDetail);
  if (/\bbelt loops none\b/.test(details)) terms.set("nobeltloops", FIELD_WEIGHTS.visualDetail);
  if (product.subcategory === "hoodie" && !terms.has("zip")) terms.set("pullover", FIELD_WEIGHTS.visualDetail);
  // A shoulder-bag silhouette is a valid cross-body alternative, but `shoulder`
  // alone is also used for garment construction; derive this only from the
  // product identity rather than treating every shoulder mention as a bag type.
  if (/\bshoulder bag\b/.test(normalizeText(product.title))) terms.set("crossbody", FIELD_WEIGHTS.visualDetail);

  return terms;
}

function addQualitiesOnly(terms: Map<string, number>, value: string | undefined, weight: number) {
  if (!value) return;

  for (const token of tokenize(normalizeText(value))) {
    const canonical = canonicalize(token, false) ?? token;
    if (GARMENT_TERMS.has(canonical)) continue;
    const existing = terms.get(canonical) ?? 0;
    if (weight > existing) terms.set(canonical, weight);
  }
}

/**
 * Relevance of one product to one interpreted query, in [0, 1].
 *
 * The denominator is the query's own weight, so a product that answers every
 * concept scores near 1 regardless of how many words were typed — otherwise
 * long queries would be systematically penalised and never clear the floor.
 */
/**
 * The garments that would satisfy the subject of the query, or `null` when the
 * shopper named no subject and every category is fair game.
 */
export function resolveGarmentTargets(concepts: QueryConcept[]): Set<string> | null {
  if (!concepts.some((concept) => GARMENT_TERMS.has(concept.term))) return null;

  const targets = new Set<string>();
  for (const concept of concepts) {
    if (!GARMENT_TERMS.has(concept.term)) continue;
    for (const [term, weight] of concept.satisfiedBy) {
      if (weight >= GARMENT_TARGET_FLOOR && GARMENT_TERMS.has(term)) targets.add(term);
    }
  }
  return targets.size > 0 ? targets : null;
}

/**
 * The concrete colours the shopper named directly, or `null` when they named
 * none (every colour is then fair game). Unlike garments, colours are matched by
 * the exact term, not by expansion — "green" means green, and a product's colour
 * is already canonicalised (olive → green, navy → blue) when its terms are built.
 */
export function resolveColorTargets(concepts: QueryConcept[]): Set<string> | null {
  const targets = new Set<string>();
  for (const concept of concepts) {
    if (COLOR_TERMS.has(concept.term)) targets.add(concept.term);
  }
  return targets.size > 0 ? targets : null;
}

export function scoreProduct(
  productTerms: Map<string, number>,
  concepts: QueryConcept[],
  interpretation: QueryInterpretation,
  product: SearchableProduct,
  garmentTargets: Set<string> | null,
  colorTargets: Set<string> | null = null,
  options: ScoreOptions = {},
): ProductScore {
  let matched = 0;
  let total = 0;
  let answered = 0;
  const matchedTerms: string[] = [];
  const price = Number(product.price_eur);
  const enforceDirectAttributes = options.enforceDirectAttributes ?? true;

  if (
    (interpretation.minPrice !== undefined && (!Number.isFinite(price) || price < interpretation.minPrice)) ||
    (interpretation.maxPrice !== undefined && (!Number.isFinite(price) || price > interpretation.maxPrice))
  ) {
    return { score: 0, matchedTerms };
  }

  if (interpretation.requiresInStock && product.availability !== "in_stock") {
    return { score: 0, matchedTerms };
  }

  // Negative constraints are direct catalog attributes. Do not apply semantic
  // expansion here: a request "not a coat" should reject coats, not sweaters
  // merely because winter is related to both.
  if (interpretation.excludedTerms.some((term) => productTerms.has(term))) {
    return { score: 0, matchedTerms };
  }

  for (const concept of concepts) {
    const isDepartment = DEPARTMENT_TERMS.has(concept.term);
    const isEnforcedAttribute = enforceDirectAttributes && DIRECT_ATTRIBUTE_TERMS.has(concept.term);
    if (!isDepartment && !isEnforcedAttribute) continue;
    if (!productTerms.has(concept.term)) return { score: 0, matchedTerms };
  }

  // Each concept contributes its single best answer. Listing "parka" and "coat"
  // both is not twice as good as listing one of them — the shopper asked once.
  for (const concept of concepts) {
    total += 1;
    let best = 0;
    for (const [term, satisfaction] of concept.satisfiedBy) {
      const productWeight = productTerms.get(term);
      if (productWeight === undefined) continue;
      const value = satisfaction * productWeight;
      if (value > best) best = value;
    }
    if (best > 0) {
      matched += best;
      answered += 1;
      matchedTerms.push(concept.term);
    }
  }

  // An unrecognised token is still a literal request — a brand name, a word the
  // lexicon has not learned yet. Match it against the raw row so typing
  // "Echo Row" or an exact title keeps working.
  if (interpretation.unknownTerms.length > 0) {
    const haystack = normalizeText(
      [product.title, product.brand, product.subcategory, product.style_tags].join(" "),
    );
    for (const token of interpretation.unknownTerms) {
      total += 1;
      if (productTerms.has(token) || haystack.includes(token)) {
        matched += 1;
        matchedTerms.push(token);
      }
    }
  }

  // A bare "cheap" or "premium" carries no concept to match, only a direction
  // to sort in — so everything starts level and the price signal does the work.
  if (total === 0) {
    if (!interpretation.pricePreference) return { score: 0, matchedTerms };
    matched = 0.5;
    total = 1;
  }

  let score = matched / total;

  // Ignoring a word outright costs more than answering it badly.
  //
  // A plain average treats "waterproof jacket" as half-answered by a wool coat
  // — it nails "jacket" and scores 0.6, which used to clear the cut and put
  // wool coats in a waterproof search. Weighting by how many of the shopper's
  // concepts got *any* answer separates "partly right" from "right about one
  // half and silent on the other".
  const coverage = total === 0 ? 1 : answered / total;
  score *= COVERAGE_FLOOR + (1 - COVERAGE_FLOOR) * coverage;

  if (interpretation.wantsSale && product.old_price_eur) score += 0.08;
  if (interpretation.pricePreference) {
    if (Number.isFinite(price)) {
      const normalized = Math.min(price, 200) / 200;
      score += (interpretation.pricePreference === "low" ? 1 - normalized : normalized) * 0.18;
    }
  }

  if (
    EXCLUDE_OFF_SUBJECT &&
    garmentTargets &&
    ![...garmentTargets].some((term) => productTerms.has(term))
  ) {
    return { score: 0, matchedTerms };
  }

  // Naming a colour is a hard filter: a product whose colour is none of the ones
  // the shopper named is a wrong answer, not a low-ranked one. This is what makes
  // an unstocked colour ("yellow dress") return the honest empty result instead
  // of four differently-coloured dresses.
  if (
    EXCLUDE_OFF_COLOR &&
    colorTargets &&
    ![...colorTargets].some((term) => productTerms.has(term))
  ) {
    return { score: 0, matchedTerms };
  }

  return { score: Math.min(score, 1), matchedTerms };
}

export type SemanticMatch<T extends SearchableProduct> = {
  product: T;
  score: number;
  matchedTerms: string[];
};

export type SemanticSearchResult<T extends SearchableProduct> = {
  /** Products satisfying every hard constraint. Evaluation and public metrics use only this list. */
  matches: SemanticMatch<T>[];
  /** Near-misses produced only when exact matching is empty; never counted as exact passes. */
  alternatives: SemanticMatch<T>[];
  /** Explicit attributes softened to create `alternatives`. Subject, colour, price and availability are never softened. */
  relaxedConstraints: string[];
  interpretation: QueryInterpretation;
};

function rankProducts<T extends SearchableProduct>(
  products: T[],
  concepts: QueryConcept[],
  interpretation: QueryInterpretation,
  garmentTargets: Set<string> | null,
  colorTargets: Set<string> | null,
  options: ScoreOptions = {},
): SemanticMatch<T>[] {
  const scored = products
    .map((product) => {
      const { score, matchedTerms } = scoreProduct(
        buildProductTerms(product),
        concepts,
        interpretation,
        product,
        garmentTargets,
        colorTargets,
        options,
      );
      return { product, score, matchedTerms };
    })
    .filter((entry) => entry.score >= RELEVANCE_FLOOR);

  if (scored.length === 0) return [];

  const best = Math.max(...scored.map((entry) => entry.score));
  const cut = Math.max(RELEVANCE_FLOOR, best * RELEVANCE_RATIO);

  return scored
    .filter((entry) => entry.score >= cut)
    .sort((first, second) =>
      second.score - first.score ||
      first.product.mock_product_id.localeCompare(second.product.mock_product_id),
    );
}

/**
 * Rank a catalog against a free-text query. Returns only products that clear
 * both the absolute floor and the relative cut, best first.
 */
export function semanticSearch<T extends SearchableProduct>(
  products: T[],
  rawQuery: string,
): SemanticSearchResult<T> {
  const interpretation = interpretQuery(rawQuery);

  if (
    interpretation.terms.length === 0 &&
    interpretation.unknownTerms.length === 0 &&
    !interpretation.pricePreference &&
    interpretation.excludedTerms.length === 0 &&
    !interpretation.requiresInStock
  ) {
    const matches = products
      .filter((product) => {
        const price = Number(product.price_eur);
        if (interpretation.minPrice !== undefined && price < interpretation.minPrice) return false;
        if (interpretation.maxPrice !== undefined && price > interpretation.maxPrice) return false;
        return true;
      })
      .map((product) => ({ product, score: 0, matchedTerms: [] }));
    return {
      matches,
      alternatives: [],
      relaxedConstraints: [],
      interpretation,
    };
  }

  const concepts = buildQueryConcepts(interpretation.terms);
  const garmentTargets = resolveGarmentTargets(concepts);
  const colorTargets = resolveColorTargets(concepts);
  const matches = rankProducts(
    products,
    concepts,
    interpretation,
    garmentTargets,
    colorTargets,
  );
  if (matches.length > 0) {
    return { matches, alternatives: [], relaxedConstraints: [], interpretation };
  }

  const relaxedConstraints = interpretation.constraints.directAttributes;
  if (relaxedConstraints.length === 0) {
    return { matches: [], alternatives: [], relaxedConstraints: [], interpretation };
  }

  const alternatives = rankProducts(
    products,
    concepts,
    interpretation,
    garmentTargets,
    colorTargets,
    { enforceDirectAttributes: false },
  );

  return {
    matches: [],
    alternatives,
    relaxedConstraints: alternatives.length > 0 ? relaxedConstraints : [],
    interpretation,
  };
}
