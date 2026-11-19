-- Tablas del servicio Storage de Supabase que la imagen `supabase/postgres` NO trae.
--
-- En Supabase las crea el servicio Storage, que este compose no incluye. Las migraciones
-- (supabase/migrations) usan `storage.buckets` y `storage.objects`: insertan el bucket
-- `product-images` y crean políticas sobre los objetos. Este archivo crea solo lo que necesitan,
-- con las mismas columnas principales que el esquema real, antes de aplicarlas.
--
-- Se ejecuta como `supabase_admin`. Las tablas quedan a nombre de `postgres`, que es quien aplica
-- las migraciones y necesita ser su dueño para crear políticas.

create schema if not exists storage;

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  owner uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  public boolean default false,
  avif_autodetection boolean default false,
  file_size_limit bigint,
  allowed_mime_types text[],
  owner_id text
);
create unique index if not exists bname on storage.buckets (name);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text,
  owner uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_accessed_at timestamptz default now(),
  metadata jsonb,
  path_tokens text[] generated always as (string_to_array(name, '/')) stored,
  version text,
  owner_id text,
  user_metadata jsonb
);
create unique index if not exists bucketid_objname on storage.objects (bucket_id, name);

alter table storage.buckets enable row level security;
alter table storage.objects enable row level security;

alter table storage.buckets owner to postgres;
alter table storage.objects owner to postgres;

grant usage on schema storage to postgres, anon, authenticated, service_role;
grant all on storage.buckets, storage.objects to postgres, anon, authenticated, service_role;
