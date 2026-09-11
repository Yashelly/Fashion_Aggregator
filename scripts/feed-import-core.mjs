import crypto from "node:crypto";

const CANONICAL_FIELDS = [
  "external_product_id",
  "source_sku",
  "title",
  "brand",
  "description",
  "merchant_category",
  "gender",
  "color_label",
  "material",
  "product_url",
  "affiliate_url",
  "image_url",
  "currency",
  "price",
  "sale_price",
  "old_price",
  "availability",
  "size_summary",
];

const IN_STOCK_VALUES = new Set([
  "available",
  "in stock",
  "instock",
  "limited",
  "preorder",
  "yes",
]);
const REMOVED_VALUES = new Set(["discontinued", "removed"]);

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
    case "csv": return parseDelimitedRecords(text, ",");
    case "tsv": return parseDelimitedRecords(text, "\t");
    case "json": return parseJsonRecords(text, config.recordPath ?? "");
    case "xml": return parseXmlRecords(text, config.itemTag ?? "item");
    default: throw new Error(`Unsupported feed format: ${config.format}`);
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
  let cleaned = value.replace(/[^0-9,.-]/g, "");
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

function normalizeToken(value) {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("en")
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeAvailability(value, config) {
  const normalized = value.trim().toLocaleLowerCase("en");
  const configured = config.availabilityMap?.[normalized];
  if (configured) {
    return {
      in_stock: Boolean(configured.in_stock),
      status: configured.status ?? (configured.in_stock ? "active" : "out_of_stock"),
    };
  }
  if (REMOVED_VALUES.has(normalized)) return { in_stock: false, status: "removed" };
  if (IN_STOCK_VALUES.has(normalized)) return { in_stock: true, status: "active" };
  return { in_stock: false, status: "out_of_stock" };
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

function contentHashPayload(product) {
  return Object.fromEntries([
    "external_product_id", "source_sku", "title", "brand", "description",
    "merchant_category", "normalized_category", "gender", "color_label",
    "normalized_color", "material", "product_url", "affiliate_url", "image_url",
    "currency", "price", "sale_price", "old_price", "availability", "in_stock",
    "size_summary", "status",
  ].map((key) => [key, product[key] ?? null]));
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

export function buildImportPlan(text, config) {
  validateConfig(config);
  const parsedRows = parseFeedText(text, config);
  const seenProductIds = new Set();
  const rows = parsedRows.map((rawPayload, index) => {
    const mapped = Object.fromEntries(
      CANONICAL_FIELDS.map((field) => [field, mappedValue(rawPayload, field, config)]),
    );
    const errors = [];
    const warnings = [];
    const price = parsePrice(mapped.price);
    const salePrice = parsePrice(mapped.sale_price);
    const oldPrice = parsePrice(mapped.old_price);
    const currency = mapped.currency.toUpperCase();
    const availability = normalizeAvailability(mapped.availability, config);
    const categoryKey = mapped.merchant_category.trim().toLocaleLowerCase("en");
    const normalized = {
      ...mapped,
      currency,
      price,
      sale_price: salePrice,
      old_price: oldPrice,
      normalized_category: config.categoryMap?.[categoryKey] ?? normalizeToken(mapped.merchant_category),
      normalized_color: normalizeToken(mapped.color_label),
      gender: normalizeToken(mapped.gender),
      ...availability,
    };

    if (!mapped.external_product_id) errors.push("missing_external_product_id");
    if (!mapped.title) errors.push("missing_title");
    if (!mapped.price) errors.push("missing_price");
    else if (Number.isNaN(price)) errors.push("invalid_price");
    if (mapped.sale_price && Number.isNaN(salePrice)) errors.push("invalid_sale_price");
    if (mapped.old_price && Number.isNaN(oldPrice)) errors.push("invalid_old_price");
    if (!/^[A-Z]{3}$/.test(currency)) errors.push("invalid_currency");
    if (!mapped.availability) errors.push("missing_availability");
    if (!validHttpsUrl(mapped.product_url) && !validHttpsUrl(mapped.affiliate_url)) {
      errors.push("missing_or_invalid_https_destination");
    }
    if (mapped.product_url && !validHttpsUrl(mapped.product_url)) errors.push("invalid_product_url");
    if (mapped.affiliate_url && !validHttpsUrl(mapped.affiliate_url)) errors.push("invalid_affiliate_url");
    if (!mapped.image_url) warnings.push("missing_image_url");
    else if (!validHttpsUrl(mapped.image_url)) errors.push("invalid_image_url");
    if (mapped.external_product_id && seenProductIds.has(mapped.external_product_id)) {
      errors.push("duplicate_external_product_id");
    }
    if (mapped.external_product_id) seenProductIds.add(mapped.external_product_id);

    const rawHash = sha256(stableStringify(rawPayload));
    const contentHash = sha256(stableStringify(contentHashPayload(normalized)));
    const validationStatus = errors.length > 0
      ? "invalid"
      : warnings.includes("missing_image_url")
        ? "skipped"
        : warnings.length > 0
          ? "warning"
          : "valid";

    return {
      contentHash,
      normalizedPayload: normalized,
      rawHash,
      rawPayload,
      rowNumber: index + 1,
      validationErrors: [...errors, ...warnings],
      validationStatus,
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
