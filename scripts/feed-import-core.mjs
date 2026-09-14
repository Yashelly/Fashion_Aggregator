import crypto from "node:crypto";

const CANONICAL_FIELDS = [
  "external_product_id",
  "source_sku",
  "title",
  "brand",
  "description",
  "merchant_category",
  "subcategory",
  "gender",
  "color_label",
  "material",
  "style_tags",
  "product_url",
  "affiliate_url",
  "image_url",
  "currency",
  "price",
  "sale_price",
  "old_price",
  "availability",
  "size_summary",
  "external_variant_id",
  "item_group_id",
  "variant_sku",
  "variant_gtin",
  "variant_currency",
  "size_system",
  "variant_size",
  "variant_color",
  "variant_price",
  "variant_sale_price",
  "variant_old_price",
  "variant_availability",
  "variant_image_urls",
  "source_observed_at",
  "offer_delivers_to_lithuania",
  "offer_delivery_price_eur",
  "offer_free_delivery_threshold_eur",
  "offer_delivery_min_days",
  "offer_delivery_max_days",
  "offer_return_window_days",
  "offer_return_payer",
  "offer_return_cost",
  "offer_policy_url",
  "offer_last_checked_at",
];

const IN_STOCK_VALUES = new Set([
  "available",
  "in stock",
  "instock",
  "limited",
  "preorder",
  "yes",
]);
const OUT_OF_STOCK_VALUES = new Set(["out of stock", "out-of-stock", "sold out", "sold-out", "unavailable", "no"]);
const REMOVED_VALUES = new Set(["discontinued", "removed"]);
const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off"]);
const RETURN_PAYER_VALUES = new Set(["customer", "retailer", "seller"]);
const IMAGE_COLLECTION_DELIMITERS = [",", "|"];

function firstDefined(value) {
  return value === undefined || value === null ? "" : String(value);
}

function toLocaleLowerTrimmed(value) {
  return value.trim().toLocaleLowerCase("en");
}

function normalizeForJson(value) {
  if (Array.isArray(value)) return value.map(normalizeForJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, normalizeForJson(nested)]),
    );
  }
  return value;
}

export function stableStringify(value) {
  return JSON.stringify(normalizeForJson(value));
}

export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function decodeEntities(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export function parseDelimitedRecords(text, delimiter = ",") {
  if (delimiter.length !== 1) throw new Error("Delimiter must be one character");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  const finishRow = () => {
    row.push(field);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
    row = [];
    field = "";
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      if (field.length > 0) throw new Error("Unexpected quote in delimited field");
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      finishRow();
    } else if (char === "\r") {
      if (text[index + 1] !== "\n") finishRow();
    } else {
      field += char;
    }
  }
  if (quoted) throw new Error("Unclosed quoted field");
  if (field.length > 0 || row.length > 0) finishRow();
  if (rows.length === 0) return [];

  const headers = rows[0].map((header, index) =>
    (index === 0 ? header.replace(/^\uFEFF/, "") : header).trim(),
  );
  if (headers.some((header) => !header)) throw new Error("Feed headers cannot be blank");
  if (new Set(headers).size !== headers.length) throw new Error("Feed headers must be unique");
  return rows.slice(1).map((values, index) => {
    if (values.length !== headers.length) {
      throw new Error(`Delimited feed row ${index + 1} has ${values.length} fields; expected ${headers.length}`);
    }
    return Object.fromEntries(headers.map((header, fieldIndex) => [header, values[fieldIndex]]));
  });
}

function valueAtPath(value, path) {
  if (!path) return value;
  return path.split(".").reduce((current, key) => current?.[key], value);
}

