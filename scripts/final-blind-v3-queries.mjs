/**
 * Prospective WEFT final blind v3 set.
 *
 * These cases were authored from the frozen demo catalog without running the
 * retrieval or judge stages. Freeze the structural manifest before the one
 * authorised evaluation. After that run this file becomes immutable history.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSearchProducts } from "./search-catalog.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productById = new Map(loadSearchProducts(rootDir).map((product) => [product.mock_product_id, product]));

function fact(id) {
  const product = productById.get(id);
  if (!product) return `${id} (missing catalog record)`;
  return `${id}: ${product.title}; ${product.gender} ${product.category}/${product.subcategory}; ${product.color}; €${product.price_eur}; ${product.availability}; ${product.visual_description}`;
}

function facts(ids) {
  return ids.map(fact).join(" | ");
}

function C(category, difficulty, language, query, intent, relevant, options = {}) {
  const number = CASES.length + 1;
  const id = `FB3-${String(number).padStart(3, "0")}`;
  const expectedOutcome = options.expectedOutcome ?? (relevant.length > 0
    ? `At least one accepted item must rank in the top five. Accepted catalog evidence: ${facts(relevant)}${options.mustRank?.length ? `. Required near the top: ${facts(options.mustRank)}` : ""}${options.forbiddenTop?.length ? `. Must not rank in the forbidden window: ${facts(options.forbiddenTop)}` : ""}.`
    : `Return no result. No catalog item satisfies the complete request.${options.forbiddenTop?.length ? ` Concrete near-misses that must not rank: ${facts(options.forbiddenTop)}.` : ""}`);
  CASES.push({
    id,
    category,
    difficulty,
    language,
    query,
    intent,
    expectedOutcome,
    relevant,
    ...(options.mustRank ? { mustRank: options.mustRank, mustRankTopK: options.mustRankTopK ?? 3 } : {}),
    maxResults: relevant.length > 0 ? (options.maxResults ?? 4) : 0,
    ...(options.exactResults !== undefined ? { exactResults: options.exactResults } : {}),
    ...(options.forbiddenTop ? { forbiddenTop: options.forbiddenTop, forbiddenTopK: options.forbiddenTopK ?? 3 } : {}),
  });
}

const CASES = [];

// garment_identity — 6 easy, 8 medium, 6 adversarial
C("garment_identity", "easy", "en", "roomy structured work tote for papers", "garment identity + use", ["MOCK-047"]);
C("garment_identity", "easy", "en", "soft fringed wrap for the neck", "garment paraphrase", ["MOCK-056"]);
C("garment_identity", "easy", "en", "cropped fitted ribbed tee", "garment + silhouette", ["MOCK-059"]);
C("garment_identity", "easy", "en", "men's fine navy crewneck knit", "department + garment", ["MOCK-048"]);
C("garment_identity", "easy", "en", "little black nylon rucksack", "garment synonym + material", ["MOCK-060"]);
C("garment_identity", "easy", "en", "women's pointed ankle boot with a low heel", "garment + construction", ["MOCK-043"]);
C("garment_identity", "medium", "en", "one-piece shirt outfit with a waist tie", "garment paraphrase + construction", ["MOCK-061"]);
C("garment_identity", "medium", "en", "outer layer cut like workwear shirting", "garment concept", ["MOCK-003"]);
C("garment_identity", "medium", "en", "close-fitting long sleeve in muted green", "garment + fit + colour concept", ["MOCK-018"]);
C("garment_identity", "medium", "en", "hands-free silver carrier worn around the middle", "garment paraphrase + use", ["MOCK-040"]);
C("garment_identity", "medium", "en", "high-rise denim with a mom taper", "garment + silhouette", ["MOCK-017"]);
C("garment_identity", "medium", "en", "sleeveless padded layer with a tall collar", "garment + construction", ["MOCK-019"]);
C("garment_identity", "medium", "en", "polished pull-on footwear with elastic gussets", "garment concept + construction", ["MOCK-050"]);
C("garment_identity", "medium", "en", "short cargo bottom shaped as a skirt", "garment identity + utility", ["MOCK-014"]);
C("garment_identity", "adversarial", "en", "a tote worn on the waist with no handles", "incompatible garment construction", [], { forbiddenTop: ["MOCK-024", "MOCK-040", "MOCK-047"] });
C("garment_identity", "adversarial", "en", "denim leggings made from non-denim wool", "incompatible garment and material", [], { forbiddenTop: ["MOCK-005", "MOCK-017", "MOCK-021", "MOCK-048"] });
C("garment_identity", "adversarial", "en", "a pullover cardigan that fully zips open", "incompatible garment closure", [], { forbiddenTop: ["MOCK-006", "MOCK-032"] });
C("garment_identity", "adversarial", "en", "men's skirted suit trousers", "absent hybrid garment", [], { forbiddenTop: ["MOCK-002", "MOCK-049", "MOCK-052", "MOCK-063"] });
C("garment_identity", "adversarial", "en", "a shoulder bag with neither strap nor handles", "garment + impossible carrying exclusion", [], { forbiddenTop: ["MOCK-016", "MOCK-024", "MOCK-027", "MOCK-064"] });
C("garment_identity", "adversarial", "en", "low-top Chelsea sneakers with ankle-high elastic sides", "incompatible footwear identity", [], { forbiddenTop: ["MOCK-037", "MOCK-046", "MOCK-050", "MOCK-062"] });

// construction_details — 6 easy, 8 medium, 6 adversarial
C("construction_details", "easy", "en", "jacket with five or more utility pockets", "pocket count + garment", ["MOCK-054"]);
C("construction_details", "easy", "en", "dress with a wrap front and tied waist", "closure + garment", ["MOCK-023"]);
C("construction_details", "easy", "en", "lace-up high tops without a thick platform", "footwear construction", ["MOCK-037"], { forbiddenTop: ["MOCK-029", "MOCK-033"] });
C("construction_details", "easy", "en", "wide trousers with pleats and a pressed crease", "trouser construction", ["MOCK-002", "MOCK-049", "MOCK-063"]);
C("construction_details", "easy", "en", "small bag with an adjustable cross-body strap", "bag construction", ["MOCK-027", "MOCK-064"]);
C("construction_details", "easy", "en", "hoodie with a full-length front zip", "closure + garment", ["MOCK-032"]);
C("construction_details", "medium", "en", "coat with a knee-length hem and three-button front", "length + closure", ["MOCK-013", "MOCK-044"]);
C("construction_details", "medium", "en", "bottoms tapering into elasticated ankles with flap storage", "silhouette + pockets", ["MOCK-035"]);
C("construction_details", "medium", "en", "boxy shirt-jacket with two buttoned chest pockets", "shape + construction", ["MOCK-003"]);
C("construction_details", "medium", "en", "minimal shoe with a genuinely low-profile sole", "sole construction", ["MOCK-062"], { forbiddenTop: ["MOCK-029", "MOCK-033"] });
C("construction_details", "medium", "en", "fitted top with a scoop neck and broad shoulder straps", "neckline + straps", ["MOCK-004"]);
C("construction_details", "medium", "en", "structured blazer fastening with a single button", "tailoring + closure", ["MOCK-007"]);
C("construction_details", "medium", "en", "mini carrier with a curved body and short shoulder strap", "bag silhouette + strap", ["MOCK-016"]);
C("construction_details", "medium", "en", "training bottoms cut loose with breathable mesh", "fit + technical construction", ["MOCK-038"]);
C("construction_details", "adversarial", "en", "pointed ankle boots with no heel at all", "absent heel construction", [], { forbiddenTop: ["MOCK-043", "MOCK-050"] });
C("construction_details", "adversarial", "en", "crew-neck sweater with a hood and front pouch", "absent construction combination", [], { forbiddenTop: ["MOCK-008", "MOCK-048"] });
C("construction_details", "adversarial", "en", "open canvas tote without straps or handles", "impossible carrying construction", [], { forbiddenTop: ["MOCK-024"] });
C("construction_details", "adversarial", "en", "full-zip outer layer with neither zipper nor buttons", "self-contradictory closure", [], { forbiddenTop: ["MOCK-011", "MOCK-032", "MOCK-034", "MOCK-042", "MOCK-054"] });
C("construction_details", "adversarial", "en", "sleeveless dress with long balloon sleeves", "self-contradictory sleeve request", [], { forbiddenTop: ["MOCK-015", "MOCK-023", "MOCK-045"] });
C("construction_details", "adversarial", "en", "platform trainer with a paper-thin low sole", "contradictory sole profile", [], { forbiddenTop: ["MOCK-029", "MOCK-033", "MOCK-062"] });

// materials_textures — 6 easy, 8 medium, 6 adversarial
C("materials_textures", "easy", "en", "plush burgundy velvet party dress", "material + colour + occasion", ["MOCK-053"]);
C("materials_textures", "easy", "en", "breathable cream linen-blend dress", "material + garment + colour", ["MOCK-061"]);
C("materials_textures", "easy", "en", "reflective metallic waist pack", "surface + garment", ["MOCK-040"]);
C("materials_textures", "easy", "en", "brushed wool scarf in powder blue", "surface + material + garment", ["MOCK-056"]);
C("materials_textures", "easy", "en", "smooth black faux-leather mini skirt", "material + garment", ["MOCK-025"]);
C("materials_textures", "easy", "en", "heavy cotton twill overshirt", "material + garment", ["MOCK-003"]);
C("materials_textures", "medium", "en", "high-shine fluid green satin below the knee", "surface + colour + length", ["MOCK-045"]);
C("materials_textures", "medium", "en", "napped brown jacket with a suede appearance", "surface paraphrase + garment", ["MOCK-011"]);
C("materials_textures", "medium", "en", "matte weatherproof shell with multiple cargo pockets", "technical surface + construction", ["MOCK-054"]);
C("materials_textures", "medium", "en", "fine-gauge merino layer for men", "material + construction + department", ["MOCK-048"]);
C("materials_textures", "medium", "en", "washed grey denim with utility pockets", "surface + material + construction", ["MOCK-058"]);
C("materials_textures", "medium", "en", "crinkled purple nylon cropped at the waist", "surface + colour + silhouette", ["MOCK-042"]);
C("materials_textures", "medium", "en", "ribbed cotton basics sold as a three-pack", "texture + quantity", ["MOCK-031"]);
C("materials_textures", "medium", "en", "marled charcoal wool tailoring", "surface + material + style", ["MOCK-052"]);
C("materials_textures", "adversarial", "en", "velvet dress with no soft or plush surface", "material + contradictory surface exclusion", [], { forbiddenTop: ["MOCK-053"] });
C("materials_textures", "adversarial", "en", "waterproof trail shoe made only from satin", "absent material/activity combination", [], { forbiddenTop: ["MOCK-041", "MOCK-045"] });
C("materials_textures", "adversarial", "en", "linen winter parka without technical fabric or padding", "absent material/garment combination", [], { forbiddenTop: ["MOCK-054", "MOCK-061"] });
C("materials_textures", "adversarial", "en", "leather belt excluding real and faux leather", "material contradiction", [], { forbiddenTop: ["MOCK-009", "MOCK-055"] });
C("materials_textures", "adversarial", "en", "glossy satin hoodie with no shine", "surface contradiction + absent combination", [], { forbiddenTop: ["MOCK-008", "MOCK-045", "MOCK-057"] });
C("materials_textures", "adversarial", "en", "cashmere-feel scarf that is neither wool nor fabric", "material exclusions", [], { forbiddenTop: ["MOCK-056"] });

// color_constraints — 6 easy, 8 medium, 6 adversarial
C("color_constraints", "easy", "en", "mint quilted crossbody", "colour + bag subtype", ["MOCK-027"]);
C("color_constraints", "easy", "en", "orange oversized graphic tee", "colour + garment + motif", ["MOCK-039"]);
C("color_constraints", "easy", "en", "charcoal women's wool coat", "colour + department + garment", ["MOCK-013"]);
C("color_constraints", "easy", "en", "tan smart coat for men", "colour + style + department", ["MOCK-044"]);
C("color_constraints", "easy", "en", "sage fitted long-sleeve top", "colour + silhouette", ["MOCK-018"]);
C("color_constraints", "easy", "en", "jewel-green slinky occasion dress falling below the knee", "colour + surface + garment", ["MOCK-045"]);
C("color_constraints", "medium", "en", "neutral cream bag roomy enough for daily carry", "colour family + capacity", ["MOCK-024"]);
C("color_constraints", "medium", "en", "dark warm-brown footwear without laces", "colour concept + footwear exclusion", ["MOCK-050"]);
C("color_constraints", "medium", "en", "cool metallic accessory worn hands-free", "colour concept + use", ["MOCK-040"]);
C("color_constraints", "medium", "en", "deep wine-coloured mini dress for a party", "colour paraphrase + occasion", ["MOCK-053"]);
C("color_constraints", "medium", "en", "off-white trousers for a smart outfit", "colour concept + garment + style", ["MOCK-049"]);
C("color_constraints", "medium", "en", "forest-toned men's zip hoodie", "colour concept + closure", ["MOCK-032"]);
C("color_constraints", "medium", "en", "washed pale-blue women's denim", "colour surface + department", ["MOCK-017"]);
C("color_constraints", "medium", "en", "stone neutral button-up for men", "colour concept + garment", ["MOCK-001"]);
C("color_constraints", "adversarial", "en", "red floral dress with no red or floral elements", "colour and motif contradiction", [], { forbiddenTop: ["MOCK-023"] });
C("color_constraints", "adversarial", "en", "black trousers excluding black, navy and ivory", "exhaustive colour exclusion", [], { forbiddenTop: ["MOCK-002", "MOCK-049", "MOCK-063"] });
C("color_constraints", "adversarial", "en", "white minimal sneakers that must be purple", "incompatible colours", [], { forbiddenTop: ["MOCK-042", "MOCK-046", "MOCK-062"] });
C("color_constraints", "adversarial", "en", "powder-blue scarf in anything except blue", "colour contradiction", [], { forbiddenTop: ["MOCK-056"] });
C("color_constraints", "adversarial", "en", "green dress, excluding emerald, sage, olive and forest shades", "absent colour/garment combination", [], { forbiddenTop: ["MOCK-018", "MOCK-032", "MOCK-041", "MOCK-045"] });
C("color_constraints", "adversarial", "en", "silver waist bag without any metallic finish", "colour/surface contradiction", [], { forbiddenTop: ["MOCK-040"] });

// occasion_style — 6 easy, 8 medium, 6 adversarial
C("occasion_style", "easy", "en", "minimal white leather sneaker for everyday outfits", "style + colour + footwear", ["MOCK-046", "MOCK-062"]);
C("occasion_style", "easy", "en", "structured navy blazer for the office", "occasion + garment", ["MOCK-007"]);
C("occasion_style", "easy", "en", "velvet mini dress for a night out", "occasion + material + length", ["MOCK-053"]);
C("occasion_style", "easy", "en", "casual grey sweatpants for lounging", "occasion + garment", ["MOCK-026"]);
C("occasion_style", "easy", "en", "utility cargo skirt for a streetwear outfit", "style + garment", ["MOCK-014"]);
C("occasion_style", "easy", "en", "classic polished boots for a smart men's look", "style + department + footwear", ["MOCK-050"]);
C("occasion_style", "medium", "en", "one-piece option for a polished warm-weather lunch", "occasion + weather + garment", ["MOCK-061", "MOCK-023"]);
C("occasion_style", "medium", "en", "festival accessory that keeps both hands free", "occasion + use", ["MOCK-040", "MOCK-027", "MOCK-016", "MOCK-064"]);
C("occasion_style", "medium", "en", "quiet luxury trousers for a client meeting", "aesthetic + occasion + garment", ["MOCK-049", "MOCK-063", "MOCK-002"]);
C("occasion_style", "medium", "en", "retro athletic footwear for casual city wear", "aesthetic + activity + footwear", ["MOCK-030", "MOCK-037"]);
C("occasion_style", "medium", "en", "romantic midi dress with visible pattern", "aesthetic + length + motif", ["MOCK-023"]);
C("occasion_style", "medium", "en", "technical layer for a utilitarian winter outfit", "style + season + garment", ["MOCK-054"]);
C("occasion_style", "medium", "en", "small shiny accessory suitable for gifting", "surface + gift concept", ["MOCK-020", "MOCK-051"]);
C("occasion_style", "medium", "en", "minimal black carrier appropriate for work", "style + colour + occasion", ["MOCK-047", "MOCK-064"]);
C("occasion_style", "adversarial", "en", "formal suit jacket for swimming practice", "occasion contradiction", [], { forbiddenTop: ["MOCK-038", "MOCK-052"] });
C("occasion_style", "adversarial", "en", "trail-running stilettos with deep lugs", "incompatible footwear style", [], { forbiddenTop: ["MOCK-041", "MOCK-043"] });
C("occasion_style", "adversarial", "en", "office tote that is unstructured, tiny and cannot hold papers", "use and construction contradiction", [], { forbiddenTop: ["MOCK-024", "MOCK-047"] });
C("occasion_style", "adversarial", "en", "winter knit for the beach, excluding all knitwear", "occasion/category contradiction", [], { forbiddenTop: ["MOCK-006", "MOCK-048"] });
C("occasion_style", "adversarial", "en", "minimalist graphic hoodie with no motif or print", "style/motif contradiction", [], { forbiddenTop: ["MOCK-057"] });
C("occasion_style", "adversarial", "en", "elegant evening dress under the shorts category", "garment/occasion contradiction", [], { forbiddenTop: ["MOCK-038", "MOCK-045", "MOCK-053"] });

// weather_activity — 6 easy, 8 medium, 6 adversarial
C("weather_activity", "easy", "en", "rugged olive footwear with grip for wet countryside paths", "weather + activity + footwear", ["MOCK-041"]);
C("weather_activity", "easy", "en", "breathable dress for a very hot day", "weather + material + garment", ["MOCK-061"]);
C("weather_activity", "easy", "en", "warm wool coat for a cold commute", "weather + material + garment", ["MOCK-013", "MOCK-044"]);
C("weather_activity", "easy", "en", "training shorts made with ventilated mesh", "activity + material", ["MOCK-038"]);
C("weather_activity", "easy", "en", "light wind layer for outdoor exercise", "weather + activity + garment", ["MOCK-034", "MOCK-042"]);
C("weather_activity", "easy", "en", "soft scarf to warm the neck", "weather + use + accessory", ["MOCK-056"]);
C("weather_activity", "medium", "en", "shoe with grip and toe protection for wet paths", "activity + construction", ["MOCK-041"]);
C("weather_activity", "medium", "en", "easy pull-on bottoms for a recovery afternoon", "activity concept + closure", ["MOCK-026"]);
C("weather_activity", "medium", "en", "packable-looking cropped shell for sudden wind", "weather concept + silhouette", ["MOCK-042"]);
C("weather_activity", "medium", "en", "pleated skirt that will not restrict a tennis warm-up", "movement + garment construction", ["MOCK-028"]);
C("weather_activity", "medium", "en", "sleeveless insulation for layering on a cool morning", "weather + layering + construction", ["MOCK-019"]);
C("weather_activity", "medium", "en", "hooded shell with storage for a rainy urban walk", "weather + construction + use", ["MOCK-054"]);
C("weather_activity", "medium", "en", "quick slip-on boots for a long city walk", "activity + footwear construction", ["MOCK-050"]);
C("weather_activity", "medium", "en", "breathable sleeveless top for summer heat", "weather + construction + garment", ["MOCK-004"]);
C("weather_activity", "adversarial", "en", "waterproof summer tank made from heavy wool", "absent weather/material combination", [], { forbiddenTop: ["MOCK-004", "MOCK-013", "MOCK-041"] });
C("weather_activity", "adversarial", "en", "deep-lug trail sandals with open toes", "absent footwear construction", [], { forbiddenTop: ["MOCK-041"] });
C("weather_activity", "adversarial", "en", "padded winter vest with no padding or insulation", "construction contradiction", [], { forbiddenTop: ["MOCK-019"] });
C("weather_activity", "adversarial", "en", "hot-weather parka without shell fabric", "weather/garment contradiction", [], { forbiddenTop: ["MOCK-054"] });
C("weather_activity", "adversarial", "en", "mesh gym shorts for a formal board meeting", "activity/occasion contradiction", [], { forbiddenTop: ["MOCK-038", "MOCK-052"] });
C("weather_activity", "adversarial", "en", "warm scarf excluding wool, fabric and knit", "material exclusions", [], { forbiddenTop: ["MOCK-056"] });

// price_value — 6 easy, 8 medium, 6 adversarial
C("price_value", "easy", "en", "women's denim below thirty euros", "price ceiling + department + material", ["MOCK-017"]);
C("price_value", "easy", "en", "accessory costing no more than six euros", "price ceiling + category", ["MOCK-020"]);
C("price_value", "easy", "en", "men's warm knit from seventy to seventy-six euros", "price range + department + garment", ["MOCK-048"]);
C("price_value", "easy", "en", "black bag under seventeen euros", "price ceiling + colour + category", ["MOCK-016"]);
C("price_value", "easy", "en", "budget thirteen euros for a basic women's upper-body piece", "approximate price + department + garment", ["MOCK-018", "MOCK-059", "MOCK-012"]);
C("price_value", "easy", "en", "lowest-cost sleeveless insulated layer", "value superlative + construction", ["MOCK-019"], { mustRank: ["MOCK-019"], mustRankTopK: 1 });
C("price_value", "medium", "en", "least expensive hands-free black carrier", "price superlative + use + colour", ["MOCK-016"], { mustRank: ["MOCK-016"], mustRankTopK: 1, forbiddenTop: ["MOCK-060", "MOCK-064"], forbiddenTopK: 1 });
C("price_value", "medium", "en", "two dresses for women, each under sixty-six euros", "result count + price ceiling + garment", ["MOCK-023", "MOCK-061"], { exactResults: 2, maxResults: 2 });
C("price_value", "medium", "en", "smart trousers in the €70–80 band", "price range + style + garment", ["MOCK-049", "MOCK-063"]);
C("price_value", "medium", "en", "which unstructured cream carryall gives maximum space for minimum cost", "superlative + capacity + construction", ["MOCK-024"], { mustRank: ["MOCK-024"], mustRankTopK: 1, forbiddenTop: ["MOCK-047"], forbiddenTopK: 1 });
C("price_value", "medium", "en", "white low-profile leather shoe below ninety-five euros", "price ceiling + colour + construction", ["MOCK-062"]);
C("price_value", "medium", "en", "party dress between sixty-five and seventy-five euros", "price range + occasion + garment", ["MOCK-053"]);
C("price_value", "medium", "en", "three pairs of everyday socks around twelve euros", "quantity + approximate price + garment", ["MOCK-031"]);
C("price_value", "medium", "en", "pick one tailored women's item below eighty euros", "count + tailoring + price + department", ["MOCK-007", "MOCK-049", "MOCK-063"], { exactResults: 1, maxResults: 1 });
C("price_value", "adversarial", "en", "leather ankle boots capped at ninety euros", "material + price contradiction", [], { forbiddenTop: ["MOCK-043", "MOCK-050"] });
C("price_value", "adversarial", "en", "wool overcoat for less than one hundred euros", "material + garment + price contradiction", [], { forbiddenTop: ["MOCK-013", "MOCK-044"] });
C("price_value", "adversarial", "en", "structured office tote below ten euros", "construction + occasion + price contradiction", [], { forbiddenTop: ["MOCK-024", "MOCK-047"] });
C("price_value", "adversarial", "en", "two platform sneakers together under fifty euros", "quantity + price contradiction", [], { forbiddenTop: ["MOCK-029", "MOCK-033"] });
C("price_value", "adversarial", "en", "cashmere-feel scarf under forty euros", "material concept + price contradiction", [], { forbiddenTop: ["MOCK-056"] });
C("price_value", "adversarial", "en", "men's tailored suit jacket below one hundred euros", "department + tailoring + price contradiction", [], { forbiddenTop: ["MOCK-052"] });

// negatives_exclusions — 6 easy, 8 medium, 6 adversarial
C("negatives_exclusions", "easy", "en", "plain hoodie, no graphic design", "garment + motif exclusion", ["MOCK-008", "MOCK-032"], { forbiddenTop: ["MOCK-057"] });
C("negatives_exclusions", "easy", "en", "women's skirt longer than mini", "department + length exclusion", ["MOCK-010"], { forbiddenTop: ["MOCK-014", "MOCK-025", "MOCK-028"] });
C("negatives_exclusions", "easy", "en", "bag in any colour except black", "category + colour exclusion", ["MOCK-024", "MOCK-027", "MOCK-040"], { forbiddenTop: ["MOCK-016", "MOCK-047", "MOCK-060", "MOCK-064"] });
C("negatives_exclusions", "easy", "en", "sneakers without a chunky sole", "footwear + construction exclusion", ["MOCK-030", "MOCK-037", "MOCK-041", "MOCK-046", "MOCK-062"], { forbiddenTop: ["MOCK-029", "MOCK-033"] });
C("negatives_exclusions", "easy", "en", "men's outer layer that is not tailored", "department + construction exclusion", ["MOCK-003", "MOCK-011", "MOCK-034", "MOCK-044"], { forbiddenTop: ["MOCK-052"] });
C("negatives_exclusions", "easy", "en", "white T-shirt without chest artwork", "colour + garment + motif exclusion", ["MOCK-012"], { forbiddenTop: ["MOCK-022"] });
C("negatives_exclusions", "medium", "en", "utility bottoms but no denim", "style + garment region + material exclusion", ["MOCK-014", "MOCK-035"], { forbiddenTop: ["MOCK-058"] });
C("negatives_exclusions", "medium", "en", "hands-free carrier excluding backpacks and waist packs", "use + subtype exclusions", ["MOCK-016", "MOCK-027", "MOCK-064"], { forbiddenTop: ["MOCK-040", "MOCK-060"] });
C("negatives_exclusions", "medium", "en", "smart bottoms neither black nor made of denim", "style + colour/material exclusions", ["MOCK-049", "MOCK-063"], { forbiddenTop: ["MOCK-002", "MOCK-005", "MOCK-017", "MOCK-058"] });
C("negatives_exclusions", "medium", "en", "winter layer with no hood and no wool", "season + construction/material exclusions", ["MOCK-019"], { forbiddenTop: ["MOCK-013", "MOCK-044", "MOCK-048", "MOCK-054"] });
C("negatives_exclusions", "medium", "en", "minimal shoes, but not white and not platform", "style + colour/construction exclusions", ["MOCK-043"], { forbiddenTop: ["MOCK-029", "MOCK-033", "MOCK-046", "MOCK-062"] });
C("negatives_exclusions", "medium", "en", "women's evening piece other than a dress", "department + occasion + garment exclusion", ["MOCK-010", "MOCK-016", "MOCK-025", "MOCK-043", "MOCK-051"], { forbiddenTop: ["MOCK-045", "MOCK-053"] });
C("negatives_exclusions", "medium", "en", "summer top with no sleeves and no pink", "season + construction/colour exclusions", ["MOCK-004"], { forbiddenTop: ["MOCK-059"] });
C("negatives_exclusions", "medium", "en", "outer layer without lapels, tailoring or a hood", "category + construction exclusions", ["MOCK-003", "MOCK-011", "MOCK-019", "MOCK-034", "MOCK-042"], { forbiddenTop: ["MOCK-007", "MOCK-052", "MOCK-054"] });
C("negatives_exclusions", "adversarial", "en", "women's trousers in neither black, ivory nor navy", "exhaustive colour exclusions", [], { forbiddenTop: ["MOCK-002", "MOCK-049", "MOCK-063"] });
C("negatives_exclusions", "adversarial", "en", "men's footwear that is neither boots nor sneakers", "exhaustive subtype exclusions", [], { forbiddenTop: ["MOCK-005", "MOCK-029", "MOCK-030", "MOCK-037", "MOCK-041", "MOCK-046", "MOCK-050", "MOCK-062"] });
C("negatives_exclusions", "adversarial", "en", "dress with no straps, sleeves, buttons or wrap closure", "exhaustive construction exclusions", [], { forbiddenTop: ["MOCK-023", "MOCK-045", "MOCK-053", "MOCK-061"] });
C("negatives_exclusions", "adversarial", "en", "cold-season coat or jacket, rejecting every woollen, quilted and weatherproof-shell option", "exhaustive material exclusions", [], { forbiddenTop: ["MOCK-013", "MOCK-019", "MOCK-044", "MOCK-054"] });
C("negatives_exclusions", "adversarial", "en", "printed streetwear tee with no print, motif or graphic", "motif contradiction", [], { forbiddenTop: ["MOCK-022", "MOCK-039"] });
C("negatives_exclusions", "adversarial", "en", "bag without leather, nylon, canvas, straps or handles", "exhaustive material/construction exclusions", [], { forbiddenTop: ["MOCK-016", "MOCK-024", "MOCK-027", "MOCK-040", "MOCK-047", "MOCK-060", "MOCK-064"] });

// lithuanian_language — 6 easy, 8 medium, 6 adversarial
C("lithuanian_language", "easy", "lt", "pastelinė žalsva dygsniuota delninė su ilgu reguliuojamu dirželiu", "spalva + konstrukcija + rankinė / lt", ["MOCK-027"]);
C("lithuanian_language", "easy", "lt", "vyriškas tamsiai rudas aulinukas be raištelių", "spalva + skyrius + avalynė / lt", ["MOCK-050"]);
C("lithuanian_language", "easy", "lt", "balti minimalistiniai odiniai sportbačiai", "spalva + stilius + avalynė / lt", ["MOCK-046", "MOCK-062"]);
C("lithuanian_language", "easy", "lt", "moteriška smaragdinė atlasinė midi suknelė", "skyrius + spalva + medžiaga / lt", ["MOCK-045"]);
C("lithuanian_language", "easy", "lt", "juoda maža kuprinė iš nailono", "spalva + dydis + rankinė / lt", ["MOCK-060"]);
C("lithuanian_language", "easy", "lt", "šiltas vyriškas merino megztinis", "oras + skyrius + medžiaga / lt", ["MOCK-048"]);
C("lithuanian_language", "medium", "lt", "reikia laisvų kelnių poilsiui namuose", "komfortas + drabužis / lt", ["MOCK-026"]);
C("lithuanian_language", "medium", "lt", "lengvas sluoksnis sportiniam apšilimui lauke", "aktyvumas + sluoksnis / lt", ["MOCK-034", "MOCK-042"]);
C("lithuanian_language", "medium", "lt", "darbo rankinė dokumentams, tvirta ir talpi", "paskirtis + konstrukcija / lt", ["MOCK-047"]);
C("lithuanian_language", "medium", "lt", "neperšlampami batai purvinam miško takui", "oras + aktyvumas + avalynė / lt", ["MOCK-041"]);
C("lithuanian_language", "medium", "lt", "vasarai kvėpuojanti suknelė su dirželiu", "sezonas + medžiaga + konstrukcija / lt", ["MOCK-061"]);
C("lithuanian_language", "medium", "lt", "pigiausia juoda rankinė laisvoms rankoms", "kaina + spalva + paskirtis / lt", ["MOCK-016"], { mustRank: ["MOCK-016"], mustRankTopK: 1 });
C("lithuanian_language", "medium", "lt", "platėjančios aukšto liemens tamprės be džinso", "siluetas + medžiagos atmetimas / lt", ["MOCK-021"]);
C("lithuanian_language", "medium", "lt", "šventei maža aksominė bordo suknelė", "proga + medžiaga + spalva / lt", ["MOCK-053"]);
C("lithuanian_language", "adversarial", "lt", "balti sportbačiai, bet ne balti ir ne sportbačiai", "spalvos ir drabužio prieštara / lt", [], { forbiddenTop: ["MOCK-029", "MOCK-030", "MOCK-033", "MOCK-037", "MOCK-041", "MOCK-046", "MOCK-062"] });
C("lithuanian_language", "adversarial", "lt", "vilnonis paltas iki 90 eurų", "medžiaga + kaina / lt", [], { forbiddenTop: ["MOCK-013", "MOCK-044"] });
C("lithuanian_language", "adversarial", "lt", "kuprinė be petnešų ir rankenų", "drabužis + konstrukcijos atmetimas / lt", [], { forbiddenTop: ["MOCK-060"] });
C("lithuanian_language", "adversarial", "lt", "žieminė striukė be vilnos, paminkštinimo ir techninio audinio", "sezonas + medžiagų atmetimas / lt", [], { forbiddenTop: ["MOCK-013", "MOCK-019", "MOCK-044", "MOCK-054"] });
C("lithuanian_language", "adversarial", "lt", "moteriškos kelnės, tik ne juodos, dramblio kaulo ar tamsiai mėlynos", "drabužis + visų spalvų atmetimas / lt", [], { forbiddenTop: ["MOCK-002", "MOCK-049", "MOCK-063"] });
C("lithuanian_language", "adversarial", "lt", "atlasinė suknelė visiškai be blizgesio", "medžiagos ir paviršiaus prieštara / lt", [], { forbiddenTop: ["MOCK-045"] });

// ambiguous_conceptual — 6 easy, 8 medium, 6 adversarial
C("ambiguous_conceptual", "easy", "en", "a small bright ornament worn beside the ears", "abstract jewellery use", ["MOCK-051"]);
C("ambiguous_conceptual", "easy", "en", "a layer with enough pockets for a phone, wallet and keys", "capacity + layering concept", ["MOCK-054", "MOCK-003"]);
C("ambiguous_conceptual", "easy", "en", "shoes that make me visibly taller", "silhouette effect", ["MOCK-029", "MOCK-033", "MOCK-043", "MOCK-050"]);
C("ambiguous_conceptual", "easy", "en", "a no-fuss outfit that is already one piece", "ease + garment concept", ["MOCK-023", "MOCK-045", "MOCK-053", "MOCK-061"]);
C("ambiguous_conceptual", "easy", "en", "soft texture close to the face for winter", "surface + use + weather concept", ["MOCK-056"]);
C("ambiguous_conceptual", "easy", "en", "a bag for someone who never wants to carry it by hand", "hands-free carrying concept", ["MOCK-016", "MOCK-027", "MOCK-040", "MOCK-060", "MOCK-064"]);
C("ambiguous_conceptual", "medium", "en", "crisp tailoring to balance very relaxed trousers", "styling balance concept", ["MOCK-007", "MOCK-052", "MOCK-001"]);
C("ambiguous_conceptual", "medium", "en", "bottoms that work from a presentation to dinner", "occasion versatility", ["MOCK-002", "MOCK-049", "MOCK-063", "MOCK-010"]);
C("ambiguous_conceptual", "medium", "en", "footwear for avoiding a heavy-looking silhouette", "visual proportion concept", ["MOCK-043", "MOCK-046", "MOCK-050", "MOCK-062"], { forbiddenTop: ["MOCK-029", "MOCK-033"] });
C("ambiguous_conceptual", "medium", "en", "a small gleaming detail instead of a full party outfit", "surface + accessory concept", ["MOCK-020", "MOCK-040", "MOCK-051"]);
C("ambiguous_conceptual", "medium", "en", "dramatic rounded sleeve volume in a soft upper-body layer", "shape + surface concept", ["MOCK-006", "MOCK-015"]);
C("ambiguous_conceptual", "medium", "en", "weekend denim with a practical workwear attitude", "material + aesthetic concept", ["MOCK-058"]);
C("ambiguous_conceptual", "medium", "en", "warmth that does not feel like wearing another coat", "weather + lightness concept", ["MOCK-056", "MOCK-019"]);
C("ambiguous_conceptual", "medium", "en", "a neat sleeveless piece to sharpen a basic top", "layering + styling concept", ["MOCK-019"]);
C("ambiguous_conceptual", "adversarial", "en", "hands-free work bag with no wearable strap and no handles", "use/construction contradiction", [], { forbiddenTop: ["MOCK-047", "MOCK-060", "MOCK-064"] });
C("ambiguous_conceptual", "adversarial", "en", "delicate low-profile shoe on a massive chunky platform", "silhouette contradiction", [], { forbiddenTop: ["MOCK-029", "MOCK-033", "MOCK-062"] });
C("ambiguous_conceptual", "adversarial", "en", "graphic streetwear with a completely blank surface", "aesthetic/motif contradiction", [], { forbiddenTop: ["MOCK-022", "MOCK-039", "MOCK-057"] });
C("ambiguous_conceptual", "adversarial", "en", "romantic evening texture without softness, shine, drape or pattern", "aesthetic/surface exclusions", [], { forbiddenTop: ["MOCK-010", "MOCK-023", "MOCK-045", "MOCK-053"] });
C("ambiguous_conceptual", "adversarial", "en", "weightless insulation, but no wool, fleece, padding or fabric", "abstract need + exhaustive material exclusions", [], { forbiddenTop: ["MOCK-006", "MOCK-008", "MOCK-013", "MOCK-015", "MOCK-019", "MOCK-044", "MOCK-048", "MOCK-056", "MOCK-057"] });
C("ambiguous_conceptual", "adversarial", "en", "an open roomy carrier that cannot have an opening, volume or handles", "capacity/construction contradiction", [], { forbiddenTop: ["MOCK-024", "MOCK-047"] });

export const FINAL_BLIND_V3_SET = Object.freeze(CASES.map((testCase) => Object.freeze(testCase)));
