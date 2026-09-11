import postgres from "postgres";

function postgresSsl(databaseUrl) {
  const host = new URL(databaseUrl).hostname;
  return new Set(["127.0.0.1", "::1", "localhost"]).has(host) ? false : "require";
}

export function mapCatalogProductForSearch(row) {
  return {
    mock_product_id: row.public_product_id,
    public_store_id: row.public_store_id,
    source_status: row.source_status,
    title: row.title,
    category: row.category ?? "",
    subcategory: row.subcategory ?? "",
    brand: row.brand ?? "",
    gender: row.gender ?? "",
    color: row.color ?? "",
    size_options: row.size_options ?? "",
    price_eur: String(row.price_eur ?? "0"),
    old_price_eur: String(row.old_price_eur ?? ""),
    currency: row.currency ?? "EUR",
    availability: row.availability ?? "",
    style_tags: row.style_tags ?? "",
    image_url: row.image_url ?? "",
    mock_url: row.mock_url ?? "",
    notes: row.notes ?? "",
    motif: "",
    surface: "",
    visual_details: "",
    visual_description: "",
  };
}

export async function loadSearchProductsFromPostgres(databaseUrl) {
  const sql = postgres(databaseUrl, {
    connect_timeout: 10,
    idle_timeout: 5,
    max: 1,
    prepare: false,
    ssl: postgresSsl(databaseUrl),
  });
  try {
    const rows = await sql`
      select
        public_product_id, public_store_id, source_status, title, category,
        subcategory, brand, gender, color, size_options, price_eur,
        old_price_eur, currency, availability, style_tags, image_url,
        mock_url, notes
      from public.catalog_products
      order by public_product_id
    `;
    if (rows.length === 0) throw new Error("Supabase catalog is empty; refusing to replace the search index");
    return rows.map(mapCatalogProductForSearch);
  } finally {
    await sql.end({ timeout: 2 }).catch(() => undefined);
  }
}