export function parseJsonRecords(text, recordPath = "") {
  const parsed = JSON.parse(text);
  const records = valueAtPath(parsed, recordPath);
  if (!Array.isArray(records)) {
    throw new Error(`JSON record path "${recordPath}" must resolve to an array`);
  }
  if (records.some((record) => !record || typeof record !== "object" || Array.isArray(record))) {
    throw new Error("Every JSON feed row must be an object");
  }
  return records;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseXmlRecords(text, itemTag = "item") {
  if (/<!DOCTYPE|<!ENTITY/i.test(text)) {
    throw new Error("DOCTYPE and ENTITY declarations are not allowed in feed XML");
  }
  if (!/^[A-Za-z_][\w:.-]*$/.test(itemTag)) throw new Error("Invalid XML item tag");
  const escapedTag = escapeRegExp(itemTag);
  const itemPattern = new RegExp(`<${escapedTag}\\b[^>]*>([\\s\\S]*?)<\\/${escapedTag}>`, "gi");
  const records = [];
  for (const itemMatch of text.matchAll(itemPattern)) {
    const record = {};
    const fieldPattern = /<([A-Za-z_][\w:.-]*)\b[^>]*>([\s\S]*?)<\/\1>/g;
    for (const fieldMatch of itemMatch[1].matchAll(fieldPattern)) {
      record[fieldMatch[1]] = decodeEntities(fieldMatch[2]).replace(/<[^>]+>/g, "").trim();
    }
    records.push(record);
  }
  if (records.length === 0) throw new Error(`XML feed contains no <${itemTag}> rows`);
  return records;
}

export function parseFeedText(text, config) {
  switch (config.format) {
    case "csv":
      return parseDelimitedRecords(text, ",");
    case "tsv":
      return parseDelimitedRecords(text, "\t");
    case "json":
      return parseJsonRecords(text, config.recordPath ?? "");
    case "xml":
      return parseXmlRecords(text, config.itemTag ?? "item");
    default:
      throw new Error(`Unsupported feed format: ${config.format}`);
  }
}

function stringValue(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(stringValue).filter(Boolean).join(" | ");
  if (typeof value === "object") return stableStringify(value);
  return decodeEntities(String(value)).replace(/\u0000/g, "").trim();
}

function mappedValue(raw, field, config) {
  const aliases = config.fields?.[field];
  const candidates = Array.isArray(aliases) ? aliases : aliases ? [aliases] : [];
  for (const alias of candidates) {
    const value = stringValue(valueAtPath(raw, alias));
    if (value) return value;
  }
  return stringValue(config.defaults?.[field]);
}

function parsePrice(value) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^[+-]?(?:\d+(?:[.,]\d{1,2})?|[.,]\d{1,2})$/.test(trimmed)) return Number.NaN;
  let cleaned = trimmed;
  if (cleaned.includes(",") && cleaned.includes(".")) {
    cleaned = cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
      ? cleaned.replace(/\./g, "").replace(",", ".")
      : cleaned.replace(/,/g, "");
  } else {
    cleaned = cleaned.replace(",", ".");
  }
  const number = Number(cleaned);
  return Number.isFinite(number) && number >= 0 ? number : Number.NaN;
}

function parseNonNegativeInteger(value) {
  if (!value) return null;
  if (!/^\d+$/.test(value)) return Number.NaN;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : Number.NaN;
}

function parseBoolean(value) {
  if (value === null || value === undefined || value === "") return null;
  const normalized = toLocaleLowerTrimmed(value);
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  return Number.NaN;
}

function parseObservationTime(value) {
  if (!value) return { value: null, valid: true };
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { value: null, valid: false };
  return { value: parsed.toISOString(), valid: true };
}

export function freshnessAdjustedAvailability(status, observedAt, slaHours, now = new Date()) {
  if (!Number.isFinite(slaHours) || slaHours <= 0 || !observedAt) return status;
  const observed = new Date(observedAt);
  if (Number.isNaN(observed.getTime()) || observed.getTime() > now.getTime()) return "unknown";
  return now.getTime() - observed.getTime() > slaHours * 60 * 60 * 1000 ? "unknown" : status;
}

export function variantIdentity(payload) {
  return [
    payload.external_variant_id,
    payload.item_group_id,
    payload.variant_sku,
    payload.variant_gtin,
    payload.normalized_variant_size,
    payload.normalized_variant_color,
  ].map((value) => String(value ?? "").trim()).join("|");
}

export function groupVariantRows(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!row?.isVariant || row.validationStatus === "invalid") continue;
    const productId = row.normalizedPayload.external_product_id;
    if (!productId) continue;
    const variants = groups.get(productId) ?? [];
    variants.push(row);
    groups.set(productId, variants);
  }
  return groups;
}

