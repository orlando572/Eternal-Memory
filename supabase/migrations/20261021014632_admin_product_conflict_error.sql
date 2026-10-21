-- P0001 avoids PostgREST infinite retries on explicit 40001 conflicts.
create or replace function public.save_admin_product(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_variable
declare
  product_id uuid;
  category_id uuid;
  old_product public.products%rowtype;
  item jsonb;
  existing_variant public.product_variants%rowtype;
  variant_id uuid;
  product_status text;
  product_slug text;
  product_name text;
  variant_name text;
  variant_sku text;
  variant_price numeric;
  variant_stock integer;
  variant_active boolean;
  active_count integer := 0;
  supplied_count integer := 0;
  seen_names text[] := '{}';
  seen_skus text[] := '{}';
  pos integer := 0;
begin
  if auth.uid() is null or not exists (
    select 1 from public.staff_roles s
    where s.user_id = auth.uid() and s.role = 'admin'
  ) then
    raise exception using errcode = '42501', message = 'ADMIN_REQUIRED';
  end if;

  if payload is null or jsonb_typeof(payload) <> 'object'
    or jsonb_typeof(payload->'variants') <> 'array'
    or jsonb_array_length(payload->'variants') > 100 then
    raise exception using errcode = '22023', message = 'INVALID_PRODUCT';
  end if;

  product_name := btrim(payload->>'name');
  product_slug := payload->>'slug';
  product_status := payload->>'status';
  if product_name is null or product_name = '' or length(product_name) > 200
    or product_status not in ('draft', 'published', 'archived') or product_status is null then
    raise exception using errcode = '22023', message = 'INVALID_PRODUCT';
  end if;

  if payload->>'id' is not null then
    product_id := (payload->>'id')::uuid;
    select * into old_product from public.products where id = product_id for update;
    if not found then raise exception using errcode = 'P0002', message = 'PRODUCT_NOT_FOUND'; end if;
    if old_product.updated_at <> (payload->>'updated_at')::timestamptz then
      raise exception using errcode = 'P0001', message = 'PRODUCT_CONFLICT';
    end if;
    if old_product.slug <> product_slug then
      raise exception using errcode = '22023', message = 'SLUG_IMMUTABLE';
    end if;
    if old_product.status = 'archived' and product_status <> 'draft' then
      raise exception using errcode = '22023', message = 'RESTORE_AS_DRAFT_FIRST';
    end if;
  elsif product_slug is null or product_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception using errcode = '22023', message = 'INVALID_SLUG';
  end if;

  select c.id into category_id from public.categories c
  where c.id = (payload->>'category_id')::uuid
    and (product_status <> 'published' or c.is_active)
  for share;
  if category_id is null then
    raise exception using errcode = '22023', message = 'CATEGORY_UNAVAILABLE';
  end if;

  -- Lock every saved variant and require the submitted set to match. This also
  -- catches a concurrent addition, even when only variants were changed.
  if product_id is not null then
    for existing_variant in
      select * from public.product_variants where public.product_variants.product_id = product_id order by id for update
    loop
      supplied_count := supplied_count + 1;
      select value into item from jsonb_array_elements(payload->'variants') value
      where value->>'id' = existing_variant.id::text;
      if item is null or (item->>'updated_at')::timestamptz <> existing_variant.updated_at then
        raise exception using errcode = 'P0001', message = 'VARIANT_CONFLICT';
      end if;
    end loop;
    if (select count(*) from jsonb_array_elements(payload->'variants') value
        where value->>'id' is not null) <> supplied_count then
      raise exception using errcode = 'P0001', message = 'VARIANT_CONFLICT';
    end if;
  end if;

  for item in select value from jsonb_array_elements(payload->'variants') value
  loop
    pos := pos + 1;
    variant_name := btrim(item->>'name');
    variant_sku := nullif(btrim(item->>'sku'), '');
    if variant_name is null or variant_name = '' or length(variant_name) > 200
      or (variant_sku is not null and length(variant_sku) > 100)
      or lower(variant_name) = any(seen_names)
      or (variant_sku is not null and lower(variant_sku) = any(seen_skus)) then
      raise exception using errcode = '22023', message = 'INVALID_VARIANT';
    end if;
    seen_names := array_append(seen_names, lower(variant_name));
    if variant_sku is not null then seen_skus := array_append(seen_skus, lower(variant_sku)); end if;
    if item->>'price_pen' !~ '^[0-9]+(\.[0-9]{1,2})?$'
      or item->>'stock_on_hand' !~ '^[0-9]+$'
      or item->>'is_active' not in ('true', 'false') then
      raise exception using errcode = '22023', message = 'INVALID_VARIANT';
    end if;
    variant_price := (item->>'price_pen')::numeric;
    if variant_price > 9999999999.99 or length(item->>'stock_on_hand') > 10 then
      raise exception using errcode = '22023', message = 'INVALID_VARIANT';
    end if;
    variant_stock := (item->>'stock_on_hand')::integer;
    variant_active := (item->>'is_active')::boolean;
    if product_status = 'published' and variant_active then
      if variant_price <= 0 then
        raise exception using errcode = '22023', message = 'ACTIVE_PRICE_REQUIRED';
      end if;
      active_count := active_count + 1;
    end if;
    if item->>'id' is not null then
      select * into existing_variant from public.product_variants
      where id = (item->>'id')::uuid and public.product_variants.product_id = product_id;
      if not found then raise exception using errcode = 'P0001', message = 'VARIANT_CONFLICT'; end if;
      if variant_stock < existing_variant.stock_reserved then
        raise exception using errcode = '22023', message = 'STOCK_RESERVED',
          detail = existing_variant.stock_reserved::text;
      end if;
    end if;
  end loop;

  if product_status = 'published' and active_count = 0 then
    raise exception using errcode = '22023', message = 'ACTIVE_VARIANT_REQUIRED';
  end if;

  if product_id is null then
    insert into public.products (category_id, slug, name, description, status)
    values (category_id, product_slug, product_name, nullif(btrim(payload->>'description'), ''), product_status)
    returning id into product_id;
  else
    update public.products
    set category_id = category_id, name = product_name,
      description = nullif(btrim(payload->>'description'), ''), status = product_status
    where id = product_id;
  end if;

  pos := 0;
  for item in select value from jsonb_array_elements(payload->'variants') value
  loop
    pos := pos + 1;
    if item->>'id' is null then
      insert into public.product_variants
        (product_id, name, sku, price_pen, stock_on_hand, is_active, sort_order)
      values
        (product_id, btrim(item->>'name'), nullif(btrim(item->>'sku'), ''),
         (item->>'price_pen')::numeric, (item->>'stock_on_hand')::integer,
         (item->>'is_active')::boolean, pos - 1);
    else
      variant_id := (item->>'id')::uuid;
      update public.product_variants
      set name = btrim(item->>'name'), sku = nullif(btrim(item->>'sku'), ''),
        price_pen = (item->>'price_pen')::numeric,
        stock_on_hand = (item->>'stock_on_hand')::integer,
        is_active = (item->>'is_active')::boolean, sort_order = pos - 1
      where id = variant_id and public.product_variants.product_id = product_id;
    end if;
  end loop;
  return product_id;
end;
$$;
