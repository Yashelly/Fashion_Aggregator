import fs from "node:fs";
import path from "node:path";
import { parseCsvRecords } from "./csv.mjs";

export function loadSearchProducts(rootDir) {
  const readCsv = (fileName) => parseCsvRecords(
    fs.readFileSync(path.join(rootDir, "data", fileName), "utf8"),
  );
  const attributes = new Map(
    readCsv("product_attributes.csv").map((row) => [row.mock_product_id, row]),
  );
  return readCsv("mock_products.csv")
    .filter((product) => product.source_status === "mock_not_live")
    .map((product) => {
      const visual = attributes.get(product.mock_product_id) ?? {};
      return {
        ...product,
        motif: visual.motif ?? "",
        surface: visual.surface ?? "",
        visual_details: visual.details ?? "",
        visual_description: visual.visual_description ?? "",
      };
    });
}

export function productDocument(product) {
  return [
    `Product ID: ${product.mock_product_id}`,
    `Title: ${product.title}`,
    `Brand: ${product.brand}`,
    `Department: ${product.gender}`,
    `Category: ${product.category}; type: ${product.subcategory}`,
    `Colour: ${product.color.replaceAll("_", " ")}`,
    `Style: ${product.style_tags.replaceAll("|", ", ")}`,
    `Motif: ${product.motif.replaceAll("|", ", ")}`,
    `Surface: ${product.surface.replaceAll("|", ", ")}`,
    `Construction: ${product.visual_details.replaceAll("|", ", ")}`,
    `Visual description: ${product.visual_description}`,
  ].join("\n");
}

export function rerankDocument(product) {
  return `${productDocument(product)}\nPrice EUR: ${product.price_eur}\nAvailability: ${product.availability}`;
}
