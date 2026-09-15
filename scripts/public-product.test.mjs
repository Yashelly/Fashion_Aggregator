import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { test } from "node:test";

const require = createRequire(import.meta.url);

function loadPublicProductModule(filename = "public-product.ts") {
  const source = fs.readFileSync(path.join(process.cwd(), "lib", filename), "utf8");
  const transpiled = require("typescript").transpileModule(source, {
    compilerOptions: { module: "CommonJS", target: "ES2022" },
  }).outputText;
  const moduleScope = { exports: {} };
  const localRequire = (name) => name.startsWith("@/lib/")
    ? loadPublicProductModule(`${name.slice("@/lib/".length)}.ts`)
    : require(name);
  new Function("exports", "module", "require", transpiled)(
    moduleScope.exports,
    moduleScope,
    localRequire,
  );
  return moduleScope.exports;
}

const {
  sanitizeSearchReturnTo,
  toPublicProduct,
  toPublicRelatedProduct,
} = loadPublicProductModule();
const { formatPrice } = loadPublicProductModule("format-price.ts");
const { formatAvailabilityLabel } = loadPublicProductModule("i18n.ts");
const {
  consumeSearchContinuityPayload,
  createSearchContinuityPayload,
  parseSearchContinuityPayload,
  productLinkDomId,
  saveSearchContinuityPayload,
  SEARCH_CONTINUITY_MAX_AGE_MS,
  SEARCH_CONTINUITY_STORAGE_KEY,
} = loadPublicProductModule("search-continuity.ts");

const privateSentinels = {
  brand: "PRIVATE_BRAND_SENTINEL",
  mock_url: "https://private-retailer.invalid/item",
  notes: "PRIVATE_NOTES_SENTINEL",
  source_status: "PRIVATE_SOURCE_STATUS_SENTINEL",
  store_slug: "private-store-slug",
};

const catalogProduct = {
  mock_product_id: "MOCK-001",
  title: "Structured coat",
  category: "outerwear",
  subcategory: "coat",
  gender: "women",
  color: "black",
  size_options: "XS|S|M",
  price_eur: "129.00",
  old_price_eur: "159.00",
  currency: "EUR",
  availability: "in_stock",
  style_tags: "tailored|winter",
  image_url: "/demo-products/product-01.webp",
  public_store_id: "demo-store-01",
  image_path: "/demo-products/product-01.webp",
  image_available: true,
  detail_image_path: "/demo-products/product-01-tryon.webp",
  detail_image_available: true,
  motif: "plain",
  surface: "brushed",
  visual_details: "three buttons",
  visual_description: "Internal enrichment description",
  ...privateSentinels,
};

test("public product DTOs serialize only explicitly allowlisted shopper fields", () => {
  const storeLabel = { en: "Store 01", lt: "Parduotuvė 01" };
  const detail = toPublicProduct(catalogProduct, storeLabel);
  const related = toPublicRelatedProduct(catalogProduct, storeLabel);
  const serialized = JSON.stringify({ detail, related });

  assert.deepEqual(Object.keys(detail).sort(), [
    "availability",
    "category",
    "color",
    "currency",
    "detailImageAvailable",
    "detailImagePath",
    "gender",
    "id",
    "imageAvailable",
    "imageGallery",
    "imagePath",
    "oldPriceEur",
    "priceEur",
    "publicStoreId",
    "sizeOptions",
    "storeLabel",
    "subcategory",
    "surface",
    "title",
  ]);

  for (const [privateField, sentinel] of Object.entries(privateSentinels)) {
    assert.equal(privateField in detail, false);
    assert.equal(privateField in related, false);
    assert.equal(serialized.includes(sentinel), false);
  }
});

test("search return URL keeps supported state and removes unrecognised query keys", () => {
  assert.equal(
    sanitizeSearchReturnTo("/search?query=black+coat&category=outerwear&department=women&color=navy,black&size=M,S&store=demo-store-02,demo-store-01&status=limited&sale=on&page=2&debug=private"),
    "/search?query=black+coat&category=outerwear&department=women&color=black%2Cnavy&size=M%2CS&store=demo-store-01%2Cdemo-store-02&status=limited&sale=on&page=2",
  );
  assert.equal(sanitizeSearchReturnTo(["/search?lang=lt&sort=price-low"]), "/search?sort=price-low&lang=lt");
  assert.equal(sanitizeSearchReturnTo("/search?gender=men&availability=in_stock&stores=demo-store-02,demo-store-01"), "/search?department=men&store=demo-store-01%2Cdemo-store-02&status=in_stock");
});

