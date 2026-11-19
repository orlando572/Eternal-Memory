-- Datos de prueba de clientes, tarifas de envío y pedidos (TSK-49). Solo para la base de datos
-- local de `docker compose`: `db-migrate` lo aplica como `postgres`, después de las migraciones y
-- de `10-catalogo.sql` (necesita sus productos con existencias y su administrador), en una sola
-- transacción. Es idempotente: puede repetirse sin duplicar nada.
--
-- Todos los datos son ficticios: correos `@eternal-memory.local`, teléfonos y direcciones de
-- prueba. Los pedidos usan productos y precios del catálogo de muestra, y su estado es de prueba:
-- no son ventas ni inventario reales.

-- 1. Dos clientes de prueba. Las credenciales están documentadas en docker/README.md y no son
--    reales. La contraseña se guarda cifrada con bcrypt, como hace Supabase Auth.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-4000-8000-000000000491',
  'authenticated',
  'authenticated',
  'cliente1@eternal-memory.local',
  extensions.crypt('EternalCliente2026!', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Cliente de prueba Uno"}',
  now(),
  now()
), (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-4000-8000-000000000492',
  'authenticated',
  'authenticated',
  'cliente2@eternal-memory.local',
  extensions.crypt('EternalCliente2026!', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Cliente de prueba Dos"}',
  now(),
  now()
)
on conflict (id) do nothing;

-- El trigger `on_auth_user_created` ya creó sus perfiles; esto los asegura si existían antes.
insert into public.profiles (id, full_name)
values
  ('00000000-0000-4000-8000-000000000491', 'Cliente de prueba Uno'),
  ('00000000-0000-4000-8000-000000000492', 'Cliente de prueba Dos')
on conflict (id) do nothing;

-- 2. Tarifas de envío activas. Si ya tienen precio no se tocan: solo se activan, y se completan
--    con las tarifas vigentes (S/ 10 en la provincia de Arequipa y S/ 25 en el resto del Perú)
--    si alguna no tuviera precio.
update public.delivery_rates
set price_pen = coalesce(price_pen, case zone when 'arequipa_province' then 10 else 25 end),
    is_active = true
where zone in ('arequipa_province', 'rest_of_peru')
  and (not is_active or price_pen is null);

-- 3. Pedidos de prueba en cuatro estados, cada uno con su historial. Se crean con una función
--    temporal que desaparece al terminar la sesión. Si el pedido ya existe, no hace nada.
--    Las existencias se ajustan como lo hace el flujo real: el pedido pendiente reserva las
--    unidades y los pedidos pagados las descuentan del inventario.
create function pg_temp.seed_order(
  p_id uuid,
  p_customer uuid,
  p_contact_name text,
  p_contact_email text,
  p_status text,
  p_age interval,
  p_slug text,
  p_quantity integer
) returns void
language plpgsql as $$
declare
  v_admin constant uuid := '00000000-0000-4000-8000-000000000045';
  v_variant record;
  v_delivery numeric(12,2);
  v_created timestamptz := now() - p_age;
  v_paid boolean := p_status <> 'pending_payment';
begin
  if exists (select 1 from public.orders where id = p_id) then
    return;
  end if;

  -- La primera variante del producto, con su nombre y precio del catálogo.
  select v.id as variant_id, v.price_pen, v.name as variant_name, p.name as product_name
    into v_variant
    from public.product_variants v
    join public.products p on p.id = v.product_id
    where p.slug = p_slug
    order by v.sort_order, v.name
    limit 1;
  if not found then
    raise exception 'Producto de prueba no encontrado: %', p_slug;
  end if;

  select coalesce(price_pen, 10) into v_delivery
    from public.delivery_rates where zone = 'arequipa_province';

  insert into public.orders (
    id, customer_id, status, payment_status,
    contact_name, contact_email, contact_phone,
    address_line, address_detail, department, province, district,
    delivery_zone, delivery_ubigeo, subtotal_pen, delivery_pen,
    reservation_expires_at, created_at, updated_at
  ) values (
    p_id, p_customer, p_status, case when v_paid then 'paid' else 'pending' end,
    p_contact_name, p_contact_email, '+51900000000',
    'Calle de prueba 123', 'Dirección ficticia', 'AREQUIPA', 'AREQUIPA', 'AREQUIPA',
    'arequipa_province', '040101', v_variant.price_pen * p_quantity, coalesce(v_delivery, 10),
    -- El pedido pendiente conserva su reserva años, para que el vencimiento automático no lo cancele.
    case when v_paid then v_created + interval '30 minutes' else now() + interval '10 years' end,
    v_created, v_created
  );

  insert into public.order_items (
    order_id, variant_id, product_name, variant_name, quantity,
    unit_price_pen, base_unit_price_pen, customization_unit_pen, line_key
  ) values (
    p_id, v_variant.variant_id, v_variant.product_name, v_variant.variant_name, p_quantity,
    v_variant.price_pen, v_variant.price_pen, 0, 'prueba-1'
  );

  if v_paid then
    update public.product_variants
      set stock_on_hand = stock_on_hand - p_quantity
      where id = v_variant.variant_id;
    insert into public.payment_attempts (order_id, stripe_session_id, amount_pen, status)
    values (p_id, 'cs_test_datos_de_prueba_' || p_id, v_variant.price_pen * p_quantity + coalesce(v_delivery, 10), 'paid');
  else
    update public.product_variants
      set stock_reserved = stock_reserved + p_quantity
      where id = v_variant.variant_id;
  end if;

  -- Historial: cada estado por el que pasó el pedido, del más antiguo al más reciente.
  insert into public.order_status_history (order_id, from_status, to_status, actor_id, reason, created_at)
  values (p_id, null, 'pending_payment', p_customer, 'Pedido creado (datos de prueba)', v_created);
  if v_paid then
    insert into public.order_status_history (order_id, from_status, to_status, actor_id, reason, created_at)
    values (p_id, 'pending_payment', 'paid', null, 'Pago confirmado (datos de prueba)', v_created + interval '5 minutes');
  end if;
  if p_status in ('processing', 'completed') then
    insert into public.order_status_history (order_id, from_status, to_status, actor_id, reason, created_at)
    values (p_id, 'paid', 'processing', v_admin, null, v_created + interval '1 hour');
  end if;
  if p_status = 'completed' then
    insert into public.order_status_history (order_id, from_status, to_status, actor_id, reason, created_at)
    values
      (p_id, 'processing', 'shipped', v_admin, null, v_created + interval '1 day'),
      (p_id, 'shipped', 'completed', v_admin, null, v_created + interval '3 days');
  end if;
end;
$$;

-- Cliente 1: un pedido pendiente de pago y uno pagado.
select pg_temp.seed_order('00000000-0000-4000-8000-000000004901', '00000000-0000-4000-8000-000000000491',
  'Cliente de prueba Uno', 'cliente1@eternal-memory.local', 'pending_payment', interval '1 hour', 'urna-serenidad-bronce', 1);
select pg_temp.seed_order('00000000-0000-4000-8000-000000004902', '00000000-0000-4000-8000-000000000491',
  'Cliente de prueba Uno', 'cliente1@eternal-memory.local', 'paid', interval '2 days', 'relicario-petalo-bronce', 1);

-- Cliente 2: un pedido en preparación y uno completado.
select pg_temp.seed_order('00000000-0000-4000-8000-000000004903', '00000000-0000-4000-8000-000000000492',
  'Cliente de prueba Dos', 'cliente2@eternal-memory.local', 'processing', interval '5 days', 'ataud-roble-clasico', 1);
select pg_temp.seed_order('00000000-0000-4000-8000-000000004904', '00000000-0000-4000-8000-000000000492',
  'Cliente de prueba Dos', 'cliente2@eternal-memory.local', 'completed', interval '10 days', 'corona-botanica-romero', 2);