function normalizeToken(value) {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("en")
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeAvailability(value, config) {
  if (value === "") return { in_stock: false, status: "unknown" };
  const normalized = toLocaleLowerTrimmed(value);
  const configured = config.availabilityMap?.[normalized];
  if (configured) {
    return {
      in_stock: Boolean(configured.in_stock),
      status: configured.status ?? (configured.in_stock ? "active" : "out_of_stock"),
    };
  }
  if (REMOVED_VALUES.has(normalized)) return { in_stock: false, status: "removed" };
  if (OUT_OF_STOCK_VALUES.has(normalized)) return { in_stock: false, status: "out_of_stock" };
  if (IN_STOCK_VALUES.has(normalized)) return { in_stock: true, status: "active" };
  return { in_stock: false, status: "unknown" };
}

function validHttpsUrl(value) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

function validDemoPath(value, kind) {
  if (!value) return false;
  const pattern = kind === "image"
    ? /^\/demo-products\/product-\d+(?:-tryon)?\.(?:png|webp)$/
    : /^\/mock\/products\/[A-Za-z0-9_-]+$/;
  return pattern.test(value);
}

function validateConfig(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error("Feed config must be an object");
  }
  if (config.version !== 1) throw new Error("Feed config version must be 1");
  if (!["csv", "tsv", "json", "xml"].includes(config.format)) {
    throw new Error("Feed config format must be csv, tsv, json, or xml");
  }
  if (!config.fields || typeof config.fields !== "object") {
    throw new Error("Feed config fields are required");
  }
  for (const forbidden of ["authorization", "credentials", "password", "sourceUrl", "token"]) {
    if (forbidden in config) {
      throw new Error(`Feed config must not contain secret/source field: ${forbidden}`);
    }
  }
  for (const field of Object.keys(config.fields)) {
    if (!CANONICAL_FIELDS.includes(field)) throw new Error(`Unknown canonical field: ${field}`);
  }
}

function parseDelimitedImageList(value, allowRelativeDemoUrls, warnings) {
  if (!value) return [];

  const delimiter = value.includes("|")
    ? "|"
    : IMAGE_COLLECTION_DELIMITERS.find((candidate) => value.includes(candidate)) ?? ",";
  const seen = new Set();
  const images = [];

  for (const rawImage of value.split(delimiter)) {
    const valueImage = rawImage.trim();
    if (!valueImage) continue;
    const validImageUrl = validHttpsUrl(valueImage)
      || (allowRelativeDemoUrls && validDemoPath(valueImage, "image"));
    if (!validImageUrl) {
      warnings.push("invalid_variant_image_url");
      continue;
    }
    if (!seen.has(valueImage)) {
      seen.add(valueImage);
      images.push(valueImage);
    }
  }
  return images;
}

function parseImageList(value, warnings, allowRelativeDemoUrls) {
  return parseDelimitedImageList(value, allowRelativeDemoUrls, warnings);
}

function imageListSummary(value) {
  if (!value) return "";
  return value.join("|");
}

function isVariantRow(mapped) {
  const check = [
    mapped.external_variant_id,
    mapped.item_group_id,
    mapped.variant_sku,
    mapped.variant_gtin,
    mapped.size_system,
    mapped.variant_size,
    mapped.variant_color,
    mapped.variant_price,
    mapped.variant_sale_price,
    mapped.variant_old_price,
    mapped.variant_availability,
    mapped.variant_image_urls,
  ];
  return check.some((value) => String(value ?? "").trim() !== "");
}

function isOfferRow(mapped) {
  const check = [
    mapped.offer_delivers_to_lithuania,
    mapped.offer_delivery_price_eur,
    mapped.offer_free_delivery_threshold_eur,
    mapped.offer_delivery_min_days,
    mapped.offer_delivery_max_days,
    mapped.offer_return_window_days,
    mapped.offer_return_payer,
    mapped.offer_return_cost,
    mapped.offer_policy_url,
    mapped.offer_last_checked_at,
  ];
  return check.some((value) => String(value ?? "").trim() !== "");
}

