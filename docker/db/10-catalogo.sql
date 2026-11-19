-- Datos de prueba del catálogo y la administración (TSK-45). Solo para la base de datos local de
-- `docker compose`: `db-migrate` lo aplica como `postgres`, después de las migraciones y en una
-- sola transacción. Es idempotente: puede repetirse sin duplicar nada.
--
-- No crea productos: publica los 48 de muestra que ya traen las migraciones
-- (20261020220720_sample_catalog_drafts.sql), con sus nombres, opciones, precios e imágenes
-- referenciales sin cambios. Las existencias y los destacados son de prueba, no inventario real.

-- 1. Administrador de prueba. Las credenciales están documentadas en docker/README.md y no son
--    reales. La contraseña se guarda cifrada con bcrypt, como hace Supabase Auth.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-4000-8000-000000000045',
  'authenticated',
  'authenticated',
  'admin@eternal-memory.local',
  extensions.crypt('EternalAdmin2026!', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Administración de prueba"}',
  now(),
  now()
)
on conflict (id) do nothing;

-- El trigger `on_auth_user_created` ya creó su perfil; esto lo asegura si el usuario existía antes.
insert into public.profiles (id, full_name)
values ('00000000-0000-4000-8000-000000000045', 'Administración de prueba')
on conflict (id) do nothing;

insert into public.staff_roles (user_id, role)
values ('00000000-0000-4000-8000-000000000045', 'admin')
on conflict (user_id) do nothing;

-- 2. Catálogo publicado: los productos de muestra en borrador de las cuatro categorías.
update public.products p
set status = 'published'
from public.categories c
where c.id = p.category_id
  and c.slug in ('urnas', 'ataudes', 'relicarios', 'arreglos-florales')
  and p.status = 'draft';

-- 3. Existencias de prueba para poder elegir variante y probar el checkout en local.
update public.product_variants v
set stock_on_hand = 10
from public.products p
where p.id = v.product_id
  and p.status = 'published'
  and v.is_active
  and v.stock_on_hand = 0;

-- 4. Destacados de la portada: dos por categoría.
update public.products
set is_featured = true
where slug in (
  'urna-serenidad-bronce', 'urna-marmol-silencioso',
  'ataud-roble-clasico', 'ataud-cedro-imperial',
  'relicario-petalo-bronce', 'relicario-cofre-cedro',
  'corona-botanica-romero', 'centro-orquideas-lirios'
)
  and not is_featured;
