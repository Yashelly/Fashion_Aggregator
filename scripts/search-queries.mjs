/**
 * Labelled query sets for `scripts/semantic-eval.mjs`.
 *
 * TWO SETS, AND THE SPLIT IS THE POINT.
 *
 * `DEV_SET` is what the concept graph may be tuned against. `HELDOUT_SET` is
 * not looked at while tuning — it is written first, sealed, and scored once at
 * the end. Without that discipline the number measures how well the graph was
 * fitted to the questions rather than how well it answers new ones, which is
 * exactly how this suite came to report a clean 25/25 while the site returned
 * 38 of 64 products for "what should i wear to the office".
 *
 * WHAT THESE LABELS ARE WORTH. They are one person's relevance judgements,
 * written by the same author as the engine. That is a real ceiling: two humans
 * routinely disagree about whether a shirt dress answers "office", so no score
 * here can be more trustworthy than the labels underneath it. A set labelled by
 * the product owner — or better, real click data — is what replaces this.
 *
 * If a label looks wrong, argue with the label first. Three have already been
 * corrected this way: trail sneakers are not a "waterproof jacket", "kelnės"
 * includes jeans, and "cosy knit" means the two knitted pieces rather than
 * every soft thing in the catalog.
 *
 * Fields:
 *   relevant    every product a shopper would accept. Empty means the honest
 *               answer is "we don't stock that".
 *   mustRank    products that have to reach the top; ordering is the product
 *               for broad queries.
 *   maxResults  cap on the whole result set. precision@k only inspects the
 *               head and is blind to a bloated tail.
 */