function contentHashPayload(product, includesVariant = false) {
  const basePayload = [
    "external_product_id", "source_sku", "title", "brand", "description",
    "merchant_category", "normalized_category", "subcategory", "gender", "color_label",
    "normalized_color", "material", "style_tags", "product_url", "affiliate_url", "image_url",
    "currency", "price", "sale_price", "old_price", "availability", "in_stock",
    "size_summary", "status",
  ];
  const variantPayload = includesVariant
    ? [
      "external_variant_id", "item_group_id", "variant_sku", "variant_gtin",
      "size_system", "variant_size", "normalized_variant_size", "variant_color",
      "normalized_variant_color", "variant_currency", "variant_price",
      "variant_sale_price", "variant_old_price", "variant_availability",
      "variant_in_stock", "image_url_list",
    ]
    : [];
  const offerPayload = [
    "offer_delivers_to_lithuania", "offer_delivery_price_eur",
    "offer_free_delivery_threshold_eur", "offer_delivery_min_days",
    "offer_delivery_max_days", "offer_return_window_days", "offer_return_payer",
    "offer_return_cost", "offer_policy_url", "offer_last_checked_at",
  ];
  return Object.fromEntries([
    ...basePayload.map((key) => [key, product[key] ?? null]),
    ...variantPayload.map((key) => [key, product[key] ?? null]),
    ...offerPayload.map((key) => [key, product[key] ?? null]),
  ]);
}

