# Demo product imagery

VIBEWEAR currently uses synthetic, non-branded placeholders. No real retailer or
brand imagery is permitted in the demo catalog.

## Expected files

- Directory: `public/demo-products/`
- Stable delivery filenames: `product-01.webp` through `product-64.webp`
- Public paths: `/demo-products/product-01.webp` through
  `/demo-products/product-64.webp`
- Product-detail companion images: `product-01-tryon.webp` through
  `product-64-tryon.webp`
- Original PNG masters and the duplicate `-catalog` variants remain local
  source assets and are excluded from deployment.
- The filename number matches the corresponding row in
  `data/mock_products.csv`.

The app checks whether each expected file exists. When a file is absent, the
product card keeps the same media dimensions and shows a polished category-based
placeholder instead.

## Recommended specification

- Original, synthetic, and non-branded artwork only
- No retailer photos, logos, trademarks, copied product photography, or scraped
  assets
- Portrait aspect ratio: **4:5**
- Recommended working size: **1600 × 2000 px**
- Minimum delivery size: **800 × 1000 px**
- WebP in sRGB; target **80–85 quality** and a file size below **350 KB** when
  practical
- Keep the garment or accessory centered with enough negative space for
  responsive cropping
- Avoid text baked into the image
- Keep generation/source records and usage-rights notes alongside the content
  production log before files are published

## Accessibility and layout

Product cards and detail galleries reserve a 4:5 frame to prevent layout shift
and contain the complete image without cropping landscape accessories. Every
product detail page pairs the isolated product image with its `-tryon` styled
view. Image alt text is assembled from the neutral product title, localized
category, and neutral store label. Missing images use an accessible
category-based placeholder rather than a remote fallback.
