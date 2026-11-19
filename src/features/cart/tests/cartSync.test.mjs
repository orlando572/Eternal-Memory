import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
function loadSource(path, mocks = {}, extra = "") {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8") + extra, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
  });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name), loaded, loaded.exports,
  );
  return loaded.exports;
}
const storage = loadSource("../lib/cartStorage.ts");
const { reducer, initialState } = loadSource("../context/CartContext.tsx", {
  "@/features/cart/types/cart": loadSource("../types/cart.ts"),
  "@/features/cart/lib/cartStorage": storage,
}, "\nexport { reducer, initialState };\n");
const line = {
  key: "line", id: "variant", productId: "product", variantId: "variant",
  nombre: "Producto de prueba", categoria: "Urnas", selectedOption: "Bronce",
  quantity: 2, precio: "", badge: "", badgeTipo: "neutral",
};
const snapshot = JSON.stringify([line]);
const initialize = () => reducer(initialState, { type: "initialize", cart: [line], snapshot, warning: null });
const synchronize = (state, cart) => reducer(state, { type: "synchronize", cart, snapshot: JSON.stringify(cart), warning: null });

test("cargar el carrito no solicita volver a escribir el almacenamiento", () => {
  assert.equal(initialize().persist, false);
});
test("vaciar desde otra pestaña invalida la validación y no solicita guardar", () => {
  const old = initialize();
  const current = synchronize(old, []);
  assert.deepEqual(current.cart, []);
  assert.equal(current.version, old.version + 1);
  assert.equal(current.validation, null);
  assert.equal(current.persist, false);
});
test("una respuesta anterior a la sincronización no recupera productos", () => {
  const old = initialize();
  const current = synchronize(old, []);
  const late = reducer(current, { type: "validated", version: old.version, result: { lines: [{ key: line.key, unitPricePen: 25 }], totalPen: 50 } });
  assert.equal(late, current);
});
test("adopta incorporaciones y cantidades externas sin duplicar líneas", () => {
  const other = { ...line, key: "second", variantId: "second", quantity: 3 };
  const changed = synchronize(initialize(), [{ ...line, quantity: 5 }, other]);
  assert.deepEqual(changed.cart.map((item) => item.quantity), [5, 3]);
  assert.equal(synchronize(changed, changed.cart), changed);
});
test("una edición local parte de la última selección compartida", () => {
  const current = synchronize(initialize(), [{ ...line, quantity: 7 }]);
  const next = reducer(current, { type: "add", item: { ...line, key: "new", quantity: 1 } });
  assert.equal(next.cart[0].quantity, 8);
  assert.equal(next.persist, true);
});
test("el recibo de escritura no cambia la selección ni su versión", () => {
  const current = reducer(initialize(), { type: "quantity", key: line.key, quantity: 4 });
  const written = JSON.stringify(current.cart);
  const saved = reducer(current, { type: "persisted", version: current.version, snapshot: written });
  assert.equal(saved.cart, current.cart);
  assert.equal(saved.version, current.version);
  assert.equal(saved.snapshot, written);
  assert.equal(saved.persist, false);
});
test("un recibo de escritura antiguo no marca como guardada una selección nueva", () => {
  const old = initialize();
  const current = reducer(old, { type: "clear" });
  assert.equal(reducer(current, { type: "persisted", version: old.version, snapshot }), current);
});
test("una advertencia de almacenamiento conserva la selección en memoria", () => {
  const current = reducer(initialize(), { type: "storage-warning", message: "Almacenamiento bloqueado" });
  assert.deepEqual(current.cart, [line]);
  assert.equal(current.storageWarning, "Almacenamiento bloqueado");
});
test("sincronizar el descuento de un pedido conserva su protección contra duplicados", () => {
  const orderId = "11111111-1111-4111-8111-111111111111";
  const current = synchronize(initialize(), [{ ...line, quantity: 3, consumedOrderIds: [orderId] }]);
  const result = reducer(current, { type: "consume-order", orderId, lines: [{ key: line.key, productId: line.productId, variantId: line.variantId, quantity: 2 }] });
  assert.equal(result.cart[0].quantity, 3);
  assert.deepEqual(result.cart[0].consumedOrderIds, [orderId]);
});

function withStorage(t, getItem) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem } });
  t.after(() => { if (previous) Object.defineProperty(globalThis, "localStorage", previous); else delete globalThis.localStorage; });
}
test("distingue una clave eliminada de un almacenamiento inaccesible", (t) => {
  withStorage(t, () => null);
  assert.equal(storage.readSavedCart().snapshot, null);
  globalThis.localStorage.getItem = () => { throw new Error("Blocked"); };
  const blocked = storage.readSavedCart();
  assert.equal(blocked.snapshot, undefined);
  assert.match(blocked.warning, /bloqueado/);
});
test("un JSON dañado conserva su instantánea e informa del problema", (t) => {
  withStorage(t, () => "{broken");
  const saved = storage.readSavedCart();
  assert.equal(saved.snapshot, "{broken");
  assert.deepEqual(saved.cart, []);
  assert.match(saved.warning, /dañado/);
});
test("leer la selección conserva el formato anterior y los recibos TSK-27", (t) => {
  const orderId = "11111111-1111-4111-8111-111111111111";
  const raw = JSON.stringify([{ ...line, consumedOrderIds: [orderId, orderId, "invalid"] }]);
  withStorage(t, () => raw);
  const saved = storage.readSavedCart();
  assert.equal(saved.snapshot, raw);
  assert.deepEqual(saved.cart[0].consumedOrderIds, [orderId]);
  assert.equal(saved.warning, null);
});