export function buildImportPlan(text, config, { allowRelativeDemoUrls = false } = {}) {
  validateConfig(config);
  const parsedRows = parseFeedText(text, config);
  const seenProductIds = new Set();
  const seenVariantIds = new Set();
  const rows = parsedRows.map((rawPayload, index) => {
    const mapped = Object.fromEntries(
      CANONICAL_FIELDS.map((field) => [field, mappedValue(rawPayload, field, config)]),
    );
    const errors = [];
    const warnings = [];
    const price = parsePrice(mapped.price);
    const salePrice = parsePrice(mapped.sale_price);
    const oldPrice = parsePrice(mapped.old_price);

    const variantPrice = parsePrice(mapped.variant_price);
    const variantSalePrice = parsePrice(mapped.variant_sale_price);
    const variantOldPrice = parsePrice(mapped.variant_old_price);
    const offerReturnCost = parsePrice(mapped.offer_return_cost);

    const offerDeliveryPrice = parsePrice(mapped.offer_delivery_price_eur);
    const offerDeliveryThreshold = parsePrice(mapped.offer_free_delivery_threshold_eur);
    const offerDeliveryMinDays = parseNonNegativeInteger(mapped.offer_delivery_min_days);
    const offerDeliveryMaxDays = parseNonNegativeInteger(mapped.offer_delivery_max_days);
    const offerReturnWindow = parseNonNegativeInteger(mapped.offer_return_window_days);
    const variantImageUrls = parseImageList(mapped.variant_image_urls, warnings, allowRelativeDemoUrls);
    if (warnings.includes("invalid_variant_image_url")) {
      errors.push("invalid_variant_image_url");
      while (warnings.includes("invalid_variant_image_url")) {
        warnings.splice(warnings.indexOf("invalid_variant_image_url"), 1);
      }
    }

    const normalized = {
      ...mapped,
      currency: firstDefined(mapped.currency).toUpperCase(),
      variant_currency: firstDefined(mapped.variant_currency || mapped.currency).toUpperCase(),
      price,
      sale_price: salePrice,
      old_price: oldPrice,
      variant_price: variantPrice,
      variant_sale_price: variantSalePrice,
      variant_old_price: variantOldPrice,
      variant_image_urls: variantImageUrls,
      image_url_list: imageListSummary(variantImageUrls),
      normalized_category: config.categoryMap?.[toLocaleLowerTrimmed(mapped.merchant_category)] ?? normalizeToken(mapped.merchant_category),
      normalized_color: normalizeToken(mapped.color_label),
      normalized_variant_size: normalizeToken(mapped.variant_size),
      normalized_variant_color: normalizeToken(mapped.variant_color),
      gender: normalizeToken(mapped.gender),
      source_observation_at: null,
      offer_return_payer: firstDefined(mapped.offer_return_payer).toLocaleLowerCase("en"),
    };
    const parsedObservation = parseObservationTime(mapped.source_observed_at || mapped.observation_at);
    const parsedOfferCheck = parseObservationTime(mapped.offer_last_checked_at);

    const availability = normalizeAvailability(mapped.availability, config);
    normalized.in_stock = availability.in_stock;
    normalized.status = availability.status;
    normalized.offer_last_checked_at = parsedOfferCheck.value;
    normalized.source_observation_at = parsedObservation.value;

    const variantAvailability = normalizeAvailability(firstDefined(mapped.variant_availability), config);
    const isVariant = isVariantRow(mapped);
    normalized.variant_in_stock = variantAvailability.in_stock;
    normalized.variant_availability = mapped.variant_availability
      ? variantAvailability.status
      : availability.status;
    normalized.offer_delivers_to_lithuania = parseBoolean(mapped.offer_delivers_to_lithuania);
    normalized.offer_delivery_price_eur = offerDeliveryPrice;
    normalized.offer_free_delivery_threshold_eur = offerDeliveryThreshold;
    normalized.offer_delivery_min_days = offerDeliveryMinDays;
    normalized.offer_delivery_max_days = offerDeliveryMaxDays;
    normalized.offer_return_window_days = offerReturnWindow;
    normalized.offer_return_cost = offerReturnCost;
    normalized.is_variant = isVariant;
    normalized.has_offer_terms = isOfferRow(mapped);


    const categoryKey = firstDefined(mapped.merchant_category).toLocaleLowerCase("en");
    normalized.normalized_category = config.categoryMap?.[categoryKey] ?? normalizeToken(mapped.merchant_category);
    const canonicalColor = normalizeToken(mapped.color_label);
    normalized.normalized_color = canonicalColor;

    if (!mapped.external_product_id) errors.push("missing_external_product_id");
    if (!mapped.title) errors.push("missing_title");
    const hasProductPrice = mapped.price !== "";
    const hasVariantPrice = mapped.variant_price !== "";
    if (isVariant ? !hasProductPrice && !hasVariantPrice : !hasProductPrice) {
      errors.push("missing_price");
    } else {
      if (!hasProductPrice && Number.isNaN(variantPrice)) errors.push("invalid_variant_price");
      else if (Number.isNaN(price)) errors.push("invalid_price");
    }
    if (mapped.sale_price && Number.isNaN(salePrice)) errors.push("invalid_sale_price");
    if (mapped.old_price && Number.isNaN(oldPrice)) errors.push("invalid_old_price");

    if (mapped.variant_price && Number.isNaN(variantPrice)) errors.push("invalid_variant_price");
    if (mapped.variant_sale_price && Number.isNaN(variantSalePrice)) errors.push("invalid_variant_sale_price");
    if (mapped.variant_old_price && Number.isNaN(variantOldPrice)) errors.push("invalid_variant_old_price");
    if (mapped.offer_delivery_price_eur && Number.isNaN(offerDeliveryPrice)) errors.push("invalid_offer_delivery_price");
    if (mapped.offer_free_delivery_threshold_eur && Number.isNaN(offerDeliveryThreshold)) errors.push("invalid_offer_free_delivery_threshold");
    if (mapped.offer_delivery_min_days && Number.isNaN(offerDeliveryMinDays)) errors.push("invalid_offer_delivery_min_days");
    if (mapped.offer_delivery_max_days && Number.isNaN(offerDeliveryMaxDays)) errors.push("invalid_offer_delivery_max_days");
    if (mapped.offer_return_window_days && Number.isNaN(offerReturnWindow)) errors.push("invalid_offer_return_window_days");
    if (mapped.offer_return_cost && Number.isNaN(offerReturnCost)) errors.push("invalid_offer_return_cost");
    if (offerDeliveryMinDays !== null && offerDeliveryMaxDays !== null
      && Number.isFinite(offerDeliveryMinDays) && Number.isFinite(offerDeliveryMaxDays)
      && offerDeliveryMinDays > offerDeliveryMaxDays) errors.push("invalid_offer_delivery_range");
    if (!/^[A-Z]{3}$/.test(normalized.currency)) errors.push("invalid_currency");
    if (!/^[A-Z]{3}$/.test(normalized.variant_currency)) errors.push("invalid_variant_currency");
    if (!mapped.availability && !mapped.variant_availability) errors.push("missing_availability");

    if (Number.isNaN(normalized.offer_delivers_to_lithuania)) {
      errors.push("invalid_offer_delivers_to_lithuania");
      normalized.offer_delivers_to_lithuania = null;
    }
    if (
      normalized.offer_return_payer
      && !RETURN_PAYER_VALUES.has(normalized.offer_return_payer)
    ) errors.push("invalid_offer_return_payer");

    if (parsedObservation.value === null && (mapped.source_observed_at || mapped.observation_at)) {
      errors.push("invalid_source_observation_at");
    }
    if (parsedObservation.value && new Date(parsedObservation.value).getTime() > Date.now()) {
      errors.push("future_source_observation_at");
    }
    if (parsedOfferCheck.value === null && mapped.offer_last_checked_at) {
      errors.push("invalid_offer_last_checked_at");
    }
    if (parsedOfferCheck.value && new Date(parsedOfferCheck.value).getTime() > Date.now()) {
      errors.push("future_offer_last_checked_at");
    }

    const validProductUrl = validHttpsUrl(mapped.product_url)
      || (allowRelativeDemoUrls && validDemoPath(mapped.product_url, "product"));
    const validAffiliateUrl = validHttpsUrl(mapped.affiliate_url);
    const validImageUrl = validHttpsUrl(mapped.image_url)
      || (allowRelativeDemoUrls && validDemoPath(mapped.image_url, "image"));
    if (!validProductUrl && !validAffiliateUrl) {
      errors.push("missing_or_invalid_https_destination");
    }
    if (mapped.product_url && !validProductUrl) errors.push("invalid_product_url");
    if (mapped.affiliate_url && !validAffiliateUrl) errors.push("invalid_affiliate_url");
    if (!mapped.image_url) warnings.push("missing_image_url");
    else if (!validImageUrl) {
      errors.push("invalid_image_url");
      normalized.image_url = null;
    }

    if (!isVariant && mapped.external_product_id) {
      if (seenProductIds.has(mapped.external_product_id)) errors.push("duplicate_external_product_id");
      else seenProductIds.add(mapped.external_product_id);
    }
    if (isVariant && mapped.external_product_id) {
      const key = [
        mapped.external_product_id,
        mapped.external_variant_id || "",
        mapped.item_group_id || "",
        mapped.variant_sku || "",
        mapped.variant_gtin || "",
        normalized.normalized_variant_size || "",
        normalized.normalized_variant_color || "",
      ].join("|");
      if (seenVariantIds.has(key)) errors.push("duplicate_variant_identity");
      else seenVariantIds.add(key);
    }
    if (isVariant && !(
      mapped.external_variant_id || mapped.item_group_id || mapped.variant_sku || mapped.variant_gtin
      || mapped.variant_size || mapped.variant_color || normalized.image_url_list
    )) {
      errors.push("incomplete_variant_identity");
    }

    if (mapped.offer_policy_url && !validHttpsUrl(mapped.offer_policy_url)) errors.push("invalid_offer_policy_url");

    const rawHash = sha256(stableStringify(rawPayload));
    const contentHash = sha256(stableStringify(contentHashPayload(normalized)));
    const variantContentHash = isVariant
      ? sha256(stableStringify(contentHashPayload(normalized, true)))
      : null;
    const validationStatus = errors.length > 0
      ? "invalid"
      : warnings.includes("missing_image_url")
        ? "skipped"
        : warnings.length > 0
          ? "warning"
          : "valid";

    return {
      contentHash,
      variantContentHash,
      normalizedPayload: normalized,
      rawHash,
      rawPayload,
      rowNumber: index + 1,
      validationErrors: [...errors, ...warnings],
      validationStatus,
      isVariant,
    };
  });

  const count = (status) => rows.filter((row) => row.validationStatus === status).length;
  const invalidRows = count("invalid");
  const publicRows = count("valid") + count("warning");
  const invalidRate = rows.length === 0 ? 1 : invalidRows / rows.length;
  return {
    feedHash: sha256(stableStringify(parsedRows)),
    rows,
    summary: {
      canApply: publicRows > 0 && invalidRate <= 0.3,
      invalidRate,
      invalidRows,
      publicRows,
      skippedRows: count("skipped"),
      totalRows: rows.length,
      validRows: count("valid"),
      warningRows: count("warning"),
    },
  };
}

export function classifyProductChange(existingContentHash, nextContentHash) {
  if (existingContentHash === undefined) return "inserted";
  return existingContentHash === nextContentHash ? "unchanged" : "updated";
}
