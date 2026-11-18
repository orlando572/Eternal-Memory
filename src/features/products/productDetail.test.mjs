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

const detail = loadSource("./lib/productDetail.ts");
const price = (value) => `S/ ${value.toFixed(2)}`;
const ids = (items) => items.map((item) => item.id);

test("los relacionados excluyen el producto actual, no se repiten y son como máximo cuatro", () => {
  const candidates = ["a", "actual", "b", "b", "c", "d", "e"].map((id) => ({ id }));
  assert.deepEqual(ids(detail.selectRelatedProducts(candidates, "actual")), ["a", "b", "c", "d"]);
  assert.deepEqual(ids(detail.selectRelatedProducts(candidates, "actual", 2)), ["a", "b"]);
});

test("sin otros productos de la categoría no hay relacionados", () => {
  assert.deepEqual(detail.selectRelatedProducts([], "actual"), []);
  assert.deepEqual(detail.selectRelatedProducts([{ id: "actual" }], "actual"), []);
});

test("las tarifas de envío siguen las zonas del checkout y descartan filas no válidas", () => {
  const rates = detail.readShippingRates([
    { zone: "rest_of_peru", price_pen: "25.00" },
    { zone: "lima", price_pen: 5 },
    { zone: "arequipa_province", price_pen: 10 },
  ]);
  assert.deepEqual(rates, [
    { zone: "arequipa_province", label: "Provincia de Arequipa", pricePen: 10 },
    { zone: "rest_of_peru", label: "Resto del Perú", pricePen: 25 },
  ]);
  assert.deepEqual(detail.readShippingRates([{ zone: "rest_of_peru", price_pen: null }, { zone: "arequipa_province", price_pen: -1 }]), []);
  assert.deepEqual(detail.readShippingRates(null), []);
});

test("el texto de envío muestra los costos por zona sin prometer plazos", () => {
  const text = detail.shippingSummary(detail.readShippingRates([
    { zone: "arequipa_province", price_pen: 10 },
    { zone: "rest_of_peru", price_pen: 25 },
  ]), price);
  assert.match(text, /^Provincia de Arequipa: S\/ 10\.00 · Resto del Perú: S\/ 25\.00\./);
  assert.match(text, /por pedido/);
  assert.match(text, /algunos distritos no tienen cobertura/);
  assert.doesNotMatch(text, /garantiza|días|horas|inmediat/i);
  assert.equal(detail.shippingSummary([], price), "El costo de envío se calcula en el resumen del pedido según el distrito de entrega.");
});

test("el grabado refleja la regla activa y el límite de 80 caracteres del checkout", () => {
  assert.deepEqual(detail.readEngravingOption({ unit_surcharge_pen: "25.00", max_characters: 300 }), { unitSurchargePen: 25, maxCharacters: 80 });
  assert.deepEqual(detail.readEngravingOption({ unit_surcharge_pen: 0, max_characters: 40 }), { unitSurchargePen: 0, maxCharacters: 40 });
  assert.equal(detail.readEngravingOption({ unit_surcharge_pen: "x", max_characters: 40 }), null);
  assert.equal(detail.readEngravingOption(null), null);
  assert.equal(detail.engravingSummary({ unitSurchargePen: 25, maxCharacters: 80 }, price),
    "Disponible como opción al revisar tu pedido: S/ 25.00 por unidad, con un nombre de hasta 80 caracteres.");
  assert.equal(detail.engravingSummary(null, price), "Este producto no admite grabado.");
  assert.equal(detail.engravingSummary(undefined, price), null);
});
