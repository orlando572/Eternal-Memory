# Base de datos de Eternal Memory

Las migraciones crean el modelo de la tienda y cargan los 48 productos actuales
como **borradores**, con 94 variantes, 48 imágenes referenciales y stock cero.
Ningún producto se publica automáticamente. El catálogo de Next.js sigue leyendo
`productsData.ts`: conectar las pantallas a Supabase es un trabajo posterior.

## Desplegar

Proyecto previsto: `kfedztfrcolradstwetk`. Antes de aplicar, inspecciona el esquema
`public` y el historial de migraciones del proyecto. Estas migraciones no eliminan
tablas previas; si existe una tabla propia con el mismo nombre, resuelve el
conflicto tras comprobar que esté vacía. No borres los esquemas internos `auth` o
`storage`.

La CLI usada para crear las migraciones fue Supabase CLI 2.121.0. El proyecto no
contiene credenciales. Accede con una cuenta o token de alcance limitado y usa la
contraseña de base de datos fuera del repositorio:

```bash
npx supabase link --project-ref kfedztfrcolradstwetk
npx supabase migration list --linked
npx supabase db push --linked --dry-run
npx supabase db push --linked
npx supabase migration list --linked
npx supabase db advisors --linked --type security
npx supabase db advisors --linked --type performance
```

En local, `npx supabase start` y `npx supabase db reset` requieren Docker. El
archivo `config.toml` desactiva la exposición automática de tablas y los seeds
separados; el catálogo de muestra ya es una migración versionada.

## Primeros ajustes

1. Registra e inicia sesión con la cuenta que administrará la tienda. Así se
   crea su fila en `auth.users` y `public.profiles`.
2. Desde el SQL Editor, asigna el rol a ese usuario concreto:

   ```sql
   insert into public.staff_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'ADMIN_EMAIL_AQUI'
   on conflict (user_id) do update set role = excluded.role;
   ```

3. Revisa nombres, opciones, imágenes, precios y existencias de cada producto.
   Cambia `products.status` a `published` solo después de esa revisión.
4. Configura las dos tarifas en soles, antes de permitir pedidos:

   ```sql
   update public.delivery_rates set price_pen = 0, is_active = true
   where zone = 'arequipa_province'; -- sustituir 0 por la tarifa real
   update public.delivery_rates set price_pen = 0, is_active = true
   where zone = 'rest_of_peru'; -- sustituir 0 por la tarifa real
   ```

La zona local cubre toda la **provincia de Arequipa**, en el departamento de
Arequipa. Cualquier otra provincia usa la tarifa nacional. La dirección que
aporte el cliente deberá validarse en el futuro checkout; el esquema restringe
el país a Perú, pero no contiene un catálogo de ubigeos.

## Administración de productos (TSK-04)

Las migraciones `admin_product_save` y `admin_variant_name_uniqueness` habilitan el
formulario administrativo. La aplicación usa la clave **pública** de Supabase en
`.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
No se necesita ni se debe poner una clave `service_role` en el navegador.

Solo una sesión con fila `staff_roles.role = 'admin'` puede consultar borradores
y ejecutar `save_admin_product(jsonb)`. La función valida y guarda producto y
variantes en una transacción; la escritura directa de esas dos tablas está
revocada para `authenticated`. Para asignar el rol, primero debe existir la
cuenta en `auth.users`; usa el SQL de «Primeros ajustes».

## Contrato para la futura aplicación

- El navegador puede consultar productos publicados, actualizar su propio
  perfil y leer sus pedidos. RLS y los permisos SQL bloquean la escritura de
  pedidos, pagos y roles desde el cliente. Las consultas de productos usan el
  `slug` actual de cada ficha.
- El backend verifica la sesión del cliente y llama a
  `create_store_order(customer_id, contacto, dirección, items)` con la clave
  `service_role` **solo en el servidor**. `items` es un arreglo JSON de objetos
  `{ "variant_id": "uuid", "quantity": 1 }`. La función recalcula importes,
  comprueba publicación y stock, reserva unidades durante 30 minutos y guarda
  el pedido y sus líneas en una transacción.
- La futura sesión de Stripe de prueba debe cobrar `total_pen` convertido a
  céntimos, usar el mismo vencimiento de 30 minutos y registrarse con
  `register_payment_session`. El webhook verifica **antes** la firma de Stripe
  y luego llama a `record_payment_event`. La función deduplica eventos por ID
  y es la única vía normal para marcar un pedido como pagado. Un pago tardío
  queda en `review_required` para resolverlo manualmente.
- `expire_pending_orders()` libera reservas vencidas. Al conectar el checkout,
  prográmala cada minuto con Supabase Cron o un job de servidor y comprueba que
  la sesión de Stripe tenga el mismo vencimiento. `advance_order_status` acepta
  únicamente `paid → processing → shipped → completed` y exige un administrador.
- Las imágenes nuevas se guardan en el bucket público `product-images`; la
  subida, reemplazo y eliminación requieren rol administrador. Las imágenes
  importadas conservan sus URL externas y la marca `is_reference = true`.

## Comprobaciones después del despliegue

```sql
select status, count(*) from public.products group by status;
select count(*) from public.product_variants;
select count(*) from public.product_images where is_reference;
select zone, price_pen, is_active from public.delivery_rates order by zone;
select relname, relrowsecurity from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r'
  and relname in ('profiles', 'staff_roles', 'categories', 'products',
    'product_variants', 'product_images', 'delivery_rates', 'orders',
    'order_items', 'order_status_history', 'payment_attempts', 'payment_events');
```

Se esperan 48 borradores, 94 variantes, 48 imágenes referenciales, dos tarifas
inactivas y RLS activo en las 12 tablas. Antes de conectar el checkout, prueba
con dos usuarios que un cliente no lea pedidos ajenos y que `anon` no vea
borradores ni pueda crear pedidos. Prueba también dos pedidos concurrentes sobre
la última unidad, un webhook repetido y un pago después del vencimiento.
