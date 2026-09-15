# Changes

The implementation is intentionally local to the existing Next.js/React design and synthetic catalog boundary.

- `components/product-detail-view.tsx`: moved the mobile product summary and preview action before the gallery; added controlled facts, chip rendering, one unknown-size note, and removed process-language provenance from the normal facts block.
- `lib/product-presentation.ts`: added the presentation-layer mapping for controlled material, surface, and construction tokens, including explicit negative values.
- `lib/i18n.ts`: added EN/LT subcategory/material/fact labels and homepage search copy; preserved internal taxonomy keys and canonical locale URL behavior.
- `lib/public-product.ts`: carried `subcategory` through the allowlisted public DTOs.
- `components/product-grid.tsx`: renders trustworthy product-specific category labels.
- `app/page.tsx` and `app/globals.css`: expose the hero search/examples and support the compact mobile PDP hierarchy/fact chips without global overflow hiding.
- `scripts/*.py` and `scripts/public-product.test.mjs`: updated behavioral checks to current UI contracts and added `scripts/post_audit_regression.py`.
- Removed a temporary fitting-room debug print after verification.

No database schema, RLS, billing, secrets, external credentials, merchant redirects, or new dependency was added.