export const DEV_SET = [
  // ---- season and weather ----
  {
    query: "something warm for winter",
    intent: "season",
    relevant: ["MOCK-013", "MOCK-044", "MOCK-054", "MOCK-048", "MOCK-006", "MOCK-019", "MOCK-056", "MOCK-011", "MOCK-032", "MOCK-007"],
  },
  {
    query: "šilta striukė žiemai",
    intent: "season / lt",
    relevant: ["MOCK-013", "MOCK-044", "MOCK-054", "MOCK-011", "MOCK-019", "MOCK-003", "MOCK-034", "MOCK-042", "MOCK-007", "MOCK-052"],
  },
  {
    // The subject is "shoes". An earlier draft also listed the technical parka,
    // which answers "rain" but is not what was asked for.
    query: "shoes for hiking in the rain",
    maxResults: 6,
    intent: "weather / activity",
    relevant: ["MOCK-041", "MOCK-050", "MOCK-043"],
    mustRank: ["MOCK-041"],
  },
  {
    // Trail sneakers were on this label once. They are waterproof but they are
    // not a jacket — the label was wrong, not the exclusion.
    query: "waterproof jacket",
    maxResults: 8,
    intent: "material",
    relevant: ["MOCK-054", "MOCK-034", "MOCK-042"],
  },
  {
    query: "boots for winter",
    maxResults: 5,
    intent: "season + garment",
    relevant: ["MOCK-050", "MOCK-043"],
  },

  // ---- occasion ----
  {
    query: "what should i wear to the office",
    maxResults: 20,
    intent: "occasion",
    relevant: ["MOCK-007", "MOCK-052", "MOCK-002", "MOCK-049", "MOCK-063", "MOCK-001", "MOCK-055", "MOCK-013", "MOCK-044", "MOCK-009"],
  },
  {
    query: "outfit for a night out",
    maxResults: 12,
    intent: "occasion",
    relevant: ["MOCK-045", "MOCK-053", "MOCK-023", "MOCK-010", "MOCK-051", "MOCK-043", "MOCK-025"],
  },
  {
    query: "dress for a summer date",
    maxResults: 6,
    intent: "occasion",
    relevant: ["MOCK-023", "MOCK-045", "MOCK-061", "MOCK-053"],
  },
  {
    query: "smart trousers for the office",
    maxResults: 6,
    intent: "occasion + garment",
    relevant: ["MOCK-002", "MOCK-049", "MOCK-063"],
    mustRank: ["MOCK-002", "MOCK-049", "MOCK-063"],
  },
  {
    query: "shoes for the office",
    maxResults: 6,
    intent: "occasion + garment",
    relevant: ["MOCK-050", "MOCK-046", "MOCK-062"],
  },

  // ---- activity and mood ----
  {
    query: "clothes for the gym",
    intent: "activity",
    relevant: ["MOCK-021", "MOCK-038", "MOCK-026", "MOCK-035", "MOCK-034", "MOCK-004"],
  },
  {
    // "knit" names the subject and the catalog holds exactly two knitted
    // pieces. An earlier draft also listed hoodies, which is what "cosy" alone
    // would justify — not "knit".
    query: "cosy knit for the sofa",
    maxResults: 4,
    intent: "mood + garment",
    relevant: ["MOCK-006", "MOCK-048"],
    mustRank: ["MOCK-006", "MOCK-048"],
  },
  {
    // The same mood with no garment named, which should stay open.
    query: "something cosy to wear at home",
    intent: "mood",
    relevant: ["MOCK-006", "MOCK-048", "MOCK-008", "MOCK-057", "MOCK-032", "MOCK-026", "MOCK-056", "MOCK-015"],
  },
  {
    query: "streetwear hoodie",
    maxResults: 6,
    intent: "style + garment",
    relevant: ["MOCK-057", "MOCK-008", "MOCK-032", "MOCK-015"],
    mustRank: ["MOCK-057", "MOCK-008", "MOCK-032"],
  },
  {
    query: "minimal neutral basics",
    intent: "aesthetic",
    relevant: ["MOCK-012", "MOCK-001", "MOCK-004", "MOCK-046", "MOCK-024", "MOCK-018", "MOCK-006", "MOCK-048"],
  },

  // ---- colour and garment ----
  {
    query: "black boots",
    maxResults: 4,
    intent: "colour + garment",
    relevant: ["MOCK-043"],
    mustRank: ["MOCK-043"],
  },
  {
    query: "white sneakers",
    maxResults: 8,
    intent: "colour + garment",
    relevant: ["MOCK-029", "MOCK-046", "MOCK-062", "MOCK-037"],
    mustRank: ["MOCK-029", "MOCK-046", "MOCK-062"],
  },
  {
    query: "purple jacket",
    maxResults: 4,
    intent: "colour + garment",
    relevant: ["MOCK-042"],
    mustRank: ["MOCK-042"],
  },
  {
    query: "green overshirt",
    maxResults: 4,
    intent: "colour + garment",
    relevant: ["MOCK-003"],
    mustRank: ["MOCK-003"],
  },

  // ---- material ----
  {
    query: "wool coat",
    maxResults: 5,
    intent: "material + garment",
    relevant: ["MOCK-044", "MOCK-013"],
    mustRank: ["MOCK-044", "MOCK-013"],
  },
  {
    query: "suede jacket",
    maxResults: 4,
    intent: "material + garment",
    relevant: ["MOCK-011"],
    mustRank: ["MOCK-011"],
  },
  {
    query: "canvas tote",
    maxResults: 4,
    intent: "material + garment",
    relevant: ["MOCK-024"],
    mustRank: ["MOCK-024"],
  },
  {
    query: "warm sweater",
    maxResults: 5,
    intent: "material + garment",
    relevant: ["MOCK-048", "MOCK-006"],
    mustRank: ["MOCK-048"],
  },

  // ---- motif and construction: only the photo descriptions can answer these ----
  {
    query: "hoodie with circles",
    maxResults: 3,
    intent: "motif detail + garment",
    relevant: ["MOCK-057"],
    mustRank: ["MOCK-057"],
  },
  {
    query: "tee with triangles",
    maxResults: 3,
    intent: "motif detail + garment",
    relevant: ["MOCK-039"],
    mustRank: ["MOCK-039"],
  },
  {
    query: "bauhaus print",
    maxResults: 4,
    intent: "motif style",
    relevant: ["MOCK-022", "MOCK-039", "MOCK-057"],
    mustRank: ["MOCK-022", "MOCK-039", "MOCK-057"],
  },
  {
    query: "scarf with fringe",
    maxResults: 3,
    intent: "construction detail + garment",
    relevant: ["MOCK-056"],
    mustRank: ["MOCK-056"],
  },
  {
    query: "cowl neck dress",
    maxResults: 4,
    intent: "construction detail + garment",
    relevant: ["MOCK-045", "MOCK-053"],
    mustRank: ["MOCK-045", "MOCK-053"],
  },
  {
    query: "cargo trousers",
    maxResults: 5,
    intent: "construction + garment",
    relevant: ["MOCK-035", "MOCK-058"],
    mustRank: ["MOCK-035", "MOCK-058"],
  },
  {
    query: "cropped top",
    maxResults: 5,
    intent: "cut + garment",
    relevant: ["MOCK-015", "MOCK-059"],
  },

  // ---- price and commerce ----
  {
    query: "bag for travelling",
    intent: "occasion + garment",
    relevant: ["MOCK-060", "MOCK-024", "MOCK-027", "MOCK-064", "MOCK-047", "MOCK-016", "MOCK-040"],
  },
  {
    query: "bag for my laptop",
    maxResults: 6,
    intent: "use case",
    relevant: ["MOCK-024", "MOCK-047", "MOCK-060"],
  },
  {
    query: "jeans under 40",
    maxResults: 4,
    intent: "price ceiling",
    relevant: ["MOCK-017"],
    mustRank: ["MOCK-017"],
  },
  {
    // "kelnės" covers all legwear, jeans included — an earlier draft excluded
    // them, which no Lithuanian shopper would.
    query: "kelnės iki 45",
    intent: "price ceiling / lt",
    relevant: ["MOCK-002", "MOCK-005", "MOCK-017", "MOCK-021", "MOCK-026", "MOCK-035", "MOCK-058"],
  },
  {
    query: "cheap accessories",
    intent: "price direction",
    relevant: ["MOCK-020", "MOCK-031", "MOCK-036", "MOCK-009", "MOCK-055", "MOCK-051", "MOCK-040", "MOCK-056"],
  },
  {
    query: "what is on sale",
    intent: "commercial",
    relevant: ["MOCK-002", "MOCK-005", "MOCK-007", "MOCK-010", "MOCK-013", "MOCK-015", "MOCK-017", "MOCK-019", "MOCK-023", "MOCK-026", "MOCK-029", "MOCK-032", "MOCK-034", "MOCK-037", "MOCK-040", "MOCK-042", "MOCK-043", "MOCK-044", "MOCK-047", "MOCK-049", "MOCK-052", "MOCK-054", "MOCK-056", "MOCK-057", "MOCK-060", "MOCK-061", "MOCK-063"],
  },

  // ---- exact recall, typos, department ----
  {
    query: "graphic tee",
    maxResults: 6,
    intent: "print + garment",
    relevant: ["MOCK-022", "MOCK-039"],
    mustRank: ["MOCK-022", "MOCK-039"],
  },
  {
    query: "moteriškas sijonas",
    maxResults: 6,
    intent: "department + garment / lt",
    relevant: ["MOCK-010", "MOCK-014", "MOCK-025", "MOCK-028"],
    mustRank: ["MOCK-010", "MOCK-014", "MOCK-025", "MOCK-028"],
  },
  {
    query: "sportbačiai",
    intent: "garment / lt",
    relevant: ["MOCK-029", "MOCK-030", "MOCK-033", "MOCK-037", "MOCK-041", "MOCK-046", "MOCK-062"],
  },
  {
    query: "Emerald Satin Midi Dress",
    maxResults: 6,
    intent: "exact title recall",
    relevant: ["MOCK-045"],
    mustRank: ["MOCK-045"],
  },
  {
    query: "snekaers",
    maxResults: 10,
    intent: "typo tolerance",
    relevant: ["MOCK-029", "MOCK-030", "MOCK-033", "MOCK-037", "MOCK-041", "MOCK-046", "MOCK-062"],
  },
  {
    query: "sportinės kelnės",
    maxResults: 8,
    intent: "garment / lt",
    relevant: ["MOCK-026", "MOCK-035"],
  },

  // ---- honest negatives: the catalog does not stock these ----
  {
    // No denim outerwear exists. Returning "some jackets" would be a near-miss
    // dressed up as an answer.
    query: "denim jacket",
    maxResults: 3,
    intent: "negative / not stocked",
    relevant: [],
  },
  {
    // No striped anything in these 64 products.
    query: "striped sweater",
    maxResults: 3,
    intent: "negative / not stocked",
    relevant: [],
  },
];

