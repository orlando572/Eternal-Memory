import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Comprobaciones estáticas del seeder de catálogo (TSK-45). No ejecutan Docker.
const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const raw = readFileSync(new URL("./10-catalogo.sql", import.meta.url));
const seed = raw.toString("utf8");
const sampleCatalog = read("supabase/migrations/20261020220720_sample_catalog_drafts.sql");
const readme = read("docker/README.md");

test("el seeder tiene saltos de línea LF y no controla su propia transacción", () => {
  assert.ok(!raw.includes(0x0d), "10-catalogo.sql no debe tener retornos de carro (CRLF)");
  assert.doesNotMatch(seed, /^\s*(begin|commit|rollback)\s*;/im, "apply-migrations.sh ya usa --single-transaction");
});

test("crea un administrador de prueba con la contraseña cifrada", () => {
  assert.match(seed, /insert into auth\.users/);
  assert.match(seed, /extensions\.crypt\('[^']+', extensions\.gen_salt\('bf'\)\)/);
  assert.match(seed, /insert into public\.staff_roles \(user_id, role\)\s+values \('[0-9a-f-]+', 'admin'\)/);
  assert.match(seed, /insert into public\.profiles/);
});

test("publica el catálogo de muestra, le da existencias y marca destacados", () => {
  assert.match(seed, /set status = 'published'/);
  assert.match(seed, /set stock_on_hand = \d+/);
  assert.match(seed, /set is_featured = true/);
  for (const slug of ["urnas", "ataudes", "relicarios", "arreglos-florales"]) {
    assert.match(sampleCatalog, new RegExp(`'${slug}'`), `la categoría ${slug} existe en las migraciones`);
  }
});

test("los productos destacados existen en el catálogo de muestra", () => {
  const list = seed.slice(seed.indexOf("set is_featured = true"));
  const slugs = [...list.matchAll(/'([a-z0-9]+(?:-[a-z0-9]+)+)'/g)].map((match) => match[1]);
  assert.equal(slugs.length, 8);
  for (const slug of slugs) assert.match(sampleCatalog, new RegExp(`'${slug}'`), `${slug} no está en las migraciones`);
});

test("es idempotente: los inserts usan on conflict y los updates solo cambian lo pendiente", () => {
  const inserts = seed.match(/insert into/g).length;
  assert.equal((seed.match(/on conflict \([a-z_]+\) do nothing/g) ?? []).length, inserts);
  assert.match(seed, /and p\.status = 'draft'/);
  assert.match(seed, /and v\.stock_on_hand = 0/);
  assert.match(seed, /and not is_featured/);
});

test("las credenciales del README coinciden con las del seeder", () => {
  const email = seed.match(/'([^']+@eternal-memory\.local)'/)[1];
  const password = seed.match(/extensions\.crypt\('([^']+)'/)[1];
  assert.ok(readme.includes(`\`${email}\``), "el correo de prueba está en docker/README.md");
  assert.ok(readme.includes(`\`${password}\``), "la contraseña de prueba está en docker/README.md");
  assert.ok(readme.includes("10-catalogo.sql"));
});
