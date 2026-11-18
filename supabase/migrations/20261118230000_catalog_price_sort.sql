-- TSK-36: lowest active variant price as a PostgREST computed field, so the
-- public catalog can sort and filter by price inside its paginated query
-- (`order=price_from_pen.asc`, `price_from_pen=gte.100`).
-- Security invoker keeps the caller's RLS: anonymous visitors only reach active
-- variants of published products, exactly like the catalog listing itself.
-- Products without active variants return null and are sorted last.
create or replace function public.price_from_pen(catalog_product public.products)
returns numeric
language sql
stable
security invoker
set search_path = ''
as $$
  select min(v.price_pen)
  from public.product_variants v
  where v.product_id = catalog_product.id
    and v.is_active;
$$;

revoke all on function public.price_from_pen(public.products) from public, anon, authenticated;
grant execute on function public.price_from_pen(public.products) to anon, authenticated, service_role;

-- Supports the per-product minimum over active variants.
create index if not exists variants_active_price_idx
  on public.product_variants (product_id, price_pen)
  where is_active;
