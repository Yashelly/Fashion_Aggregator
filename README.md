# Fashion Aggregator

Pre-affiliate Next.js foundation for a visual fashion discovery/search MVP.

## Current Mode

- Uses synthetic demo products from `data/mock_products.csv`.
- No live retailer catalog is displayed.
- Live products should come only from approved affiliate feeds or direct merchant permission.

## First-Wave Affiliate Targets

- Reserved LT
- Sinsay LT
- Sizeer LT
- MODIVO LT

See `data/store_tracker.csv`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` when Supabase is created:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Do not commit `.env.local`.

## Database

Initial schema:

```text
sql/001_pre_affiliate_schema.sql
```

## Important Rule

Do not mark a store as live or display real merchant products until approved feed access or direct permission exists.

