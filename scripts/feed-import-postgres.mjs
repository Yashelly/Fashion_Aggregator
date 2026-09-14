import postgres from "postgres";
import { classifyProductChange, variantIdentity } from "./feed-import-core.mjs";

function postgresSsl(databaseUrl) {
  const host = new URL(databaseUrl).hostname;
  return new Set(["127.0.0.1", "::1", "localhost"]).has(host) ? false : "require";
}

export function assertStoreCanImport(store, sourceType) {
  if (store.feed_status === "paused" || store.affiliate_status === "blocked") {
    throw new Error(`Store ${store.slug} is paused or blocked`);
  }
  if (sourceType === "affiliate_feed") {
    if (store.affiliate_status !== "approved_feed") {
      throw new Error(`Store ${store.slug} is not approved for affiliate feeds`);
    }
    if (!new Set(["available_verified", "importing"]).has(store.feed_status)) {
      throw new Error(`Store ${store.slug} does not have a verified feed`);
    }
  } else if (sourceType === "direct_partner_feed") {
    if (store.affiliate_status !== "direct_permission") {
      throw new Error(`Store ${store.slug} does not have direct partner permission`);
    }
  } else if (sourceType === "manual_mock") {
    if (store.public_listing_status !== "demo") {
      throw new Error(`Store ${store.slug} is not a demo store`);
    }
  } else {
    throw new Error(`Unsupported source type: ${sourceType}`);
  }
}

export function assertProgramRules(rules, sourceType, rows) {
  if (sourceType === "manual_mock") return;
  if (!rules) throw new Error("Affiliate program rules are missing for this store");
  if (sourceType === "affiliate_feed" && !rules.product_feed_available) {
    throw new Error("Affiliate program rules do not allow a product feed");
  }
  if (rules.content_allowed === false) {
    throw new Error("Affiliate program rules do not allow product content");
  }
  const hasAffiliateLinks = rows.some((row) =>
    new Set(["valid", "warning"]).has(row.validationStatus)
    && row.normalizedPayload.affiliate_url,
  );
  if (hasAffiliateLinks && !rules.deeplinking_allowed) {
    throw new Error("Affiliate program rules do not allow deeplinking");
  }
}

function productStatus(row, sourceType) {
  if (sourceType === "manual_mock" && row.normalizedPayload.in_stock) return "demo";
  const status = row.normalizedPayload.status;
  return new Set(["active", "out_of_stock", "removed", "blocked", "demo"]).has(status)
    ? status
    : "active";
}

function availabilityForProduct(product) {
  if (product.status === "unknown") return "unknown";
  return product.status;
}

