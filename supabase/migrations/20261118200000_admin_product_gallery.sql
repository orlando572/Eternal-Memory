-- TSK-19: save the whole product gallery (order, cover, alt text) atomically.
-- The first image (sort_order 0) is the cover. Existing rows keep their file;
-- replacing an image means removing it and adding a new upload in its place.
create or replace function public.save_admin_product_with_images(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_id uuid;
  gallery jsonb;
  item jsonb;
  pos bigint;
  current_ids uuid[];
  expected_ids uuid[];
  kept_ids uuid[];
  image_path text;
begin
  -- Checks the administrator role, locks the product and validates versions.
  -- Any image error below rolls back the product and variant writes too.
  saved_id := public.save_admin_product(payload);
  if not (payload ? 'images') then return saved_id; end if;

  gallery := payload->'images';
  if jsonb_typeof(gallery) <> 'object'
    or jsonb_typeof(gallery->'original_ids') <> 'array'
    or jsonb_typeof(gallery->'items') <> 'array'
    or jsonb_array_length(gallery->'items') > 10 then
    raise exception using errcode = '22023', message = 'INVALID_IMAGE';
  end if;

  perform 1 from public.product_images where product_id = saved_id for update;
  select coalesce(array_agg(i.id order by i.id), '{}') into current_ids
  from public.product_images i where i.product_id = saved_id;
  select coalesce(array_agg(t.value::uuid order by t.value::uuid), '{}') into expected_ids
  from jsonb_array_elements_text(gallery->'original_ids') t;
  if current_ids is distinct from expected_ids then
    raise exception using errcode = 'P0001', message = 'IMAGE_CONFLICT';
  end if;

  select coalesce(array_agg((t.value->>'id')::uuid), '{}') into kept_ids
  from jsonb_array_elements(gallery->'items') t
  where jsonb_typeof(t.value) = 'object' and t.value->>'id' is not null;
  if exists (select 1 from unnest(kept_ids) k where not (k = any(current_ids)))
    or cardinality(kept_ids) <> (select count(distinct k) from unnest(kept_ids) k) then
    raise exception using errcode = '22023', message = 'INVALID_IMAGE';
  end if;

  delete from public.product_images
  where product_id = saved_id and not (id = any(kept_ids));

  for item, pos in
    select t.value, t.ord - 1 from jsonb_array_elements(gallery->'items') with ordinality t(value, ord) order by t.ord
  loop
    if jsonb_typeof(item) <> 'object'
      or length(coalesce(item->>'alt_text', '')) > 1000
      or coalesce(item->>'is_reference', '') not in ('true', 'false') then
      raise exception using errcode = '22023', message = 'INVALID_IMAGE';
    end if;

    if item->>'id' is not null then
      update public.product_images
      set alt_text = nullif(btrim(item->>'alt_text'), ''),
        is_reference = (item->>'is_reference')::boolean,
        sort_order = pos
      where id = (item->>'id')::uuid;
    else
      image_path := nullif(item->>'storage_path', '');
      if image_path is null or not exists (
        select 1 from storage.objects where bucket_id = 'product-images' and name = image_path
      ) then
        raise exception using errcode = '22023', message = 'IMAGE_UPLOAD_MISSING';
      end if;
      insert into public.product_images (product_id, storage_path, external_url, alt_text, is_reference, sort_order)
      values (saved_id, image_path, null, nullif(btrim(item->>'alt_text'), ''), (item->>'is_reference')::boolean, pos);
    end if;
  end loop;
  return saved_id;
end;
$$;
revoke all on function public.save_admin_product_with_images(jsonb) from public, anon;
grant execute on function public.save_admin_product_with_images(jsonb) to authenticated;