test("search return URL rejects external, malformed, and non-search destinations", () => {
  const unsafe = [
    "https://evil.invalid/search",
    "//evil.invalid/search",
    "/account?query=coat",
    "/search#hidden",
    "/%2f%2fevil.invalid/search",
    "/search\\evil.invalid",
    "javascript:alert(1)",
    "",
  ];

  for (const value of unsafe) {
    assert.equal(sanitizeSearchReturnTo(value), "/search", value);
  }
});

test("search continuity payload is canonical, versioned, scoped, and one-navigation sized", () => {
  const focusTarget = productLinkDomId("MOCK-001", "title");
  const payload = createSearchContinuityPayload({
    searchHref: "/search?query=black+coat&page=2&perPage=20&lang=lt",
    productId: "MOCK-001",
    scrollX: 0,
    scrollY: 1480,
    focusTarget,
    capturedAt: 1_000,
  });
  assert.deepEqual(payload, {
    version: 1,
    searchHref: "/search?query=black+coat&page=2&perPage=20&lang=lt",
    productId: "MOCK-001",
    scrollX: 0,
    scrollY: 1480,
    focusTarget,
    capturedAt: 1_000,
  });
  assert.deepEqual(
    parseSearchContinuityPayload(JSON.stringify(payload), payload.searchHref, 1_500),
    payload,
  );
});

test("search continuity rejects stale, mismatched, malformed, and noncanonical payloads", () => {
  const base = createSearchContinuityPayload({
    searchHref: "/search?query=coat&page=2",
    productId: "MOCK-001",
    scrollX: 0,
    scrollY: 900,
    focusTarget: productLinkDomId("MOCK-001", "media"),
    capturedAt: 10_000,
  });
  assert.ok(base);

  assert.equal(parseSearchContinuityPayload(JSON.stringify(base), "/search?query=other&page=2", 11_000), null);
  assert.equal(parseSearchContinuityPayload(JSON.stringify(base), base.searchHref, 10_000 + SEARCH_CONTINUITY_MAX_AGE_MS + 1), null);
  assert.equal(parseSearchContinuityPayload(JSON.stringify({ ...base, version: 2 }), base.searchHref, 11_000), null);
  assert.equal(parseSearchContinuityPayload(JSON.stringify({ ...base, focusTarget: "private-store-slug" }), base.searchHref, 11_000), null);
  assert.equal(parseSearchContinuityPayload(JSON.stringify({ ...base, searchHref: "/search?page=2&query=coat" }), base.searchHref, 11_000), null);
  assert.equal(parseSearchContinuityPayload("not-json", base.searchHref, 11_000), null);
  assert.equal(createSearchContinuityPayload({ ...base, productId: "bad/id" }), null);
});

test("search continuity storage is fail-safe and consumed exactly once", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
  const payload = createSearchContinuityPayload({
    searchHref: "/search?query=coat",
    productId: "MOCK-001",
    scrollX: 0,
    scrollY: 500,
    focusTarget: productLinkDomId("MOCK-001", "title"),
    capturedAt: 1_000,
  });
  assert.ok(payload);
  assert.equal(saveSearchContinuityPayload(storage, payload), true);
  assert.equal(values.has(SEARCH_CONTINUITY_STORAGE_KEY), true);
  assert.deepEqual(consumeSearchContinuityPayload(storage, payload.searchHref, 1_100), payload);
  assert.equal(values.has(SEARCH_CONTINUITY_STORAGE_KEY), false);
  assert.equal(consumeSearchContinuityPayload(storage, payload.searchHref, 1_100), null);

  const blockedStorage = {
    getItem() { throw new Error("blocked"); },
    removeItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
  };
  assert.equal(saveSearchContinuityPayload(blockedStorage, payload), false);
  assert.equal(consumeSearchContinuityPayload(blockedStorage, payload.searchHref, 1_100), null);

  const blockedGetter = () => { throw new Error("sessionStorage getter blocked"); };
  assert.equal(saveSearchContinuityPayload(blockedGetter, payload), false);
  assert.equal(consumeSearchContinuityPayload(blockedGetter, payload.searchHref, 1_100), null);
});

