import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

// Comprobaciones estáticas del seeder de clientes y pedidos (TSK-49). No ejecutan Docker.
const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const raw = readFileSync(new URL("./20-clientes-pedidos.sql", import.meta.url));
const seed = raw.toString("utf8");
const catalogSeed = readFileSync(new URL("./10-catalogo.sql", import.meta.url), "utf8");
const sampleCatalog = read("supabase/migrations/20261020220720_sample_catalog_drafts.sql");
const readme = read("docker/README.md");

const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const orderCalls = [...seed.matchAll(new RegExp(`select pg_temp\\.seed_order\\('(${uuid})', '(${uuid})',\\s+'([^']+)', '([^']+)', '([a-z_]+)', interval '([^']+)', '([a-z0-9-]+)', (\\d+)\\);`, "g"))]
  .map(([, id, customer, name, email, status, age, slug, quantity]) => ({ id, customer, name, email, status, age, slug, quantity: Number(quantity) }));

test("el seeder tiene saltos de línea LF y no controla su propia transacción", () => {
  assert.ok(!raw.includes(0x0d), "20-clientes-pedidos.sql no debe tener retornos de carro (CRLF)");
  assert.doesNotMatch(seed, /^\s*(begin|commit|rollback)\s*;/im, "apply-migrations.sh ya usa --single-transaction");
});

test("se aplica después del seeder de catálogo, en el orden que sigue apply-migrations.sh", () => {
  const files = readdirSync(new URL("./", import.meta.url)).filter((file) => /^\d.*\.sql$/.test(file)).sort();
  assert.deepEqual(files, ["10-catalogo.sql", "20-clientes-pedidos.sql"]);
  assert.match(read("docker/db/apply-migrations.sh"), /ls \/seeds\/\[0-9\]\*\.sql 2>\/dev\/null \| sort/);
});

test("crea dos clientes de prueba con la contraseña cifrada y sus perfiles", () => {
  const emails = [...seed.matchAll(/'(cliente\d@eternal-memory\.local)'/g)].map((match) => match[1]);
  assert.deepEqual([...new Set(emails)].sort(), ["cliente1@eternal-memory.local", "cliente2@eternal-memory.local"]);
  assert.equal((seed.match(/extensions\.crypt\('[^']+', extensions\.gen_salt\('bf'\)\)/g) ?? []).length, 2);
  assert.match(seed, /insert into auth\.users/);
  assert.match(seed, /insert into public\.profiles/);
  assert.match(seed, /on conflict \(id\) do nothing/);
});

test("deja activas las tarifas de envío sin cambiar las que ya tienen precio", () => {
  const update = seed.slice(seed.indexOf("update public.delivery_rates"), seed.indexOf("create function"));
  assert.match(update, /price_pen = coalesce\(price_pen,/);
  assert.match(update, /is_active = true/);
  assert.match(update, /and \(not is_active or price_pen is null\)/);
});

test("hay pedidos en los cuatro estados pedidos, repartidos entre los dos clientes", () => {
  assert.equal(orderCalls.length, 4);
  assert.deepEqual(orderCalls.map((order) => order.status).sort(), ["completed", "paid", "pending_payment", "processing"]);
  assert.deepEqual([...new Set(orderCalls.map((order) => order.customer))].length, 2);
  assert.equal(new Set(orderCalls.map((order) => order.id)).size, 4, "identificadores distintos");
  for (const order of orderCalls) assert.ok(order.quantity >= 1 && order.quantity <= 50);
});

test("cada pedido apunta a un cliente del seeder y a un producto del catálogo de muestra", () => {
  const customerIds = new Set([...seed.slice(0, seed.indexOf("create function")).matchAll(new RegExp(`'(${uuid})',\\s+'authenticated'`, "g"))].map((match) => match[1]));
  assert.equal(customerIds.size, 2);
  for (const order of orderCalls) {
    assert.ok(customerIds.has(order.customer), `cliente ${order.customer}`);
    assert.match(sampleCatalog, new RegExp(`'${order.slug}'`), `${order.slug} no está en las migraciones`);
    assert.match(order.email, /@eternal-memory\.local$/);
  }
});

test("el historial recorre los estados de cada pedido y el administrador existe en el otro seeder", () => {
  const body = seed.slice(seed.indexOf("create function"), seed.indexOf("-- Cliente 1"));
  for (const step of ["null, 'pending_payment'", "'pending_payment', 'paid'", "'paid', 'processing'", "'processing', 'shipped'", "'shipped', 'completed'"]) {
    assert.ok(body.includes(step), step);
  }
  const admin = body.match(/v_admin constant uuid := '([^']+)'/)[1];
  assert.ok(catalogSeed.includes(`'${admin}'`), "el actor de las transiciones es el administrador de 10-catalogo.sql");
});

test("las existencias y los pagos siguen el flujo real", () => {
  const body = seed.slice(seed.indexOf("create function"), seed.indexOf("-- Cliente 1"));
  assert.match(body, /stock_reserved = stock_reserved \+ p_quantity/, "el pedido pendiente reserva");
  assert.match(body, /stock_on_hand = stock_on_hand - p_quantity/, "el pedido pagado descuenta");
  assert.match(body, /insert into public\.payment_attempts/);
  assert.match(body, /now\(\) \+ interval '10 years'/, "el pedido pendiente no debe vencer solo");
});

test("es idempotente: si el pedido ya existe, no vuelve a crearlo", () => {
  assert.match(seed, /if exists \(select 1 from public\.orders where id = p_id\) then\s+return;/);
  assert.match(seed, /create function pg_temp\.seed_order/, "la función es temporal");
  assert.ok((seed.match(/on conflict \(id\) do nothing/g) ?? []).length >= 2);
});

test("no contiene datos personales reales", () => {
  const emails = seed.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) ?? [];
  assert.ok(emails.length > 0);
  assert.ok(emails.every((email) => email.endsWith("@eternal-memory.local")), emails.join(", "));
  assert.doesNotMatch(seed, /gmail|hotmail|outlook|yahoo/i);
  assert.match(seed, /'\+51900000000'/, "teléfono ficticio");
});

test("las credenciales y el comando de comprobación están documentados en el README", () => {
  assert.ok(readme.includes("20-clientes-pedidos.sql"));
  for (const email of ["cliente1@eternal-memory.local", "cliente2@eternal-memory.local"]) assert.ok(readme.includes(`\`${email}\``), email);
  const password = seed.match(/extensions\.crypt\('([^']+)'/)[1];
  assert.ok(readme.includes(`\`${password}\``), "la contraseña de prueba está en docker/README.md");
  assert.ok(readme.includes("select status, count(*) from public.orders group by status"));
});
