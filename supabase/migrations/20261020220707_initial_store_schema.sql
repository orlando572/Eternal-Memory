-- Eternal Memory: first version of the store database.
-- Apply only after inspecting existing application objects in the target project.
create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

-- Complete the existing Auth starter table in place when present, while
-- allowing the migration to run on a fresh database too.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles
  add column if not exists phone text,
  add column if not exists created_at timestamptz not null default now();
alter table public.profiles alter column full_name set default '';
update public.profiles set full_name = '' where full_name is null;
alter table public.profiles alter column full_name set not null;
alter table public.profiles alter column updated_at set default now();
update public.profiles set updated_at = now() where updated_at is null;
alter table public.profiles alter column updated_at set not null;
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;

create table public.staff_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role = 'admin'),
  granted_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint categories_name_nonempty check (length(btrim(name)) > 0)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  slug text not null unique,
  name text not null,
  description text,
  badge text,
  badge_tone text check (badge_tone in ('moss', 'neutral', 'ember', 'brass')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint products_name_nonempty check (length(btrim(name)) > 0)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text unique,
  price_pen numeric(12,2) not null check (price_pen >= 0),
  stock_on_hand integer not null default 0 check (stock_on_hand >= 0),
  stock_reserved integer not null default 0 check (stock_reserved >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, name),
  constraint variants_reserved_within_stock check (stock_reserved <= stock_on_hand),
  constraint variants_name_nonempty check (length(btrim(name)) > 0)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text unique,
  external_url text,
  alt_text text,
  is_reference boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint images_one_source check (num_nonnulls(storage_path, external_url) = 1),
  constraint images_source_nonempty check (
    (storage_path is null or length(btrim(storage_path)) > 0)
    and (external_url is null or external_url ~ '^https://')
  )
);

create table public.delivery_rates (
  zone text primary key check (zone in ('arequipa_province', 'rest_of_peru')),
  price_pen numeric(12,2) check (price_pen >= 0),
  is_active boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint delivery_active_has_price check (not is_active or price_pen is not null)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id),
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'processing', 'shipped', 'completed', 'canceled', 'review_required')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  address_line text not null,
  department text not null,
  province text not null,
  district text not null,
  address_detail text,
  country_code text not null default 'PE' check (country_code = 'PE'),
  delivery_zone text not null check (delivery_zone in ('arequipa_province', 'rest_of_peru')),
  subtotal_pen numeric(12,2) not null check (subtotal_pen >= 0),
  delivery_pen numeric(12,2) not null check (delivery_pen >= 0),
  total_pen numeric(12,2) generated always as (subtotal_pen + delivery_pen) stored,
  reservation_expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_contact_nonempty check (
    length(btrim(contact_name)) > 0 and length(btrim(contact_email)) > 0
    and length(btrim(contact_phone)) > 0 and length(btrim(address_line)) > 0
    and length(btrim(department)) > 0 and length(btrim(province)) > 0
    and length(btrim(district)) > 0
  )
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  product_name text not null,
  variant_name text not null,
  quantity integer not null check (quantity between 1 and 50),
  unit_price_pen numeric(12,2) not null check (unit_price_pen >= 0),
  line_total_pen numeric(12,2) generated always as (quantity * unit_price_pen) stored,
  unique (order_id, variant_id)
);

