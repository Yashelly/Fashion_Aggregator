import type { Locale } from "@/lib/i18n";

type LocalizedLabel = Readonly<{ en: string; lt: string }>;

const materialLabels: Record<string, LocalizedLabel> = {
  "cashmere-feel wool": { en: "Cashmere-feel wool", lt: "Kašmyro pojūčio vilna" },
  "linen blend": { en: "Linen blend", lt: "Lino mišinys" },
  "wool blend": { en: "Wool blend", lt: "Vilnos mišinys" },
  "faux leather": { en: "Faux leather", lt: "Dirbtinė oda" },
  leather: { en: "Leather", lt: "Oda" },
  fleece: { en: "Fleece", lt: "Flisas" },
  wool: { en: "Wool", lt: "Vilna" },
  cotton: { en: "Cotton", lt: "Medvilnė" },
  linen: { en: "Linen", lt: "Linas" },
  viscose: { en: "Viscose", lt: "Viskozė" },
  nylon: { en: "Nylon", lt: "Nailonas" },
  denim: { en: "Denim", lt: "Džinsas" },
  satin: { en: "Satin", lt: "Satinas" },
  velvet: { en: "Velvet", lt: "Aksomas" },
  mesh: { en: "Mesh", lt: "Tinklelis" },
  suede: { en: "Suede", lt: "Zomša" },
  jersey: { en: "Jersey", lt: "Trikotažas" },
  canvas: { en: "Canvas", lt: "Drobė" },
};

const surfaceLabels: Record<string, LocalizedLabel> = {
  solid: { en: "Solid colour", lt: "Vienspalvė" },
  washed_cotton: { en: "Washed cotton", lt: "Skalbta medvilnė" },
  cotton_twill: { en: "Cotton twill", lt: "Medvilninis ruoželis" },
  smooth_twill: { en: "Smooth twill", lt: "Lygus ruoželis" },
  heavy_twill: { en: "Heavy twill", lt: "Sunkus ruoželis" },
  washed: { en: "Washed finish", lt: "Skalbta apdaila" },
  washed_denim: { en: "Washed denim", lt: "Skalbto denimo" },
  light_wash_denim: { en: "Light-wash denim", lt: "Šviesiai skalbtas denimas" },
  faded: { en: "Faded finish", lt: "Blukinta apdaila" },
  faux_leather: { en: "Faux leather", lt: "Dirbtinė oda" },
  smooth_faux_leather: { en: "Smooth faux leather", lt: "Lygi dirbtinė oda" },
  smooth_leather: { en: "Smooth leather", lt: "Lygi oda" },
  grained_faux_leather: { en: "Grained faux leather", lt: "Grūdėta dirbtinė oda" },
  grained_leather: { en: "Grained leather", lt: "Grūdėta oda" },
  smooth_suiting: { en: "Smooth suiting", lt: "Lygus kostiuminis audinys" },
  brushed_fleece: { en: "Brushed fleece", lt: "Švelnus flisas" },
  brushed_knit: { en: "Brushed knit", lt: "Švelnus mezginys" },
  brushed_wool: { en: "Brushed wool", lt: "Šukuota vilna" },
  jersey_cotton: { en: "Cotton jersey", lt: "Medvilninis trikotažas" },
  matte_jersey: { en: "Matte jersey", lt: "Matinis trikotažas" },
  heavy_cotton_canvas: { en: "Heavy cotton canvas", lt: "Tvirta medvilninė drobė" },
  wool_melton: { en: "Wool melton", lt: "Vilnonis meltonas" },
  wool_flannel: { en: "Wool flannel", lt: "Vilnonis flanelis" },
  soft_wool: { en: "Soft wool", lt: "Švelni vilna" },
  satin: { en: "Satin", lt: "Satinas" },
  velvet: { en: "Velvet", lt: "Aksomas" },
  suede: { en: "Suede", lt: "Zomša" },
  suede_and_mesh: { en: "Suede and mesh", lt: "Zomša ir tinklelis" },
  napped: { en: "Napped finish", lt: "Pūkuota apdaila" },
  soft_napped: { en: "Soft napped finish", lt: "Švelni pūkuota apdaila" },
  ribbed: { en: "Ribbed", lt: "Rumbuota" },
  fine_rib_knit: { en: "Fine rib knit", lt: "Smulkiai rumbuotas mezginys" },
  fine_gauge_knit: { en: "Fine-gauge knit", lt: "Plonas mezginys" },
  heather: { en: "Heathered", lt: "Melanžinė" },
  marled: { en: "Marled", lt: "Melanžinė" },
  marled_cotton: { en: "Marled cotton", lt: "Melanžinė medvilnė" },
  stretch: { en: "Stretch", lt: "Tampri" },
  quilted: { en: "Quilted", lt: "Dygsniuota" },
  metallic: { en: "Metallic finish", lt: "Metalinė apdaila" },
  matte: { en: "Matte finish", lt: "Matinė apdaila" },
  matte_grain: { en: "Matte grain", lt: "Matinis paviršius" },
  print: { en: "Printed", lt: "Su raštu" },
  multicolour: { en: "Multicolour", lt: "Įvairiaspalvė" },
  diamond_stitch: { en: "Diamond stitch", lt: "Deimantinis dygsnis" },
};

