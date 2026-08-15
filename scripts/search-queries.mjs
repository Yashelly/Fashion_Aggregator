/**
 * Labelled query sets for `scripts/semantic-eval.mjs`.
 *
 * THREE SETS, AND THE SPLIT IS THE POINT. Each has a different job and a
 * different level of trust — conflating them is how a search suite lies to you.
 *
 *   DEV_SET (44)        Tuning is allowed against these. Their score is a fit
 *                       ceiling, not a generalization estimate — the graph has
 *                       been shaped to answer them, so a high number here only
 *                       proves the graph can express the answers, not find new
 *                       ones. Without a dev set the engine could not be tuned at
 *                       all; treating its score as "how good is search" is the
 *                       classic train-on-the-test-set mistake.
 *
 *   REGRESSION_SET (30) Was the held-out set. Written before tuning and scored
 *                       blind ONCE (24/30). Its failures were then inspected and
 *                       two real defects fixed, which took it to 26/30. Because
 *                       it has now been looked at, 26/30 is NO LONGER an unbiased
 *                       generalization estimate — it is a regression benchmark:
 *                       a number that must not drop when an edge is retuned. See
 *                       the note above the set for the full history. Presenting
 *                       it as "sealed / unseen" today would be false; it isn't.
 *
 *   BLIND_SET (18)      Written 2026-08-15 against the catalog, sealed, and
 *                       scored exactly ONCE. The engine was NOT changed and no
 *                       label was edited in response to its results — that is the
 *                       whole point of the split, and the moment it is tuned
 *                       against it stops being blind and becomes a second
 *                       regression set. This is the current best generalization
 *                       signal in the repo. It is still one author's labels (see
 *                       below), so it is a floor on honesty, not a ceiling on it.
 *
 * WHAT THESE LABELS ARE WORTH. They are one person's relevance judgements,
 * written by the same author as the engine. That is a real ceiling: two humans
 * routinely disagree about whether a shirt dress answers "office", so no score
 * here can be more trustworthy than the labels underneath it. A set labelled by
 * the product owner — or better, real click data — is what replaces this.
 *
 * If a DEV_SET label looks wrong, argue with the label first. Three have already
 * been corrected this way: trail sneakers are not a "waterproof jacket", "kelnės"
 * includes jeans, and "cosy knit" means the two knitted pieces rather than
 * every soft thing in the catalog. This licence applies to DEV_SET only —
 * editing a REGRESSION_SET or BLIND_SET label to make a query pass is exactly
 * the dishonesty the split exists to prevent.
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
 * REGRESSION_SET — formerly the held-out set (renamed 2026-08-15 so the name
 * stops implying it is still unseen; it is not).
 *
 * CONSUMED as of 2026-08-01. Written before tuning and scored blind once:
 * 24/30, precision 0.903, recall 0.967, against 0.941 on dev — a ~4-point
 * generalisation gap, which is the honest cost of fitting.
 *
 * Two bugs it exposed were then fixed (the word "tracksuit" was missing from
 * the lexicon entirely, and `jewelry -> accessories` let every belt and sock
 * answer "earrings"), taking it to 26/30 / 0.926. That second number is no
 * longer a generalisation estimate — the set has been looked at. Its job now is
 * to be a regression tripwire: it must never drop below 26/30 without a reason.
 *
 * A further honest measurement needs a NEW set, sealed and ideally labelled by
 * someone who did not write the engine. `BLIND_SET` below is the first step
 * toward that — sealed and scored once, though still one author's labels.
 */
export const REGRESSION_SET = [
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

/**
 * BLIND_SET — sealed 2026-08-15, scored ONCE.
 *
 * Written by reading the 64-row catalog, not by watching the engine's output.
 * The rule that makes the number mean anything: neither the engine nor a single
 * label in this array may be changed in response to how it scores. If a query
 * fails, that failure is the measurement — it is reported, not tuned away. The
 * first time a weight is nudged to lift this score, the set is burned and moves
 * to REGRESSION_SET, exactly as the held-out set did.
 *
 * Deliberately concrete (garment + colour/material, a few Lithuanian forms, two
 * honest negatives): the DEV and REGRESSION sets already stress fuzzy intent
 * heavily, so this set measures whether the plumbing generalizes to unseen but
 * ordinary shopper phrasings rather than re-testing the graph's cleverest edges.
 */
export const BLIND_SET = [
  // ---- garment + colour / material ----
  { query: "brown jacket", maxResults: 4, intent: "colour + garment", relevant: ["MOCK-011"], mustRank: ["MOCK-011"] },
  { query: "navy blazer", maxResults: 4, intent: "colour + garment", relevant: ["MOCK-007"], mustRank: ["MOCK-007"] },
  { query: "wide leg trousers", maxResults: 6, intent: "cut + garment", relevant: ["MOCK-002", "MOCK-049", "MOCK-063"] },
  { query: "cotton shirt", maxResults: 4, intent: "material + garment", relevant: ["MOCK-001"], mustRank: ["MOCK-001"] },
  { query: "training shorts", maxResults: 3, intent: "activity + garment", relevant: ["MOCK-038"], mustRank: ["MOCK-038"] },
  { query: "grey hoodie", maxResults: 4, intent: "colour + garment", relevant: ["MOCK-008"], mustRank: ["MOCK-008"] },
  { query: "orange tee", maxResults: 3, intent: "colour + garment", relevant: ["MOCK-039"], mustRank: ["MOCK-039"] },
  { query: "merino sweater", maxResults: 4, intent: "material + garment", relevant: ["MOCK-048"], mustRank: ["MOCK-048"] },
  { query: "graphic hoodie", maxResults: 4, intent: "print + garment", relevant: ["MOCK-057"], mustRank: ["MOCK-057"] },
  { query: "black crossbody bag", maxResults: 4, intent: "colour + garment", relevant: ["MOCK-016", "MOCK-064"] },
  { query: "chelsea boots", maxResults: 4, intent: "style + garment", relevant: ["MOCK-050"], mustRank: ["MOCK-050"] },
  { query: "socks", maxResults: 3, intent: "garment", relevant: ["MOCK-031"], mustRank: ["MOCK-031"] },
  { query: "waist bag", maxResults: 3, intent: "garment", relevant: ["MOCK-040"], mustRank: ["MOCK-040"] },

  // ---- honest negatives: the catalog does not stock these ----
  { query: "beige coat", maxResults: 3, intent: "negative / not stocked", relevant: [] },
  { query: "yellow dress", maxResults: 3, intent: "negative / not stocked", relevant: [] },

  // ---- Lithuanian surface forms ----
  { query: "ruda striukė", maxResults: 4, intent: "colour + garment / lt", relevant: ["MOCK-011"], mustRank: ["MOCK-011"] },
  { query: "megztinis", maxResults: 4, intent: "garment / lt", relevant: ["MOCK-048"], mustRank: ["MOCK-048"] },
  { query: "juodas diržas", maxResults: 4, intent: "colour + garment / lt", relevant: ["MOCK-009", "MOCK-055"] },
];