create table public.order_status_history (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_id uuid references auth.users(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create table public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  stripe_session_id text not null unique,
  amount_pen numeric(12,2) not null check (amount_pen >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_events (
  stripe_event_id text primary key,
  payment_attempt_id uuid references public.payment_attempts(id),
  event_type text not null,
  received_at timestamptz not null default now()
);

create index products_category_status_idx on public.products (category_id, status, name);
create index variants_product_idx on public.product_variants (product_id, sort_order);
create index images_product_idx on public.product_images (product_id, sort_order);
create index orders_customer_created_idx on public.orders (customer_id, created_at desc);
create index orders_status_created_idx on public.orders (status, created_at desc);
create index orders_expiring_idx on public.orders (reservation_expires_at)
  where status = 'pending_payment';
create index order_items_order_idx on public.order_items (order_id);
create index order_items_variant_idx on public.order_items (variant_id);
create index order_history_order_idx on public.order_status_history (order_id, created_at);
create index payment_attempts_order_idx on public.payment_attempts (order_id);
create index payment_events_attempt_idx on public.payment_events (payment_attempt_id);

create function app_private.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function app_private.touch_updated_at() from public, anon, authenticated;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function app_private.touch_updated_at();
create trigger categories_updated_at before update on public.categories
  for each row execute function app_private.touch_updated_at();
create trigger products_updated_at before update on public.products
  for each row execute function app_private.touch_updated_at();
create trigger variants_updated_at before update on public.product_variants
  for each row execute function app_private.touch_updated_at();
create trigger rates_updated_at before update on public.delivery_rates
  for each row execute function app_private.touch_updated_at();
create trigger orders_updated_at before update on public.orders
  for each row execute function app_private.touch_updated_at();
create trigger attempts_updated_at before update on public.payment_attempts
  for each row execute function app_private.touch_updated_at();

-- The Auth trigger only creates a matching profile; it never grants a role.
create function app_private.create_profile_for_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;
revoke all on function app_private.create_profile_for_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function app_private.create_profile_for_user();
insert into public.profiles (id, full_name)
select id, coalesce(raw_user_meta_data ->> 'full_name', '') from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.staff_roles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.delivery_rates enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payment_attempts enable row level security;
alter table public.payment_events enable row level security;

-- Explicit grants also work when automatic Data API exposure is disabled.
revoke all on public.profiles, public.staff_roles, public.categories, public.products,
  public.product_variants, public.product_images, public.delivery_rates, public.orders,
  public.order_items, public.order_status_history, public.payment_attempts,
  public.payment_events from public, anon, authenticated;
grant select, update (full_name, phone) on public.profiles to authenticated;
grant select on public.staff_roles to authenticated;
grant select on public.categories, public.products, public.product_variants,
  public.product_images, public.delivery_rates to anon, authenticated;
grant insert, update, delete on public.categories, public.products,
  public.product_variants, public.product_images to authenticated;
grant update (price_pen, is_active) on public.delivery_rates to authenticated;
grant select on public.orders, public.order_items, public.order_status_history to authenticated;
grant select, insert, update, delete on public.profiles, public.staff_roles,
  public.categories, public.products, public.product_variants, public.product_images,
  public.delivery_rates, public.orders, public.order_items, public.order_status_history,
  public.payment_attempts, public.payment_events to service_role;
grant usage, select on sequence public.order_status_history_id_seq to service_role;
revoke all on sequence public.order_status_history_id_seq from public, anon, authenticated;

create policy profiles_self_select on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_self_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy staff_roles_self_select on public.staff_roles for select to authenticated
  using (user_id = (select auth.uid()));

create policy categories_public_select on public.categories for select to anon, authenticated
  using (is_active);
create policy categories_admin_all on public.categories for all to authenticated
  using (exists (select 1 from public.staff_roles s where s.user_id = (select auth.uid()) and s.role = 'admin'))
  with check (exists (select 1 from public.staff_roles s where s.user_id = (select auth.uid()) and s.role = 'admin'));
create policy products_public_select on public.products for select to anon, authenticated
  using (status = 'published' and exists (
    select 1 from public.categories c where c.id = category_id and c.is_active
  ));
create policy products_admin_all on public.products for all to authenticated
  using (exists (select 1 from public.staff_roles s where s.user_id = (select auth.uid()) and s.role = 'admin'))
  with check (exists (select 1 from public.staff_roles s where s.user_id = (select auth.uid()) and s.role = 'admin'));
create policy variants_public_select on public.product_variants for select to anon, authenticated
  using (is_active and exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy variants_admin_all on public.product_variants for all to authenticated
  using (exists (select 1 from public.staff_roles s where s.user_id = (select auth.uid()) and s.role = 'admin'))
  with check (exists (select 1 from public.staff_roles s where s.user_id = (select auth.uid()) and s.role = 'admin'));
create policy images_public_select on public.product_images for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy images_admin_all on public.product_images for all to authenticated
  using (exists (select 1 from public.staff_roles s where s.user_id = (select auth.uid()) and s.role = 'admin'))
  with check (exists (select 1 from public.staff_roles s where s.user_id = (select auth.uid()) and s.role = 'admin'));
create policy rates_public_select on public.delivery_rates for select to anon, authenticated
  using (is_active and price_pen is not null);
create policy rates_admin_select on public.delivery_rates for select to authenticated
  using (exists (select 1 from public.staff_roles s where s.user_id = (select auth.uid()) and s.role = 'admin'));
create policy rates_admin_update on public.delivery_rates for update to authenticated
  using (exists (select 1 from public.staff_roles s where s.user_id = (select auth.uid()) and s.role = 'admin'))
  with check (exists (select 1 from public.staff_roles s where s.user_id = (select auth.uid()) and s.role = 'admin'));

create policy orders_owner_or_admin_select on public.orders for select to authenticated
  using (customer_id = (select auth.uid()) or exists (
    select 1 from public.staff_roles s where s.user_id = (select auth.uid()) and s.role = 'admin'
  ));
create policy items_owner_or_admin_select on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id));
create policy history_owner_or_admin_select on public.order_status_history for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id));