const detailLabels: Record<string, LocalizedLabel> = {
  point_collar: { en: "Point collar", lt: "Smaila apykaklė" },
  button_placket: { en: "Button placket", lt: "Užsegimas sagomis" },
  full_button_placket: { en: "Full button placket", lt: "Visas užsegimas sagomis" },
  curved_hem: { en: "Curved hem", lt: "Lenktas kraštas" },
  buttoned_cuffs: { en: "Button cuffs", lt: "Rankogaliai su sagomis" },
  dropped_shoulder: { en: "Dropped shoulders", lt: "Nuleisti pečiai" },
  high_waist: { en: "High waist", lt: "Aukštas liemuo" },
  pleated_front: { en: "Pleated front", lt: "Klostuotas priekis" },
  double_pleats: { en: "Double pleats", lt: "Dvigubos klostės" },
  wide_leg: { en: "Wide leg", lt: "Plačios klešnės" },
  wide_straight_leg: { en: "Wide straight leg", lt: "Plačios tiesios klešnės" },
  pressed_crease: { en: "Pressed crease", lt: "Išlyginta klostė" },
  belt_loops: { en: "Belt loops", lt: "Diržo kilpelės" },
  belt_loops_none: { en: "No visible belt loops", lt: "Nėra matomų diržo kilpelių" },
  two_cargo_flap_pockets: { en: "Two cargo flap pockets", lt: "Dvi cargo kišenės su atvartais" },
  a_line: { en: "A-line shape", lt: "A formos siluetas" },
  a_line_flare: { en: "A-line flare", lt: "A formos platėjimas" },
  mini_length: { en: "Mini length", lt: "Mini ilgis" },
  midi_length: { en: "Midi length", lt: "Midi ilgis" },
  button_fly: { en: "Button fly", lt: "Užsegimas sagomis" },
  five_pocket: { en: "Five-pocket construction", lt: "Penkių kišenių konstrukcija" },
  tapered_leg: { en: "Tapered leg", lt: "Siaurėjančios klešnės" },
  mom_fit: { en: "Mom fit", lt: "Mom siluetas" },
  notch_lapel: { en: "Notch lapels", lt: "Atvartai su iškirpte" },
  single_breasted: { en: "Single-breasted", lt: "Vienaeilis" },
  single_button: { en: "Single button", lt: "Viena saga" },
  two_flap_pockets: { en: "Two flap pockets", lt: "Dvi kišenės su atvartais" },
  two_flap_chest_pockets: { en: "Two chest flap pockets", lt: "Dvi krūtinės kišenės su atvartais" },
  welt_chest_pocket: { en: "Welt chest pocket", lt: "Krūtinės kišenė su įleistu kraštu" },
  princess_seams: { en: "Princess seams", lt: "Reljefinės siūlės" },
  lined: { en: "Lined", lt: "Su pamušalu" },
  kangaroo_pocket: { en: "Kangaroo pocket", lt: "Kengūros kišenė" },
  hood: { en: "Hood", lt: "Kapišonas" },
  drawstring: { en: "Drawstring", lt: "Virvelė" },
  ribbed_cuffs: { en: "Ribbed cuffs", lt: "Rumbuoti rankogaliai" },
  ribbed_hem: { en: "Ribbed hem", lt: "Rumbuotas kraštas" },
  elastic_waistband: { en: "Elastic waistband", lt: "Tamprus juosmuo" },
  side_pockets: { en: "Side pockets", lt: "Šoninės kišenės" },
  wide_waistband: { en: "Wide waistband", lt: "Platus juosmuo" },
  flared_leg: { en: "Flared leg", lt: "Platėjančios klešnės" },
  centre_seam: { en: "Centre seam", lt: "Centrinė siūlė" },
  pull_on: { en: "Pull-on", lt: "Užmaunamas modelis" },
  two_long_handles: { en: "Two long handles", lt: "Dvi ilgos rankenos" },
  open_top: { en: "Open top", lt: "Atviras viršus" },
  reinforced_stitching: { en: "Reinforced stitching", lt: "Sustiprintos siūlės" },
  unstructured: { en: "Unstructured shape", lt: "Minkštas siluetas" },
  flat_bottom: { en: "Flat bottom", lt: "Plokščias dugnas" },
  roomy: { en: "Roomy shape", lt: "Talpus siluetas" },
  top_zip: { en: "Top zip", lt: "Viršutinis užtrauktukas" },
  curved_baguette_shape: { en: "Curved baguette shape", lt: "Lenkta baguette forma" },
  short_shoulder_strap: { en: "Short shoulder strap", lt: "Trumpas petnešėlė" },
  gold_hardware: { en: "Gold-tone hardware", lt: "Auksinės spalvos detalės" },
  d_rings: { en: "D-rings", lt: "D formos žiedai" },
  washed: { en: "Washed finish", lt: "Skalbta apdaila" },
  v_neck: { en: "V-neck", lt: "V formos iškirptė" },
  crew_neck: { en: "Crew neck", lt: "Apvali iškirptė" },
  short_sleeves: { en: "Short sleeves", lt: "Trumpos rankovės" },
  sleeveless: { en: "Sleeveless", lt: "Be rankovių" },
  cropped: { en: "Cropped", lt: "Sutrumpintas" },
  balloon_sleeves: { en: "Balloon sleeves", lt: "Pūstos rankovės" },
  wide_ribbed_hem: { en: "Wide ribbed hem", lt: "Platus rumbuotas kraštas" },
  regular_fit: { en: "Regular fit", lt: "Įprastas siluetas" },
  boxy_fit: { en: "Boxy fit", lt: "Stačiakampis siluetas" },
  tailored_fit: { en: "Tailored fit", lt: "Pritaikytas siluetas" },
  oversized: { en: "Oversized", lt: "Oversize siluetas" },
  workwear: { en: "Workwear details", lt: "Darbinio stiliaus detalės" },
  utility: { en: "Utility details", lt: "Utilitarinės detalės" },
};

/** Material values are inferred from the controlled visual description. */
export function formatMaterialLabel(value: string | undefined, locale: Locale) {
  if (!value) return undefined;
  return materialLabels[value.trim().toLowerCase()]?.[locale];
}

function splitTokens(value: string | undefined) {
  return (value ?? "").split("|").map((token) => token.trim()).filter(Boolean);
}

/**
 * Render only vocabulary that has been reviewed for shopper-facing meaning.
 * Unknown importer tokens are omitted instead of being guessed or exposed.
 */
export function presentControlledValues(value: string | undefined, locale: Locale, kind: "surface" | "details") {
  const labels = kind === "surface" ? surfaceLabels : detailLabels;
  const seen = new Set<string>();
  return splitTokens(value).flatMap((token) => {
    const label = labels[token]?.[locale];
    if (!label || seen.has(label)) return [];
    seen.add(label);
    return [label];
  });
}