/**
 * CONSUMED as of 2026-08-01. Written before tuning and scored blind once:
 * 24/30, precision 0.903, recall 0.967, against 0.941 on dev — a ~4-point
 * generalisation gap, which is the honest cost of fitting.
 *
 * Two bugs it exposed were then fixed (the word "tracksuit" was missing from
 * the lexicon entirely, and `jewelry -> accessories` let every belt and sock
 * answer "earrings"), taking it to 26/30 / 0.926. That second number is no
 * longer a generalisation estimate — the set has been looked at.
 *
 * A further honest measurement needs a NEW set, sealed and ideally labelled by
 * someone who did not write the engine.
 */
export const HELDOUT_SET = [
  { query: "warm coat for men", maxResults: 5, intent: "season + department", relevant: ["MOCK-044", "MOCK-013"] },
  { query: "linen dress for summer", maxResults: 4, intent: "material + occasion", relevant: ["MOCK-061"], mustRank: ["MOCK-061"] },
  { query: "velvet dress", maxResults: 3, intent: "material + garment", relevant: ["MOCK-053"], mustRank: ["MOCK-053"] },
  { query: "satin skirt", maxResults: 5, intent: "material + garment", relevant: ["MOCK-010"], mustRank: ["MOCK-010"] },
  { query: "leather belt", maxResults: 4, intent: "material + garment", relevant: ["MOCK-009", "MOCK-055"], mustRank: ["MOCK-009", "MOCK-055"] },
  { query: "baseball cap", maxResults: 3, intent: "garment", relevant: ["MOCK-036"], mustRank: ["MOCK-036"] },
  { query: "crew socks", maxResults: 3, intent: "garment", relevant: ["MOCK-031"], mustRank: ["MOCK-031"] },
  { query: "earrings for a gift", maxResults: 5, intent: "occasion + garment", relevant: ["MOCK-051"], mustRank: ["MOCK-051"] },
  { query: "warm scarf", maxResults: 4, intent: "season + garment", relevant: ["MOCK-056"], mustRank: ["MOCK-056"] },
  { query: "puffer vest", maxResults: 3, intent: "construction + garment", relevant: ["MOCK-019"], mustRank: ["MOCK-019"] },
  { query: "tracksuit", maxResults: 6, intent: "loose garment concept", relevant: ["MOCK-034", "MOCK-026", "MOCK-035"] },
  { query: "something for a wedding", maxResults: 12, intent: "occasion", relevant: ["MOCK-045", "MOCK-053", "MOCK-052", "MOCK-007", "MOCK-051", "MOCK-010"] },
  { query: "cheap tee", maxResults: 8, intent: "price direction + garment", relevant: ["MOCK-022", "MOCK-012", "MOCK-059", "MOCK-039"] },
  { query: "backpack for school", maxResults: 4, intent: "occasion + garment", relevant: ["MOCK-060"], mustRank: ["MOCK-060"] },
  { query: "mini skirt", maxResults: 5, intent: "cut + garment", relevant: ["MOCK-014", "MOCK-025"], mustRank: ["MOCK-014", "MOCK-025"] },
  { query: "high top sneakers", maxResults: 5, intent: "cut + garment", relevant: ["MOCK-037"], mustRank: ["MOCK-037"] },
  { query: "platform shoes", maxResults: 5, intent: "cut + garment", relevant: ["MOCK-033", "MOCK-029"] },
  { query: "black bag for the office", maxResults: 6, intent: "colour + occasion + garment", relevant: ["MOCK-047", "MOCK-064"] },
  { query: "quilted bag", maxResults: 4, intent: "construction + garment", relevant: ["MOCK-027"], mustRank: ["MOCK-027"] },
  { query: "pleated skirt", maxResults: 4, intent: "construction + garment", relevant: ["MOCK-028"], mustRank: ["MOCK-028"] },
  { query: "floral dress", maxResults: 3, intent: "motif + garment", relevant: ["MOCK-023"], mustRank: ["MOCK-023"] },
  { query: "zip up hoodie", maxResults: 4, intent: "construction + garment", relevant: ["MOCK-032"], mustRank: ["MOCK-032"] },
  { query: "pilkas džemperis", maxResults: 5, intent: "colour + garment / lt", relevant: ["MOCK-008"], mustRank: ["MOCK-008"] },
  { query: "balti sportbačiai", maxResults: 6, intent: "colour + garment / lt", relevant: ["MOCK-029", "MOCK-046", "MOCK-062", "MOCK-037"] },
  { query: "šiltas paltas", maxResults: 5, intent: "season + garment / lt", relevant: ["MOCK-013", "MOCK-044"], mustRank: ["MOCK-013", "MOCK-044"] },
  { query: "vasarinė suknelė", maxResults: 5, intent: "season + garment / lt", relevant: ["MOCK-023", "MOCK-061"] },
  { query: "odiniai batai", maxResults: 5, intent: "material + garment / lt", relevant: ["MOCK-043", "MOCK-050"], mustRank: ["MOCK-043", "MOCK-050"] },
  { query: "kuprinė", maxResults: 3, intent: "garment / lt", relevant: ["MOCK-060"], mustRank: ["MOCK-060"] },
  { query: "dovana moteriai", maxResults: 10, intent: "occasion / lt", relevant: ["MOCK-051", "MOCK-056", "MOCK-020"] },
  { query: "juodos kelnės", maxResults: 6, intent: "colour + garment / lt", relevant: ["MOCK-002", "MOCK-021"] },
];
