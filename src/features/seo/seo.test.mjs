import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function loadSource(path) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const loaded = { exports: {} };
  const require = (name) => { throw new Error(`Módulo no previsto en la prueba: ${name}`); };
  new Function("module", "exports", "require", outputText)(loaded, loaded.exports, require);
  return loaded.exports;
}

const seo = loadSource("./seo.ts");
const urnas = { id: "c1", slug: "urnas", name: "Urnas" };
const product = (extra = {}) => ({
  slug: "urna-serenidad", name: "Urna Serenidad", description: "Urna de bronce pulido.", category: urnas,
  images: [{ id: "i1", src: "https://images.unsplash.com/photo-1", alt: "Urna de bronce", isReference: true }],
  ...extra,
});
const noFilters = { query: "", minPrice: null, maxPrice: null };

test("usa la URL pública válida y, si no hay, el servidor local", () => {
  assert.equal(seo.getSiteUrl("https://eternal.example/"), "https://eternal.example");
  assert.equal(seo.getSiteUrl(" https://eternal.example/tienda/ "), "https://eternal.example/tienda");
  assert.equal(seo.getSiteUrl(""), "http://localhost:3000");
  assert.equal(seo.getSiteUrl(undefined), "http://localhost:3000");
  assert.equal(seo.getSiteUrl("eternal.example"), "http://localhost:3000");
  assert.equal(seo.getSiteUrl("ftp://eternal.example"), "http://localhost:3000");
});

test("limpia la descripción y recorta las largas en una palabra", () => {
  assert.equal(seo.metaDescription("  Urna \n de   bronce ", "otra"), "Urna de bronce");
  assert.equal(seo.metaDescription("   ", "Texto de respaldo"), "Texto de respaldo");
  const long = seo.metaDescription("palabra ".repeat(40), "");
  assert.ok(long.length <= 160);
  assert.ok(long.endsWith("palabra…"));
});

test("la ficha comparte nombre, descripción e imagen del producto", () => {
  const metadata = seo.productMetadata(product());
  assert.equal(metadata.title, "Urna Serenidad");
  assert.equal(metadata.description, "Urna de bronce pulido.");
  assert.equal(metadata.alternates.canonical, "/catalogo/urna-serenidad");
  assert.equal(metadata.openGraph.title, "Urna Serenidad");
  assert.equal(metadata.openGraph.url, "/catalogo/urna-serenidad");
  assert.deepEqual(metadata.openGraph.images, [{ url: "https://images.unsplash.com/photo-1", alt: "Urna de bronce" }]);
});

test("sin descripción ni imagen, la ficha usa un texto propio y la imagen por defecto", () => {
  const metadata = seo.productMetadata(product({ description: "", images: [] }));
  assert.equal(metadata.description, "Urna Serenidad en la categoría Urnas de Eternal Memory.");
  assert.equal(metadata.openGraph, undefined);
});

test("el catálogo nombra la categoría y no indexa búsquedas ni rangos de precio", () => {
  const category = seo.catalogMetadata(urnas, noFilters);
  assert.equal(category.title, "Urnas");
  assert.match(category.description, /^Urnas en el catálogo/);
  assert.equal(category.alternates.canonical, "/catalogo?categoria=urnas");
  assert.equal(category.robots, undefined);
  assert.equal(category.openGraph, undefined);

  const general = seo.catalogMetadata(null, noFilters);
  assert.equal(general.title, "Catálogo");
  assert.equal(general.alternates.canonical, "/catalogo");

  assert.deepEqual(seo.catalogMetadata(null, { ...noFilters, query: "roble" }).robots, { index: false, follow: true });
  assert.deepEqual(seo.catalogMetadata(urnas, { ...noFilters, minPrice: 100 }).robots, { index: false, follow: true });
});

test("el sitemap lista portada, catálogo, categorías y los productos recibidos", () => {
  const entries = seo.sitemapEntries("https://eternal.example", [urnas], [
    { slug: "urna-serenidad", updatedAt: "2026-11-18T00:00:00Z" },
    { slug: "ataud-roble", updatedAt: null },
  ]);
  assert.deepEqual(entries.map((entry) => entry.url), [
    "https://eternal.example/",
    "https://eternal.example/catalogo",
    "https://eternal.example/catalogo?categoria=urnas",
    "https://eternal.example/nosotros",
    "https://eternal.example/contacto",
    "https://eternal.example/envios",
    "https://eternal.example/privacidad",
    "https://eternal.example/terminos",
    "https://eternal.example/catalogo/urna-serenidad",
    "https://eternal.example/catalogo/ataud-roble",
  ]);
  assert.equal(entries[8].lastModified, "2026-11-18T00:00:00Z");
  assert.equal("lastModified" in entries[9], false);
});

test("robots excluye las zonas privadas y enlaza el sitemap", () => {
  const robots = seo.robotsRules("https://eternal.example");
  assert.equal(robots.rules.allow, "/");
  for (const path of ["/admin", "/api", "/checkout", "/perfil", "/login", "/registro"]) {
    assert.ok(robots.rules.disallow.includes(path), path);
  }
  assert.equal(robots.rules.disallow.includes("/catalogo"), false);
  assert.equal(robots.sitemap, "https://eternal.example/sitemap.xml");
});
