<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-30 | Updated: 2026-07-30 -->

# public

## Purpose

Static assets served by Next.js from the site root. Two large asset dumps live here: the synthetic demo-product photography (`demo-products/`) that backs the entire product catalog, and hero/keyframe imagery (`hero-assets/`) for landing-page visuals. Per repo policy (`docs/demo-product-imagery.md`), all imagery must be original/synthetic and non-branded — no real retailer photography, logos, or trademarks.

## Subdirectories

| Directory | File count (approx.) | Contents | Referenced by |
|---|---|---|---|
| `demo-products/` | ~321 (`.png` + `.webp`) | Synthetic product photography, 3 variants per product: `product-NN.png`/`.webp` (primary), `product-NN-tryon.webp` (detail/try-on view), `product-NN-catalog.png` (local-only catalog master, not deployed — see below). Also contains its own `README.md`. | `lib/mock-products.ts` via `image_path` / `detail_image_path`, resolved against `data/mock_products.csv` |
| `hero-assets/` | 18 (`.png`) | Landing-page hero/keyframe candidate imagery — fabric-mannequin and "wardrobe keyframe" reference-set renders, including several iterative `-v2`/`-v3`/`-v4`/`-regenerated`/`-corrected` variants of the same concept. | **Not currently referenced by any code** (verified: no match for `hero-assets` across `.ts`/`.tsx`/`.css` or anywhere else in the repo) — these appear to be in-progress/staged imagery for a hero visual feature, several added as untracked files in the current working tree, not yet wired into `components/cinematic-hero.tsx` or `app/globals.css`. |

Individual asset filenames within these two directories are not enumerated further here — treat them as an asset pool, not individually documented files.

### `demo-products/` naming pattern and fallback behavior

- Pattern: `product-NN.webp` (or `.png`) = primary/catalog image, `product-NN-tryon.webp` = detail-page companion image, `product-NN-catalog.png` = a duplicate local-source master (per `docs/demo-product-imagery.md`, PNG masters and `-catalog` duplicates are "local source assets" excluded from deployment).
- `NN` is a zero-padded index that corresponds 1:1 to the row order in `data/mock_products.csv` (there are 64 product rows; expected range is `product-01` through `product-64`).
- `lib/mock-products.ts`'s `hasDemoProductImage(imagePath)` checks the path against the regex `/^\/demo-products\/product-\d+(?:-tryon)?\.(?:png|webp)$/` and then `fs.existsSync` against this directory. If a file is missing, the product card silently falls back to a category-based placeholder that keeps the same media dimensions — this is a designed graceful-degradation path, not an error state.
- `public/demo-products/README.md` (in-directory) reiterates the same naming convention and points to `docs/demo-product-imagery.md` for the full spec (4:5 portrait aspect ratio, 1600×2000 recommended working size, 800×1000 minimum delivery size, non-branded/original artwork only).

## For AI Agents

### Working In This Directory

- When adding a new demo product, add matching image files following the `product-NN[.png|.webp|-tryon.webp|-catalog.png]` pattern for the same `NN` used in the new `data/mock_products.csv` row — but it's not required for the product to render, since missing images fall back to placeholders (`hasDemoProductImage`).
- Never add real retailer/brand photography, logos, or scraped images here — this is a hard product/legal constraint (see `docs/demo-product-imagery.md` and `docs/legal/data_source_policy.md`).
- If you're asked to wire up `hero-assets/` imagery into the hero section, check `components/cinematic-hero.tsx` (currently text/CTA only, no `<img>`/background-image reference to these files) and `app/globals.css`'s `.discovery-hero` rules — as of this writing there is no existing integration to follow as a pattern, so this would be new work, not an update to an existing reference.
- Do not create separate `AGENTS.md` files inside `demo-products/` or `hero-assets/` — they are pure asset dumps documented here.

## Dependencies

### Internal

- `lib/mock-products.ts` — reads/checks `public/demo-products/*` via `hasDemoProductImage()` and builds `image_path`/`detail_image_path` for every product.
- `components/cinematic-hero.tsx` / `app/globals.css` — own the hero section markup and styling; do not currently reference `hero-assets/`.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