-- Public product photos; only staff can upload, replace, or delete files.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
create policy product_images_public_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');
create policy product_images_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and exists (
    select 1 from public.staff_roles s where s.user_id = (select auth.uid()) and s.role = 'admin'
  ));
create policy product_images_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and exists (
    select 1 from public.staff_roles s where s.user_id = (select auth.uid()) and s.role = 'admin'
  )) with check (bucket_id = 'product-images' and exists (
    select 1 from public.staff_roles s where s.user_id = (select auth.uid()) and s.role = 'admin'
  ));
create policy product_images_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and exists (
    select 1 from public.staff_roles s where s.user_id = (select auth.uid()) and s.role = 'admin'
  ));

insert into public.delivery_rates (zone) values ('arequipa_province'), ('rest_of_peru');

-- These RPCs are callable only with the server-side service role key. The
-- application must verify the customer's session before passing customer_id.
create function public.create_store_order(
  p_customer_id uuid,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_address_line text,
  p_department text,
  p_province text,
  p_district text,
  p_address_detail text,
  p_items jsonb
) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  v_zone text;
  v_delivery numeric(12,2);
  v_subtotal numeric(12,2) := 0;
  v_order_id uuid;
  v_lines jsonb := '[]'::jsonb;
  v_item record;
  v_variant record;
  v_line jsonb;
begin
  if p_customer_id is null or p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'Invalid customer or cart';
  end if;
  if p_contact_name is null or p_contact_email is null or p_contact_phone is null
     or p_address_line is null or p_department is null or p_province is null or p_district is null
     or length(btrim(p_contact_name)) = 0 or length(btrim(p_contact_email)) = 0
     or length(btrim(p_contact_phone)) = 0 or length(btrim(p_address_line)) = 0
     or length(btrim(p_department)) = 0 or length(btrim(p_province)) = 0
     or length(btrim(p_district)) = 0 then
    raise exception 'Incomplete delivery address';
  end if;

  v_zone := case when lower(btrim(p_department)) = 'arequipa'
                   and lower(btrim(p_province)) = 'arequipa'
                 then 'arequipa_province' else 'rest_of_peru' end;
  select price_pen into v_delivery from public.delivery_rates
    where zone = v_zone and is_active and price_pen is not null;
  if not found then
    raise exception 'Delivery rate is not configured';
  end if;

  -- Lock variants in a stable order so simultaneous orders cannot oversell.
  for v_item in
    select variant_id, sum(quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity integer)
    group by variant_id order by variant_id
  loop
    if v_item.variant_id is null or v_item.quantity is null or v_item.quantity not between 1 and 50 then
      raise exception 'Invalid cart item';
    end if;
    select v.id, v.name as variant_name, v.price_pen, v.stock_on_hand,
           v.stock_reserved, v.is_active, p.name as product_name, p.status,
           c.is_active as category_active
      into v_variant
      from public.product_variants v
      join public.products p on p.id = v.product_id
      join public.categories c on c.id = p.category_id
      where v.id = v_item.variant_id
      for update of v;
    if not found or not v_variant.is_active or v_variant.status <> 'published'
       or not v_variant.category_active then
      raise exception 'Cart contains an unavailable variant';
    end if;
    if v_variant.stock_on_hand - v_variant.stock_reserved < v_item.quantity then
      raise exception 'Insufficient stock for variant %', v_item.variant_id;
    end if;
    update public.product_variants set stock_reserved = stock_reserved + v_item.quantity
      where id = v_item.variant_id;
    v_subtotal := v_subtotal + v_variant.price_pen * v_item.quantity;
    v_lines := v_lines || jsonb_build_array(jsonb_build_object(
      'variant_id', v_item.variant_id,
      'product_name', v_variant.product_name,
      'variant_name', v_variant.variant_name,
      'quantity', v_item.quantity,
      'unit_price_pen', v_variant.price_pen
    ));
  end loop;

  insert into public.orders (
    customer_id, contact_name, contact_email, contact_phone, address_line,
    department, province, district, address_detail, delivery_zone,
    subtotal_pen, delivery_pen, reservation_expires_at
  ) values (
    p_customer_id, btrim(p_contact_name), btrim(p_contact_email), btrim(p_contact_phone),
    btrim(p_address_line), btrim(p_department), btrim(p_province), btrim(p_district),
    nullif(btrim(p_address_detail), ''), v_zone, v_subtotal, v_delivery,
    now() + interval '30 minutes'
  ) returning id into v_order_id;

  for v_line in select value from jsonb_array_elements(v_lines) loop
    insert into public.order_items (
      order_id, variant_id, product_name, variant_name, quantity, unit_price_pen
    ) values (
      v_order_id, (v_line ->> 'variant_id')::uuid,
      v_line ->> 'product_name', v_line ->> 'variant_name',
      (v_line ->> 'quantity')::integer, (v_line ->> 'unit_price_pen')::numeric
    );
  end loop;
  insert into public.order_status_history (order_id, to_status, actor_id)
    values (v_order_id, 'pending_payment', p_customer_id);
  return v_order_id;
