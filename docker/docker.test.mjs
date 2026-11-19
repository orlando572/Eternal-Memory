import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

// Comprobaciones estáticas del entorno Docker (TSK-44). No ejecutan Docker: eso lo prueba quien lo tenga instalado.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const compose = read("docker-compose.yml");
const envExample = read(".env.example");
const script = readFileSync(new URL("./db/apply-migrations.sh", import.meta.url));

const variablesIn = (text) => new Set([...text.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((match) => match[1]));
const declared = variablesIn(envExample);

test("el compose define la tienda, la base de datos y el aplicador de migraciones", () => {
  for (const service of ["app", "db", "db-migrate"]) assert.match(compose, new RegExp(`^  ${service}:`, "m"), service);
  assert.match(compose, /^  db-data:/m);
  assert.match(compose, /^  eternal:/m);
  assert.match(compose, /pg_isready/);
  assert.match(compose, /condition: service_healthy/);
  assert.match(compose, /\/var\/lib\/postgresql\/data/);
});

test("la tienda espera a que la base de datos esté sana y recibe las claves solo al ejecutarse", () => {
  // Cada servicio empieza en una línea con exactamente dos espacios de sangría.
  const app = compose.slice(compose.search(/^  app:/m), compose.search(/^  db:/m));
  assert.match(app, /depends_on:\s+db:\s+condition: service_healthy/);
  const buildArgs = app.slice(app.indexOf("args:"), app.indexOf("image:"));
  assert.doesNotMatch(buildArgs, /SECRET|STRIPE/, "las claves privadas no se pasan como argumentos de compilación");
  for (const name of ["SUPABASE_SECRET_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]) assert.match(app.slice(app.indexOf("environment:")), new RegExp(name));
});

test("la imagen de la base de datos coincide con la versión mayor de supabase/config.toml", () => {
  const major = read("supabase/config.toml").match(/^major_version = (\d+)/m)[1];
  const images = [...compose.matchAll(/image: supabase\/postgres:(\d+)\./g)].map((match) => match[1]);
  assert.equal(images.length, 2);
  assert.ok(images.every((value) => value === major), `config.toml usa ${major}`);
});

test("todas las variables del compose están documentadas en .env.example", () => {
  const used = new Set([...compose.matchAll(/\$\{([A-Z][A-Z0-9_]*)/g)].map((match) => match[1]));
  assert.ok(used.size >= 8);
  for (const name of used) assert.ok(declared.has(name), `${name} falta en .env.example`);
});

test("todas las variables de entorno que usa la aplicación están en .env.example", () => {
  const ignored = new Set(["NODE_ENV", "NEXT_RUNTIME", "NEXT_PHASE", "PORT", "HOSTNAME", "NEXT_TELEMETRY_DISABLED"]);
  const used = new Set();
  for (const file of readdirSync(new URL("../src/", import.meta.url), { recursive: true })) {
    if (!/\.(ts|tsx)$/.test(file)) continue;
    for (const match of read(`src/${file}`).matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)) if (!ignored.has(match[1])) used.add(match[1]);
  }
  assert.ok(used.size >= 5);
  for (const name of used) assert.ok(declared.has(name), `${name} falta en .env.example`);
});

test(".env.example no contiene secretos reales", () => {
  assert.doesNotMatch(envExample, /sk_(live|test)_[A-Za-z0-9]{8,}/);
  assert.doesNotMatch(envExample, /whsec_[A-Za-z0-9]{8,}/);
  assert.doesNotMatch(envExample, /sb_(secret|publishable)_/);
  assert.doesNotMatch(envExample, /eyJ[A-Za-z0-9_-]{15,}\./, "ningún JWT");
  assert.match(envExample, /^SUPABASE_SECRET_KEY=$/m);
  assert.match(envExample, /^STRIPE_SECRET_KEY=$/m);
  assert.match(envExample, /^STRIPE_WEBHOOK_SECRET=$/m);
});

test("la plantilla se versiona, .env no, y el script de contenedor conserva los saltos de línea LF", () => {
  const gitignore = read(".gitignore");
  assert.match(gitignore, /^\.env\*$/m);
  assert.match(gitignore, /^!\.env\.example$/m);
  assert.ok(gitignore.indexOf("!.env.example") > gitignore.indexOf(".env*"), "la excepción va después de la regla general");
  assert.match(read(".gitattributes"), /^\*\.sh text eol=lf$/m);
  assert.ok(!script.includes(0x0d), "apply-migrations.sh no debe tener retornos de carro (CRLF)");
});

test("el aplicador usa transacciones, omite lo ya aplicado y respeta el orden", () => {
  const text = script.toString("utf8");
  assert.match(text, /^#!\/bin\/sh/);
  assert.match(text, /set -eu/);
  assert.match(text, /ON_ERROR_STOP=1/);
  assert.match(text, /--single-transaction/);
  assert.match(text, /local_dev\.applied_scripts/);
  assert.match(text, /ls \/migrations\/\*\.sql \| sort/);
  assert.ok(text.indexOf("/seeds/bootstrap/*.sql") < text.indexOf("/migrations/*.sql"), "las piezas de Supabase van antes de las migraciones");
  assert.ok(text.indexOf("/migrations/*.sql") < text.indexOf("/seeds/[0-9]*.sql"), "migraciones antes que datos de prueba");
  assert.match(text, /apply supabase_admin "\$file" "bootstrap\/"/, "las piezas de Supabase se aplican como supabase_admin");
  assert.match(text, /apply postgres "\$file" ""/, "las migraciones se aplican como postgres");
  assert.match(compose, /\.\/supabase\/migrations:\/migrations:ro/);
  assert.match(compose, /\.\/docker\/db:\/seeds:ro/);
});

test("el arranque crea las tablas de Storage que usan las migraciones, que la imagen no trae", () => {
  const bootstrap = read("docker/db/bootstrap/10-storage.sql");
  const migrations = readdirSync(new URL("../supabase/migrations/", import.meta.url)).filter((file) => file.endsWith(".sql"));
  const used = new Set();
  for (const file of migrations) for (const match of read(`supabase/migrations/${file}`).matchAll(/\bstorage\.([a-z_]+)/g)) used.add(match[1]);
  assert.ok(used.has("buckets") && used.has("objects"), "las migraciones usan storage.buckets y storage.objects");
  for (const table of used) assert.match(bootstrap, new RegExp(`create table if not exists storage\\.${table}\\b`), `falta storage.${table}`);
  // Columnas que las migraciones leen o escriben.
  const buckets = bootstrap.slice(bootstrap.indexOf("create table if not exists storage.buckets"), bootstrap.indexOf("create table if not exists storage.objects"));
  for (const column of ["id text primary key", "name text", "public boolean", "file_size_limit bigint", "allowed_mime_types text[]"]) assert.ok(buckets.includes(column), column);
  const objects = bootstrap.slice(bootstrap.indexOf("create table if not exists storage.objects"));
  for (const column of ["bucket_id text", "name text"]) assert.ok(objects.includes(column), column);
  // Las migraciones crean políticas sobre storage.objects: `postgres` debe ser su dueño.
  assert.match(bootstrap, /alter table storage\.objects owner to postgres/);
  assert.match(bootstrap, /enable row level security/);
});