test("continuity treats explicit page one as the canonical first page", () => {
  const payload = createSearchContinuityPayload({
    searchHref: "/search?query=coat",
    productId: "MOCK-001",
    scrollX: 0,
    scrollY: 500,
    focusTarget: productLinkDomId("MOCK-001", "title"),
    capturedAt: 1_000,
  });
  assert.ok(payload);
  assert.deepEqual(parseSearchContinuityPayload(JSON.stringify(payload), "/search?query=coat&page=1", 1_100), payload);
});

test("availability labels expose the four shopper-facing stock states exactly", () => {
  assert.deepEqual(
    ["in_stock", "limited", "out_of_stock", "unknown"].map((value) => formatAvailabilityLabel(value, "en")),
    ["In stock", "Low stock", "Out of stock", "Unknown"],
  );
  assert.deepEqual(
    ["in_stock", "limited", "out_of_stock", "unknown"].map((value) => formatAvailabilityLabel(value, "lt")),
    ["Yra sandėlyje", "Liko nedaug", "Išparduota", "Nežinoma"],
  );
});

test("absent optional product facts remain absent rather than acquiring invented defaults", () => {
  const product = toPublicProduct({ ...catalogProduct, size_options: "", old_price_eur: "", gender: "", color: "", availability: "" }, null);
  assert.deepEqual(product.sizeOptions, []);
  for (const key of ["oldPriceEur", "gender", "color", "availability"]) assert.equal(product[key], "");
  assert.equal(product.storeLabel, null);
});

test("public gallery keeps only valid, deduplicated demo images in stable order", () => {
  const duplicateSource = {
    ...catalogProduct,
    image_url: "/demo-products/product-01.webp|/demo-products/product-01.webp",
    image_available: true,
    detail_image_path: "/demo-products/product-01-tryon.webp",
    detail_image_available: true,
  };
  const product = toPublicProduct({
    ...duplicateSource,
    image_gallery: [
      "/demo-products/product-01.webp",
      "/demo-products/product-01.webp",
      "/demo-products/product-01-tryon.webp",
      "/invalid/nonexistent.webp",
    ],
  }, null);

  assert.deepEqual(
    product.imageGallery,
    ["/demo-products/product-01.webp", "/demo-products/product-01-tryon.webp"],
  );
  assert.equal(product.imagePath, product.imageGallery[0]);
  assert.equal(product.detailImagePath, product.imageGallery[1]);
  assert.equal(product.imageAvailable, true);
  assert.equal(product.detailImageAvailable, true);
});

test("controlled facts and provenance are allowlisted when supplied", () => {
  const product = toPublicProduct({
    ...catalogProduct,
    image_gallery: ["/demo-products/product-01.webp"],
    description: "A visible cotton shirt",
    material: "cotton",
    construction_details: "point collar",
    size_system: "Lettered",
    fit_note: "Relaxed",
    fact_provenance: "controlled_synthetic",
    garment_measurements: { chest: "52 cm" },
    measurement_source: "Controlled sample",
    size_availability: { M: "out_of_stock" },
  }, null);
  assert.equal(product.description, "A visible cotton shirt");
  assert.equal(product.factProvenance, "controlled_synthetic");
  assert.deepEqual(product.garmentMeasurements, { chest: "52 cm" });
  assert.deepEqual(product.sizeAvailability, { M: "out_of_stock" });
});

test("missing or invalid prices are not rendered as free products or NaN", () => {
  for (const locale of ["en", "lt"]) {
    for (const value of ["", " ", "NaN", "invalid", Infinity, -1]) assert.equal(formatPrice(value, "EUR", locale), "—");
    assert.notEqual(formatPrice(0, "EUR", locale), "—");
    assert.match(formatPrice("29.99", "EUR", locale), /29[.,]99/);
  }
});
