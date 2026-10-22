import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadSource(path, mocks = {}, extra = "") {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8") + extra, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name), loaded, loaded.exports,
  );
  return loaded.exports;
}

const types = loadSource("../types/cart.ts");
const storage = loadSource("../lib/cartStorage.ts");
const { reducer, initialState } = loadSource("../context/CartContext.tsx", {
  "@/features/cart/types/cart": types,
  "@/features/cart/lib/cartStorage": storage,
}, "\nexport { reducer, initialState };\n");

const orderId = "11111111-1111-4111-8111-111111111111";
const anotherOrderId = "22222222-2222-4222-8222-222222222222";
const line = {
  key: "original-line", id: "variant-1", productId: "product-1", variantId: "variant-1",
  nombre: "Producto de prueba", categoria: "Urnas", selectedOption: "Bronce", quantity: 2,
  precio: "", badge: "", badgeTipo: "neutral",
};
const ordered = { key: line.key, productId: line.productId, variantId: line.variantId, quantity: 2 };
const consume = { type: "consume-order", orderId, lines: [ordered] };
const initialize = (cart = [{ ...line }]) => reducer(initialState, { type: "initialize", cart, warning: null });

test("retira las unidades confirmadas cuando la selección no cambia", () => {
  const state = reducer(initialize(), consume);
  assert.deepEqual(state.cart, []);
});

test("conserva una unidad si se aumenta de dos a tres durante la confirmación", () => {
  const before = initialize();
  const changed = reducer(before, { type: "quantity", key: line.key, quantity: 3 });
  const state = reducer(changed, consume);
  assert.equal(state.cart[0].quantity, 1);
  assert.equal(changed.cart[0].quantity, 3);
  assert.equal(state.validation, null);
  assert.equal(state.version, changed.version + 1);
});

test("no deja cantidades negativas si se reduce la selección durante la espera", () => {
  const changed = reducer(initialize(), { type: "quantity", key: line.key, quantity: 1 });
  assert.deepEqual(reducer(changed, consume).cart, []);
});

test("mantiene las unidades añadidas a la misma variante durante la confirmación", () => {
  const changed = reducer(initialize(), { type: "add", item: { ...line, key: "added-line", quantity: 4 } });
  assert.equal(reducer(changed, consume).cart[0].quantity, 4);
});

test("conserva otra variante incorporada durante la espera", () => {
  const other = { ...line, id: "variant-2", variantId: "variant-2", key: "other-line", quantity: 4 };
  const changed = reducer(initialize(), { type: "add", item: other });
  assert.deepEqual(reducer(changed, consume).cart, [other]);
});

test("no descuenta una línea eliminada y añadida de nuevo con otra clave", () => {
  const removed = reducer(initialize(), { type: "remove", key: line.key });
  const newLine = { ...line, key: "new-selection", quantity: 5 };
  const changed = reducer(removed, { type: "add", item: newLine });
  assert.deepEqual(reducer(changed, consume).cart, [newLine]);
});

for (const change of [{ productId: "other-product" }, { variantId: "other-variant" }]) {
  test(`no descuenta una línea de otra identidad: ${JSON.stringify(change)}`, () => {
    const current = { ...line, ...change, quantity: 5 };
    assert.deepEqual(reducer(initialize([current]), consume).cart, [current]);
  });
}

test("recuperar el mismo pedido no vuelve a descontar las unidades restantes", () => {
  const first = reducer(initialize([{ ...line, quantity: 7 }]), consume);
  assert.equal(first.cart[0].quantity, 5);
  const repeated = reducer(first, consume);
  assert.equal(repeated.cart[0].quantity, 5);
  const changed = reducer(repeated, { type: "add", item: { ...line, key: "new-line", quantity: 1 } });
  assert.equal(reducer(changed, consume).cart[0].quantity, 6);
});

test("un pedido distinto descuenta sus unidades sin olvidar los anteriores", () => {
  const first = reducer(initialize([{ ...line, quantity: 7 }]), consume);
  const secondAction = { type: "consume-order", orderId: anotherOrderId, lines: [{ ...ordered, quantity: 1 }] };
  const second = reducer(first, secondAction);
  assert.equal(second.cart[0].quantity, 4);
  assert.equal(reducer(reducer(second, consume), secondAction).cart[0].quantity, 4);
});

function savedCartFixture(t, cart) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: (key) => key === storage.CART_STORAGE_KEY ? JSON.stringify(cart) : null },
  });
  t.after(() => { if (previous) Object.defineProperty(globalThis, "localStorage", previous); else delete globalThis.localStorage; });
}

test("recargar conserva la cantidad residual y evita repetir el descuento", (t) => {
  const first = reducer(initialize([{ ...line, quantity: 7 }]), consume);
  savedCartFixture(t, first.cart);
  const saved = storage.readSavedCart();
  assert.equal(saved.warning, null);
  const restored = initialize(saved.cart);
  assert.equal(restored.cart[0].quantity, 5);
  assert.equal(reducer(restored, consume).cart[0].quantity, 5);
});

test("los carritos anteriores siguen admitiendo el descuento del pedido", (t) => {
  savedCartFixture(t, [{ ...line, quantity: 3 }]);
  const saved = storage.readSavedCart();
  assert.equal(saved.warning, null);
  assert.equal(reducer(initialize(saved.cart), consume).cart[0].quantity, 1);
});

test("ignora identificadores dañados de pedidos al recuperar el carrito", (t) => {
  savedCartFixture(t, [{ ...line, quantity: 3, consumedOrderIds: [null, false, {}, "", "invalid", anotherOrderId, anotherOrderId] }]);
  const saved = storage.readSavedCart();
  assert.deepEqual(saved.cart[0].consumedOrderIds, [anotherOrderId]);
  assert.equal(reducer(initialize(saved.cart), consume).cart[0].quantity, 1);
});
