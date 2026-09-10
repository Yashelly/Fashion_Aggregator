import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { EMBEDDING_PROVIDERS, loadLocalEnv } from "./cloud-search-providers.mjs";
import { loadSemanticSearch } from "./load-search.mjs";
import { loadSearchProducts, productDocument } from "./search-catalog.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BATCH_SIZE = 32;

loadLocalEnv(rootDir);

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function chunks(values, size) {
  const result = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

function vectorLiteral(values) {
  return `[${values.join(",")}]`;
}

function unitVector(values) {
  const magnitude = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (!Number.isFinite(magnitude) || magnitude === 0) {
    throw new Error("Embedding provider returned an invalid vector");
  }
  return values.map((value) => value / magnitude);
}

async function main() {
  const databaseUrl = process.env.SUPABASE_DB_URL?.trim();
  if (!databaseUrl) {
    throw new Error("SUPABASE_DB_URL is required (Supabase Connect -> Session pooler)");
  }

  const provider = EMBEDDING_PROVIDERS.gemini;
  const engine = loadSemanticSearch();
  const products = loadSearchProducts(rootDir);
  const documents = products.map((product) => {
    const content = productDocument(product);
    return {
      content,
      product,
      sourceHash: sha256(`${provider.model}\n${provider.dimensions}\n${content}`),
      terms: [...engine.buildProductTerms(product).keys()].sort(),
    };
  });

  const sql = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    ssl: "require",
  });

  try {
    const existing = await sql`
      select product_id, source_hash
      from public.search_product_documents
      where embedding_model = ${provider.model}
    `;
    const hashes = new Map(existing.map((row) => [row.product_id, row.source_hash]));
    const changed = documents.filter((document) => hashes.get(document.product.mock_product_id) !== document.sourceHash);

    console.log(`Catalog: ${documents.length}; unchanged: ${documents.length - changed.length}; to embed: ${changed.length}`);
    for (const batch of chunks(changed, BATCH_SIZE)) {
      const vectors = await provider.embed(batch.map((document) => document.content), "document");
      await sql.begin(async (transaction) => {
        for (let index = 0; index < batch.length; index += 1) {
          const document = batch[index];
          const product = document.product;
          await transaction`
            insert into public.search_product_documents (
              product_id, embedding_model, embedding_dimensions, source_hash,
              searchable_text, terms, department, category, subcategory, color,
              price_eur, availability, is_public, embedding, generated_at
            ) values (
              ${product.mock_product_id}, ${provider.model}, ${provider.dimensions}, ${document.sourceHash},
              ${document.content}, ${transaction.array(document.terms)}, ${product.gender}, ${product.category},
              ${product.subcategory}, ${product.color}, ${Number(product.price_eur)}, ${product.availability},
              true, ${vectorLiteral(unitVector(vectors[index]))}::extensions.vector, now()
            )
            on conflict (product_id, embedding_model) do update set
              embedding_dimensions = excluded.embedding_dimensions,
              source_hash = excluded.source_hash,
              searchable_text = excluded.searchable_text,
              terms = excluded.terms,
              department = excluded.department,
              category = excluded.category,
              subcategory = excluded.subcategory,
              color = excluded.color,
              price_eur = excluded.price_eur,
              availability = excluded.availability,
              is_public = excluded.is_public,
              embedding = excluded.embedding,
              generated_at = excluded.generated_at
          `;
        }
      });
      console.log(`Indexed ${Math.min(changed.indexOf(batch[0]) + batch.length, changed.length)}/${changed.length}`);
    }

    const activeIds = documents.map((document) => document.product.mock_product_id);
    await sql`
      update public.search_product_documents
      set is_public = false
      where embedding_model = ${provider.model}
        and not (product_id = any(${sql.array(activeIds)}))
    `;
    console.log(`Search index ready: ${provider.model}, ${provider.dimensions} dimensions`);
  } finally {
    await sql.end();
  }
}

await main();