export async function applyImportPlan({
  databaseUrl,
  fullSnapshot,
  plan,
  sourceFormat,
  sourceLabel,
  sourceType,
  storeSlug,
}) {
  if (!plan.summary.canApply) {
    throw new Error("Import plan is not safe to apply; fix dry-run validation errors first");
  }
  const sql = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    ssl: postgresSsl(databaseUrl),
  });
  let runId;

  try {
    const [store] = await sql`
      select id, slug, affiliate_status, feed_status, public_listing_status
      from public.stores
      where slug = ${storeSlug}
      limit 1
    `;
    if (!store) throw new Error(`Unknown store slug: ${storeSlug}`);
    assertStoreCanImport(store, sourceType);

    const [rules] = sourceType === "manual_mock" ? [] : await sql`
      select product_feed_available, deeplinking_allowed, content_allowed
      from public.affiliate_program_rules
      where store_id = ${store.id}
      order by last_verified_at desc nulls last, updated_at desc
      limit 1
    `;
    assertProgramRules(rules, sourceType, plan.rows);

    const [run] = await sql`
      insert into public.feed_import_runs (
        store_id, source_type, source_format, source_url, feed_hash,
        status, is_full_snapshot, total_rows, error_count, warning_count
      ) values (
        ${store.id}, ${sourceType}, ${sourceFormat}, ${sourceLabel}, ${plan.feedHash},
        'started', ${fullSnapshot}, ${plan.summary.totalRows},
        ${plan.summary.invalidRows}, ${plan.summary.warningRows + plan.summary.skippedRows}
      ) returning id
    `;
    runId = run.id;

    const counters = await sql.begin(async (transaction) => {
      const result = { inserted: 0, outOfStock: 0, unchanged: 0, updated: 0 };
      const seenVariantKeys = new Map();
      const seenProductIds = new Set();
      const seenOfferProducts = new Set();
      await transaction`
        select pg_advisory_xact_lock(hashtextextended(${store.id}::text, 0))
      `;
      for (const row of plan.rows) {
        const [rawItem] = await transaction`
          insert into public.raw_feed_items (
            import_run_id, store_id, row_number, external_product_id,
            raw_payload, normalized_payload, raw_hash, validation_status, validation_errors
          ) values (
            ${runId}, ${store.id}, ${row.rowNumber},
            ${row.normalizedPayload.external_product_id || null},
            ${JSON.stringify(row.rawPayload)}::jsonb,
            ${JSON.stringify(row.normalizedPayload)}::jsonb,
            ${row.rawHash}, ${row.validationStatus},
            ${JSON.stringify(row.validationErrors)}::jsonb
          ) returning id
        `;
        const product = row.normalizedPayload;
        if (row.validationStatus === "invalid") continue;
        const [existing] = await transaction`
          select id, content_hash
          from public.products
          where store_id = ${store.id} and external_product_id = ${product.external_product_id}
          for update
        `;
        if (row.validationStatus === "skipped") {
          if (existing) {
            await transaction`
              update public.products set
                status = 'blocked', in_stock = false, availability = 'skipped_current_feed_row',
                raw_hash = ${row.rawHash}, last_seen_at = now(), last_import_run_id = ${runId}
              where id = ${existing.id}
            `;
            await transaction`
              update public.raw_feed_items set product_id = ${existing.id} where id = ${rawItem.id}
            `;
            result.updated += 1;
          }
          continue;
        }
        const change = classifyProductChange(existing?.content_hash, row.contentHash);
        let productId;

        if (!existing) {
          const [created] = await transaction`
            insert into public.products (
              store_id, external_product_id, source_sku, title, brand, description,
              merchant_category, normalized_category, subcategory, gender, color_label, normalized_color,
              material, style_tags, product_url, affiliate_url, image_url, currency, price, sale_price,
              old_price, availability, in_stock, size_summary, status, raw_hash, content_hash,
              last_import_run_id
            ) values (
              ${store.id}, ${product.external_product_id}, ${product.source_sku || null},
              ${product.title}, ${product.brand || null}, ${product.description || null},
              ${product.merchant_category || null}, ${product.normalized_category || null},
              ${product.subcategory || null},
              ${product.gender || null}, ${product.color_label || null},
              ${product.normalized_color || null}, ${product.material || null},
              ${product.style_tags || null},
              ${product.product_url || null}, ${product.affiliate_url || null},
              ${product.image_url || null}, ${product.currency}, ${product.price},
              ${product.sale_price}, ${product.old_price}, ${availabilityForProduct(product) || null},
              ${product.in_stock}, ${product.size_summary || null},
              ${productStatus(row, sourceType)}, ${row.rawHash}, ${row.contentHash}, ${runId}
            ) returning id
          `;
          productId = created.id;
        } else if (change === "updated") {
          productId = existing.id;
          await transaction`
            update public.products set
              source_sku = ${product.source_sku || null}, title = ${product.title},
              brand = ${product.brand || null}, description = ${product.description || null},
              merchant_category = ${product.merchant_category || null},
              normalized_category = ${product.normalized_category || null},
              subcategory = ${product.subcategory || null},
              gender = ${product.gender || null}, color_label = ${product.color_label || null},
              normalized_color = ${product.normalized_color || null}, material = ${product.material || null},
              style_tags = ${product.style_tags || null},
              product_url = ${product.product_url || null}, affiliate_url = ${product.affiliate_url || null},
              image_url = ${product.image_url || null}, currency = ${product.currency},
              price = ${product.price}, sale_price = ${product.sale_price}, old_price = ${product.old_price},
              availability = ${availabilityForProduct(product) || null}, in_stock = ${product.in_stock},
              size_summary = ${product.size_summary || null}, status = ${productStatus(row, sourceType)},
              raw_hash = ${row.rawHash}, content_hash = ${row.contentHash},
              last_seen_at = now(), last_import_run_id = ${runId}
            where id = ${existing.id}
          `;
        } else {
          productId = existing.id;
          await transaction`
            update public.products set
              availability = ${availabilityForProduct(product) || null}, in_stock = ${product.in_stock},
              status = ${productStatus(row, sourceType)}, raw_hash = ${row.rawHash},
              last_seen_at = now(), last_import_run_id = ${runId}
            where id = ${existing.id}
          `;
        }

        await transaction`
          update public.raw_feed_items set product_id = ${productId} where id = ${rawItem.id}
        `;
        seenProductIds.add(productId);

        if (row.isVariant) {
          const variantKey = variantIdentity(product);
          const keys = seenVariantKeys.get(productId) ?? new Set();
          keys.add(variantKey);
          seenVariantKeys.set(productId, keys);
          await transaction`
            insert into public.product_variants (
              product_id, external_variant_id, item_group_id, sku, gtin,
              size_system, size_label, normalized_size, color_label, normalized_color,
              currency, price, sale_price, old_price, availability, in_stock,
              product_url, affiliate_url, image_urls, source_observed_at,
              raw_payload, raw_hash, variant_key, last_seen_at
            ) values (
              ${productId}, ${product.external_variant_id || null}, ${product.item_group_id || null},
              ${product.variant_sku || null}, ${product.variant_gtin || null},
              ${product.size_system || null}, ${product.variant_size || null},
              ${product.normalized_variant_size || null}, ${product.variant_color || null},
              ${product.normalized_variant_color || null}, ${product.variant_currency},
              ${product.variant_price}, ${product.variant_sale_price}, ${product.variant_old_price},
              ${product.variant_availability}, ${product.variant_in_stock},
              ${product.product_url || null}, ${product.affiliate_url || null},
              ${product.variant_image_urls}::text[], ${product.source_observation_at},
              ${JSON.stringify(row.rawPayload)}::jsonb, ${row.rawHash}, ${variantKey}, now()
            )
            on conflict (product_id, variant_key) do update set
              external_variant_id = excluded.external_variant_id,
              item_group_id = excluded.item_group_id,
              sku = excluded.sku,
              gtin = excluded.gtin,
              size_system = excluded.size_system,
              size_label = excluded.size_label,
              normalized_size = excluded.normalized_size,
              color_label = excluded.color_label,
              normalized_color = excluded.normalized_color,
              currency = excluded.currency,
              price = excluded.price,
              sale_price = excluded.sale_price,
              old_price = excluded.old_price,
              availability = excluded.availability,
              in_stock = excluded.in_stock,
              product_url = excluded.product_url,
              affiliate_url = excluded.affiliate_url,
              image_urls = excluded.image_urls,
              source_observed_at = excluded.source_observed_at,
              raw_payload = excluded.raw_payload,
              raw_hash = excluded.raw_hash,
              last_seen_at = now()
          `;
        }

        if (product.has_offer_terms) {
          seenOfferProducts.add(productId);
          await transaction`
            insert into public.retailer_offer_terms (
              store_id, product_id, delivers_to_lithuania,
              delivery_price_eur, free_delivery_threshold_eur,
              delivery_min_days, delivery_max_days, return_window_days,
              return_payer, return_cost, policy_url, last_checked_at
            ) values (
              ${store.id}, ${productId}, ${product.offer_delivers_to_lithuania},
              ${product.offer_delivery_price_eur}, ${product.offer_free_delivery_threshold_eur},
              ${product.offer_delivery_min_days}, ${product.offer_delivery_max_days},
              ${product.offer_return_window_days}, ${product.offer_return_payer || null},
              ${product.offer_return_cost}, ${product.offer_policy_url || null},
              ${product.offer_last_checked_at}
            )
            on conflict (store_id, product_id) do update set
              delivers_to_lithuania = excluded.delivers_to_lithuania,
              delivery_price_eur = excluded.delivery_price_eur,
              free_delivery_threshold_eur = excluded.free_delivery_threshold_eur,
              delivery_min_days = excluded.delivery_min_days,
              delivery_max_days = excluded.delivery_max_days,
              return_window_days = excluded.return_window_days,
              return_payer = excluded.return_payer,
              return_cost = excluded.return_cost,
              policy_url = excluded.policy_url,
              last_checked_at = excluded.last_checked_at,
              updated_at = now()
          `;
        }
        result[change] += 1;
      }

      if (fullSnapshot) {
        for (const [productId, keys] of seenVariantKeys) {
          await transaction`
            delete from public.product_variants
            where product_id = ${productId}
              and not (variant_key = any(${[...keys]}::text[]))
          `;
        }
        for (const productId of seenProductIds) {
          if (!seenOfferProducts.has(productId)) {
            await transaction`
              delete from public.retailer_offer_terms
              where product_id = ${productId} and store_id = ${store.id}
            `;
          }
        }
      }

      if (fullSnapshot) {
        const missing = await transaction`
          update public.products set
            status = 'out_of_stock', in_stock = false,
            availability = 'missing_from_full_snapshot', content_hash = null
          where store_id = ${store.id}
            and last_import_run_id is distinct from ${runId}
            and status in ('active', 'demo')
          returning id
        `;
        result.outOfStock = missing.length;
      }

      await transaction`
        update public.feed_import_runs set
          status = 'completed', completed_at = now(),
          inserted_count = ${result.inserted}, updated_count = ${result.updated},
          unchanged_count = ${result.unchanged}, out_of_stock_count = ${result.outOfStock},
          notes = 'Validated by generic Weft feed importer; enrichment runs separately.'
        where id = ${runId}
      `;
      return result;
    });

    return { importRunId: runId, ...counters };
  } catch (error) {
    if (runId) {
      await sql`
        update public.feed_import_runs set
          status = 'failed', completed_at = now(), error_message = ${String(error.message).slice(0, 500)}
        where id = ${runId}
      `.catch(() => undefined);
    }
    throw error;
  } finally {
    await sql.end();
  }
}