end;
$$;
revoke all on function public.create_store_order(uuid,text,text,text,text,text,text,text,text,jsonb)
  from public, anon, authenticated;
grant execute on function public.create_store_order(uuid,text,text,text,text,text,text,text,text,jsonb)
  to service_role;

create function public.register_payment_session(
  p_order_id uuid, p_stripe_session_id text, p_amount_pen numeric
) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  v_order public.orders%rowtype;
  v_attempt_id uuid;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.status <> 'pending_payment'
     or v_order.reservation_expires_at <= now()
     or p_amount_pen is distinct from v_order.total_pen
     or nullif(btrim(p_stripe_session_id), '') is null then
    raise exception 'Invalid payment session';
  end if;
  if exists (select 1 from public.payment_attempts where order_id = p_order_id and status = 'pending') then
    raise exception 'A payment session is already pending';
  end if;
  insert into public.payment_attempts (order_id, stripe_session_id, amount_pen)
    values (p_order_id, p_stripe_session_id, p_amount_pen) returning id into v_attempt_id;
  return v_attempt_id;
end;
$$;
revoke all on function public.register_payment_session(uuid,text,numeric)
  from public, anon, authenticated;
grant execute on function public.register_payment_session(uuid,text,numeric) to service_role;

create function public.record_payment_event(
  p_stripe_event_id text, p_stripe_session_id text, p_event_type text, p_amount_pen numeric
) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare
  v_order_id uuid;
  v_attempt public.payment_attempts%rowtype;
  v_order public.orders%rowtype;
  v_item record;
