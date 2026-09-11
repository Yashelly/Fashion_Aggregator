import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { EMBEDDING_PROVIDERS, loadLocalEnv } from "./cloud-search-providers.mjs";
import { loadSemanticSearch } from "./load-search.mjs";
import { loadSearchProducts, productDocument } from "./search-catalog.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BATCH_SIZE = 32;
const DATA_API_BATCH_SIZE = 8;

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

async function embedChangedDocuments(changed, provider) {
  const rows = [];
  for (const batch of chunks(changed, BATCH_SIZE)) {
    const vectors = await provider.embed(batch.map((document) => document.content), "document");
    rows.push(...batch.map((document, index) => {
      const product = document.product;
      return {
        product_id: product.mock_product_id,
        embedding_model: provider.model,
        embedding_dimensions: provider.dimensions,
        source_hash: document.sourceHash,
        searchable_text: document.content,
        terms: document.terms,
        department: product.gender,
        category: product.category,
        subcategory: product.subcategory,
        color: product.color,
        price_eur: Number(product.price_eur),
        availability: product.availability,
        is_public: true,
        embedding: vectorLiteral(unitVector(vectors[index])),
        generated_at: new Date().toISOString(),
      };
    }));
    console.log(`Embedded ${Math.min(rows.length, changed.length)}/${changed.length}`);
  }
  return rows;
}

async function indexWithDataApi(documents, provider, supabaseUrl, secretKey) {
  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
  const { data: existing, error: existingError } = await supabase
    .from("search_product_documents")
    .select("product_id,source_hash,is_public")
    .eq("embedding_model", provider.model);
  if (existingError) throw existingError;

  const hashes = new Map((existing ?? []).map((row) => [row.product_id, row.source_hash]));
  const changed = documents.filter((document) => hashes.get(document.product.mock_product_id) !== document.sourceHash);
  console.log(`Catalog: ${documents.length}; unchanged: ${documents.length - changed.length}; to embed: ${changed.length}`);

  const rows = await embedChangedDocuments(changed, provider);
  let uploaded = 0;
  for (const batch of chunks(rows, DATA_API_BATCH_SIZE)) {
    const { error } = await supabase
      .from("search_product_documents")
      .upsert(batch, { onConflict: "product_id,embedding_model" });
    if (error) throw error;
    uploaded += batch.length;
    console.log(`Indexed ${uploaded}/${rows.length}`);
  }

  const activeIds = new Set(documents.map((document) => document.product.mock_product_id));
  const staleIds = (existing ?? [])
    .filter((row) => row.is_public && !activeIds.has(row.product_id))
    .map((row) => row.product_id);
  if (staleIds.length > 0) {
    const { error } = await supabase
      .from("search_product_documents")
      .update({ is_public: false, generated_at: new Date().toISOString() })
      .eq("embedding_model", provider.model)
      .in("product_id", staleIds);
    if (error) throw error;
  }

  const { count, error: countError } = await supabase
    .from("search_product_documents")
    .select("product_id", { count: "exact", head: true })
    .eq("embedding_model", provider.model)
    .eq("is_public", true);
  if (countError) throw countError;
  if (count !== documents.length) {
    throw new Error(`Search index count mismatch: expected ${documents.length}, received ${count ?? "unknown"}`);
  }
}

async function indexWithPostgres(documents, provider, databaseUrl) {
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
    const rows = await embedChangedDocuments(changed, provider);
    for (const batch of chunks(rows, BATCH_SIZE)) {
      await sql.begin(async (transaction) => {
        for (const row of batch) {
          await transaction`
            insert into public.search_product_documents (
              product_id, embedding_model, embedding_dimensions, source_hash,
              searchable_text, terms, department, category, subcategory, color,
              price_eur, availability, is_public, embedding, generated_at
            ) values (
              ${row.product_id}, ${row.embedding_model}, ${row.embedding_dimensions}, ${row.source_hash},
              ${row.searchable_text}, ${transaction.array(row.terms)}, ${row.department}, ${row.category},
              ${row.subcategory}, ${row.color}, ${row.price_eur}, ${row.availability},
              true, ${row.embedding}::extensions.vector, ${row.generated_at}
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
    }

    const activeIds = documents.map((document) => document.product.mock_product_id);
    await sql`
      update public.search_product_documents
      set is_public = false, generated_at = now()
      where embedding_model = ${provider.model}
        and not (product_id = any(${sql.array(activeIds)}))
    `;

    const [{ count }] = await sql`
      select count(*)::integer as count
      from public.search_product_documents
      where embedding_model = ${provider.model}
        and is_public = true
    `;
    if (count !== documents.length) {
      throw new Error(`Search index count mismatch: expected ${documents.length}, received ${count}`);
    }
  } finally {
    await sql.end();
  }
}

async function main() {
  const databaseUrl = process.env.SUPABASE_DB_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  const supabaseUrl = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim();
  if ((!secretKey || !supabaseUrl) && !databaseUrl) {
    throw new Error("Set SUPABASE_SECRET_KEY + SUPABASE_URL, or fallback SUPABASE_DB_URL");
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

  if (secretKey && supabaseUrl) {
    console.log("Indexer backend: Supabase Data API (secret key)");
    await indexWithDataApi(documents, provider, supabaseUrl, secretKey);
  } else {
    console.log("Indexer backend: direct Postgres (fallback)");
    await indexWithPostgres(documents, provider, databaseUrl);
  }
  console.log(`Search index ready: ${provider.model}, ${provider.dimensions} dimensions`);
}

await main();
