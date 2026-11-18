import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function loadSource(path) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const loaded = { exports: {} };
  new Function("module", "exports", outputText)(loaded, loaded.exports);
  return loaded.exports;
}

const params = loadSource("./catalogParams.ts");
const presentation = loadSource("./catalogPresentation.ts");
const normalize = (raw) => params.normalizeCatalogParams(raw);

test("sin parámetros usa relevancia, sin rango de precio y la página 1", () => {
  assert.deepEqual(normalize({}), {
    query: "", categorySlug: null, sort: "relevancia", minPrice: null, maxPrice: null, page: 1, pageSize: 12,
  });
});

test("acepta los cuatro órdenes y vuelve a relevancia ante uno desconocido", () => {
  for (const sort of ["relevancia", "precio-asc", "precio-desc", "nombre"]) {
    assert.equal(normalize({ orden: sort }).sort, sort);
  }
  assert.equal(normalize({ orden: "PRECIO-ASC" }).sort, "precio-asc");
  assert.equal(normalize({ orden: "precio" }).sort, "relevancia");
  assert.equal(normalize({ orden: "name.desc" }).sort, "relevancia");
  assert.equal(normalize({ orden: "" }).sort, "relevancia");
  assert.equal(normalize({ orden: ["nombre", "precio-asc"] }).sort, "nombre");
});

test("acepta importes en soles con hasta dos decimales", () => {
  assert.deepEqual(pick(normalize({ min: "100", max: "450.5" })), { minPrice: 100, maxPrice: 450.5 });
  assert.deepEqual(pick(normalize({ min: " 0 ", max: "0" })), { minPrice: 0, maxPrice: 0 });
  assert.deepEqual(pick(normalize({ min: "99.99" })), { minPrice: 99.99, maxPrice: null });
  assert.deepEqual(pick(normalize({ max: "1200" })), { minPrice: null, maxPrice: 1200 });
});

test("descarta importes negativos, no numéricos o con formato ambiguo", () => {
  for (const value of ["-5", "+5", "abc", "1e3", "1,500", "10.999", "12345678", "NaN", "Infinity", ".5", "5.", " "]) {
    assert.equal(params.parseCatalogPrice(value), null, value);
  }
  assert.deepEqual(pick(normalize({ min: "-10", max: "abc" })), { minPrice: null, maxPrice: null });
  assert.deepEqual(pick(normalize({ min: "-10", max: "300" })), { minPrice: null, maxPrice: 300 });
});

test("un mínimo mayor que el máximo vuelve a no limitar el precio", () => {
  assert.deepEqual(pick(normalize({ min: "500", max: "100" })), { minPrice: null, maxPrice: null });
  assert.deepEqual(pick(normalize({ min: "100", max: "100" })), { minPrice: 100, maxPrice: 100 });
});

test("los nuevos parámetros conviven con categoría, búsqueda y página", () => {
  const filters = normalize({ q: " urna ", categoria: "flores", orden: "precio-desc", min: "50", max: "900", pagina: "3" });
  assert.deepEqual(filters, {
    query: "urna", categorySlug: "arreglos-florales", sort: "precio-desc", minPrice: 50, maxPrice: 900, page: 3, pageSize: 12,
  });
  assert.equal(normalize({ pagina: "0", orden: "nombre" }).page, 1);
});

test("lee los parámetros de la API con los mismos nombres de la URL", () => {
  const raw = params.readCatalogSearchParams(new URLSearchParams("q=caja&categoria=urnas&orden=nombre&min=10&max=20&pagina=2"));
  assert.deepEqual(raw, { q: "caja", categoria: "urnas", orden: "nombre", min: "10", max: "20", pagina: "2" });
});

test("solo el orden por precio o un rango requieren el precio calculado", () => {
  assert.equal(params.usesCatalogPrice({ sort: "relevancia", minPrice: null, maxPrice: null }), false);
  assert.equal(params.usesCatalogPrice({ sort: "nombre", minPrice: null, maxPrice: null }), false);
  assert.equal(params.usesCatalogPrice({ sort: "precio-asc", minPrice: null, maxPrice: null }), true);
  assert.equal(params.usesCatalogPrice({ sort: "relevancia", minPrice: 0, maxPrice: null }), true);
});

test("el enlace omite valores por defecto y conserva el resto", () => {
  const base = { query: "", categorySlug: null, sort: "relevancia", minPrice: null, maxPrice: null, page: 1 };
  assert.equal(presentation.catalogHref(base), "/catalogo");
  assert.equal(presentation.catalogHref({ query: "", categorySlug: "urnas", page: 1 }), "/catalogo?categoria=urnas");
  assert.equal(
    presentation.catalogHref({ ...base, query: "caja", categorySlug: "urnas", sort: "precio-asc", minPrice: 0, maxPrice: 250.5, page: 2 }),
    "/catalogo?q=caja&categoria=urnas&orden=precio-asc&min=0&max=250.5&pagina=2",
  );
  const roundTrip = normalize(Object.fromEntries(new URL(presentation.catalogHref({ ...base, sort: "nombre", minPrice: 10, page: 4 }), "http://x").searchParams));
  assert.deepEqual(pick(roundTrip), { minPrice: 10, maxPrice: null });
  assert.equal(roundTrip.sort, "nombre");
  assert.equal(roundTrip.page, 4);
});

function pick(filters) {
  return { minPrice: filters.minPrice, maxPrice: filters.maxPrice };
}
