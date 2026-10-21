-- Keep the existing product/variant validation and add atomic cover image edits.
create or replace function public.save_admin_product_with_image(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_id uuid;
  current_image public.product_images%rowtype;
  image jsonb;
  image_path text;
  image_url text;
begin
  -- The existing function checks the administrator role, locks the product and
  -- validates optimistic versions. Any image error rolls back its writes too.
  saved_id := public.save_admin_product(payload);
  if not (payload ? 'cover') then return saved_id; end if;

  select * into current_image from public.product_images
  where product_id = saved_id order by sort_order, id limit 1 for update;
  if current_image.id is distinct from (payload->'cover'->>'original_id')::uuid then
    raise exception using errcode = 'P0001', message = 'IMAGE_CONFLICT';
  end if;

  image := payload->'cover'->'image';
  if image = 'null'::jsonb then
    delete from public.product_images where id = current_image.id;
    return saved_id;
  end if;
  if image is null or jsonb_typeof(image) <> 'object'
    or length(coalesce(image->>'alt_text', '')) > 1000
    or coalesce(image->>'is_reference', '') not in ('true', 'false') then
    raise exception using errcode = '22023', message = 'INVALID_IMAGE';
  end if;
  image_path := nullif(image->>'storage_path', '');
  image_url := nullif(image->>'external_url', '');
  if (image_path is null) = (image_url is null) then
    raise exception using errcode = '22023', message = 'INVALID_IMAGE';
  end if;
  -- Existing external sources may be retained, but this form only adds files.
  if image_url is not null and image_url is distinct from current_image.external_url then
    raise exception using errcode = '22023', message = 'INVALID_IMAGE';
  end if;
  if image_path is not null and not exists (
    select 1 from storage.objects where bucket_id = 'product-images' and name = image_path
  ) then
    raise exception using errcode = '22023', message = 'IMAGE_UPLOAD_MISSING';
  end if;

  if current_image.id is null then
    insert into public.product_images (product_id, storage_path, external_url, alt_text, is_reference, sort_order)
    values (saved_id, image_path, image_url, nullif(btrim(image->>'alt_text'), ''), (image->>'is_reference')::boolean, 0);
  else
    update public.product_images
    set storage_path = image_path, external_url = image_url,
      alt_text = nullif(btrim(image->>'alt_text'), ''), is_reference = (image->>'is_reference')::boolean
    where id = current_image.id;
  end if;
  return saved_id;
end;
$$;
revoke all on function public.save_admin_product_with_image(jsonb) from public, anon;
grant execute on function public.save_admin_product_with_image(jsonb) to authenticated;
