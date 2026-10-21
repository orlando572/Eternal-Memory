-- Keep visually equivalent variant names unique within one product.
create unique index product_variants_normalized_name_unique
  on public.product_variants (product_id, lower(regexp_replace(btrim(name), '[[:space:]]+', ' ', 'g')));
