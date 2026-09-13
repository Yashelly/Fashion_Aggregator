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
  new Function("exports", "module", "require", transpiled)(
    moduleScope.exports,
    moduleScope,
    require,
  );
  return moduleScope.exports;
}

const {
  sanitizeSearchReturnTo,
  toPublicProduct,
  toPublicRelatedProduct,
} = loadPublicProductModule();
const { formatPrice } = loadPublicProductModule("format-price.ts");

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
    "imagePath",
    "oldPriceEur",
    "priceEur",
    "publicStoreId",
    "sizeOptions",
    "storeLabel",
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
    sanitizeSearchReturnTo("/search?query=black+coat&category=outerwear&page=2&debug=private"),
    "/search?query=black+coat&category=outerwear&page=2",
  );
  assert.equal(sanitizeSearchReturnTo(["/search?lang=lt&sort=price-low"]), "/search?lang=lt&sort=price-low");
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

test("absent optional product facts remain absent rather than acquiring invented defaults", () => {
  const product = toPublicProduct({ ...catalogProduct, size_options: "", old_price_eur: "", gender: "", color: "", availability: "" }, null);
  assert.deepEqual(product.sizeOptions, []);
  for (const key of ["oldPriceEur", "gender", "color", "availability"]) assert.equal(product[key], "");
  assert.equal(product.storeLabel, null);
});

test("missing or invalid prices are not rendered as free products or NaN", () => {
  for (const locale of ["en", "lt"]) {
    for (const value of ["", " ", "NaN", "invalid", Infinity, -1]) assert.equal(formatPrice(value, "EUR", locale), "—");
    assert.notEqual(formatPrice(0, "EUR", locale), "—");
    assert.match(formatPrice("29.99", "EUR", locale), /29[.,]99/);
  }
});
