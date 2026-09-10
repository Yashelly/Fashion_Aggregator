begin;

create schema if not exists extensions;
create extension if not exists vector with schema extensions;

create table if not exists public.search_product_documents (
  product_id text not null,
  embedding_model text not null,
  embedding_dimensions integer not null check (embedding_dimensions = 1024),
  source_hash text not null,
  searchable_text text not null,
  terms text[] not null default '{}',
  department text not null,
  category text not null,
  subcategory text not null,
  color text not null,
  price_eur numeric(12, 2) not null check (price_eur >= 0),
  availability text not null,
  is_public boolean not null default true,
  embedding extensions.vector(1024) not null,
  fts tsvector generated always as (
    to_tsvector('simple', searchable_text)
  ) stored,
  generated_at timestamptz not null default now(),
  primary key (product_id, embedding_model)
);

comment on table public.search_product_documents is
  'Public product retrieval documents. Embeddings are regenerated from source_hash; product facts remain canonical outside this index.';

create index if not exists idx_search_product_documents_embedding_hnsw
  on public.search_product_documents
  using hnsw (embedding extensions.vector_cosine_ops)
  where is_public;

create index if not exists idx_search_product_documents_fts
  on public.search_product_documents using gin (fts);

create index if not exists idx_search_product_documents_terms
  on public.search_product_documents using gin (terms);

create index if not exists idx_search_product_documents_filters
  on public.search_product_documents (embedding_model, is_public, department, category, color, price_eur);

alter table public.search_product_documents enable row level security;

revoke all privileges on table public.search_product_documents from anon, authenticated;
grant select on table public.search_product_documents to anon, authenticated;

drop policy if exists "Public search documents are readable" on public.search_product_documents;
create policy "Public search documents are readable"
  on public.search_product_documents
  for select
  to anon, authenticated
  using (is_public);

create or replace function public.match_search_products(
  p_query_embedding extensions.vector(1024),
  p_embedding_model text,
  p_match_count integer default 64,
  p_product_ids text[] default null,
  p_min_price numeric default null,
  p_max_price numeric default null,
  p_availability text default null,
  p_departments text[] default null,
  p_colors text[] default null,
  p_garment_terms text[] default null,
  p_excluded_terms text[] default null
)
returns table (
  product_id text,
  similarity double precision
)
language sql
stable
security invoker
set search_path = pg_catalog, public, extensions
as $$
  select
    document.product_id,
    1 - (document.embedding <=> p_query_embedding) as similarity
  from public.search_product_documents as document
  where document.is_public
    and document.embedding_model = p_embedding_model
    and (p_product_ids is null or document.product_id = any(p_product_ids))
    and (p_min_price is null or document.price_eur >= p_min_price)
    and (p_max_price is null or document.price_eur <= p_max_price)
    and (p_availability is null or document.availability = p_availability)
    and (p_departments is null or document.terms && p_departments)
    and (p_colors is null or document.terms && p_colors)
    and (p_garment_terms is null or document.terms && p_garment_terms)
    and (p_excluded_terms is null or not (document.terms && p_excluded_terms))
  order by document.embedding <=> p_query_embedding, document.product_id
  limit least(greatest(p_match_count, 1), 100);
$$;

revoke all on function public.match_search_products(
  extensions.vector, text, integer, text[], numeric, numeric, text, text[], text[], text[], text[]
) from public;

grant execute on function public.match_search_products(
  extensions.vector, text, integer, text[], numeric, numeric, text, text[], text[], text[], text[]
) to anon, authenticated;

commit;