begin
  if nullif(btrim(p_stripe_event_id), '') is null then
    raise exception 'Missing Stripe event ID';
  end if;
  select order_id into v_order_id from public.payment_attempts
    where stripe_session_id = p_stripe_session_id;
  if not found then
    raise exception 'Unknown Stripe session';
  end if;
  select * into v_order from public.orders where id = v_order_id for update;
  select * into v_attempt from public.payment_attempts
    where stripe_session_id = p_stripe_session_id for update;
  if p_event_type = 'checkout.session.completed'
     and (p_amount_pen is distinct from v_attempt.amount_pen
          or p_amount_pen is distinct from v_order.total_pen) then
    raise exception 'Payment amount mismatch';
  end if;
  insert into public.payment_events (stripe_event_id, payment_attempt_id, event_type)
    values (p_stripe_event_id, v_attempt.id, p_event_type)
    on conflict (stripe_event_id) do nothing;
  if not found then
    return false;
  end if;
  if v_attempt.status = 'paid' then
    return true;
  end if;

  if p_event_type = 'checkout.session.completed' then
    update public.payment_attempts set status = 'paid' where id = v_attempt.id;
    if v_order.status = 'pending_payment' and v_order.reservation_expires_at > now() then
      for v_item in select variant_id, quantity from public.order_items
          where order_id = v_order.id order by variant_id loop
        update public.product_variants
          set stock_on_hand = stock_on_hand - v_item.quantity,
              stock_reserved = stock_reserved - v_item.quantity
          where id = v_item.variant_id and stock_reserved >= v_item.quantity;
        if not found then
          raise exception 'Reserved stock is missing';
        end if;
      end loop;
      update public.orders set status = 'paid', payment_status = 'paid' where id = v_order.id;
      insert into public.order_status_history (order_id, from_status, to_status, reason)
        values (v_order.id, v_order.status, 'paid', 'Stripe payment confirmed');
    else
      if v_order.status = 'pending_payment' then
        for v_item in select variant_id, quantity from public.order_items
            where order_id = v_order.id order by variant_id loop
          update public.product_variants
            set stock_reserved = stock_reserved - v_item.quantity
            where id = v_item.variant_id and stock_reserved >= v_item.quantity;
          if not found then
            raise exception 'Reserved stock is missing';
          end if;
        end loop;
      end if;
      update public.orders set status = 'review_required', payment_status = 'paid'
        where id = v_order.id;
      insert into public.order_status_history (order_id, from_status, to_status, reason)
        values (v_order.id, v_order.status, 'review_required', 'Payment arrived after reservation ended');
    end if;
  elsif v_attempt.status = 'pending'
        and p_event_type in ('checkout.session.expired', 'checkout.session.async_payment_failed') then
    update public.payment_attempts set status = case
      when p_event_type = 'checkout.session.expired' then 'expired' else 'failed' end
      where id = v_attempt.id;
    if v_order.status = 'pending_payment' then
      for v_item in select variant_id, quantity from public.order_items
          where order_id = v_order.id order by variant_id loop
        update public.product_variants
          set stock_reserved = stock_reserved - v_item.quantity
          where id = v_item.variant_id and stock_reserved >= v_item.quantity;
        if not found then
          raise exception 'Reserved stock is missing';
        end if;
      end loop;
      update public.orders set status = 'canceled', payment_status = 'failed' where id = v_order.id;
      insert into public.order_status_history (order_id, from_status, to_status, reason)
        values (v_order.id, 'pending_payment', 'canceled', p_event_type);
    end if;
  end if;
  return true;
end;
$$;
revoke all on function public.record_payment_event(text,text,text,numeric)
  from public, anon, authenticated;
grant execute on function public.record_payment_event(text,text,text,numeric) to service_role;

create function public.expire_pending_orders() returns integer
language plpgsql security invoker set search_path = '' as $$
declare
  v_order record;
  v_item record;
  v_count integer := 0;
begin
  for v_order in select id from public.orders
      where status = 'pending_payment' and reservation_expires_at <= now()
      order by id for update skip locked loop
    for v_item in select variant_id, quantity from public.order_items
        where order_id = v_order.id order by variant_id loop
      update public.product_variants
        set stock_reserved = stock_reserved - v_item.quantity
        where id = v_item.variant_id and stock_reserved >= v_item.quantity;
      if not found then
        raise exception 'Reserved stock is missing';
      end if;
    end loop;
    update public.orders set status = 'canceled', payment_status = 'failed' where id = v_order.id;
    update public.payment_attempts set status = 'expired'
      where order_id = v_order.id and status = 'pending';
    insert into public.order_status_history (order_id, from_status, to_status, reason)
      values (v_order.id, 'pending_payment', 'canceled', 'Reservation expired');
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;
revoke all on function public.expire_pending_orders() from public, anon, authenticated;
grant execute on function public.expire_pending_orders() to service_role;

create function public.advance_order_status(
  p_order_id uuid, p_admin_id uuid, p_next_status text
) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  v_current text;
begin
  if not exists (select 1 from public.staff_roles where user_id = p_admin_id and role = 'admin') then
    raise exception 'Administrator role required';
  end if;
  select status into v_current from public.orders where id = p_order_id for update;
  if not found or not (
    (v_current = 'paid' and p_next_status = 'processing') or
    (v_current = 'processing' and p_next_status = 'shipped') or
    (v_current = 'shipped' and p_next_status = 'completed')
  ) then
    raise exception 'Invalid order status transition';
  end if;
  update public.orders set status = p_next_status where id = p_order_id;
  insert into public.order_status_history (order_id, from_status, to_status, actor_id)
    values (p_order_id, v_current, p_next_status, p_admin_id);
end;
$$;
revoke all on function public.advance_order_status(uuid,uuid,text)
  from public, anon, authenticated;
grant execute on function public.advance_order_status(uuid,uuid,text) to service_role;
