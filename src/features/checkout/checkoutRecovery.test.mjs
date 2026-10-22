import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";

const require = createRequire(import.meta.url);

function loadSource(path, mocks = {}) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name), loaded, loaded.exports,
  );
  return loaded.exports;
}

const validation = loadSource("./lib/validation.ts");
const client = loadSource("./lib/checkoutClient.ts", { "@/features/checkout/lib/validation": validation });
const storageModule = loadSource("./lib/checkoutAttemptStorage.ts", { "@/features/checkout/lib/checkoutClient": client });
const key = client.attemptStorageKey("test-user");
const pending = {
  quoteId: "11111111-1111-4111-8111-111111111111",
  idempotencyKey: "22222222-2222-4222-8222-222222222222",
  selection: [{ key: "line-1", productId: "33333333-3333-4333-8333-333333333333", variantId: "44444444-4444-4444-8444-444444444444", quantity: 2 }],
};

function storageFixture(t, raw) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  const values = new Map([[key, raw], ["unrelated-key", "keep"]]);
  const fixture = {
    readBlocked: false, removeBlocked: false,
    getItem(name) { if (this.readBlocked) throw new Error("Storage denied"); return values.get(name) ?? null; },
    removeItem(name) { if (this.removeBlocked) throw new Error("Storage denied"); values.delete(name); },
    setItem(name, value) { values.set(name, value); },
  };
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: fixture });
  t.after(() => { if (previous) Object.defineProperty(globalThis, "sessionStorage", previous); else delete globalThis.sessionStorage; });
  return fixture;
}

for (const raw of ["{dañado", "", "null", "[]", JSON.stringify({ ...pending, selection: [] })]) {
  test(`conserva datos dañados hasta un descarte explícito: ${raw}`, (t) => {
    const storage = storageFixture(t, raw);
    assert.deepEqual(storageModule.readStoredCheckoutAttempt(key), { status: "invalid", raw });
    assert.equal(storage.getItem(key), raw);
    assert.deepEqual(storageModule.discardDamagedCheckoutAttempt(key, raw), { status: "ready", attempt: null });
    assert.equal(storage.getItem(key), null);
    assert.equal(storage.getItem("unrelated-key"), "keep");
  });
}

test("un intento válido no se descarta aunque sustituya a los datos dañados", (t) => {
  const storage = storageFixture(t, "{dañado");
  storage.setItem(key, JSON.stringify(pending));
  assert.deepEqual(storageModule.discardDamagedCheckoutAttempt(key, "{dañado"), { status: "ready", attempt: pending });
  assert.equal(storage.getItem(key), JSON.stringify(pending));
});

test("exige revisar de nuevo los datos dañados si cambiaron antes del descarte", (t) => {
  const storage = storageFixture(t, "nuevo dato dañado");
  assert.deepEqual(storageModule.discardDamagedCheckoutAttempt(key, "{dañado"), { status: "invalid", raw: "nuevo dato dañado" });
  assert.equal(storage.getItem(key), "nuevo dato dañado");
});

test("el almacenamiento inaccesible se puede reintentar sin borrar un intento válido", (t) => {
  const storage = storageFixture(t, JSON.stringify(pending));
  storage.readBlocked = true;
  assert.deepEqual(storageModule.readStoredCheckoutAttempt(key), { status: "unavailable" });
  storage.readBlocked = false;
  assert.deepEqual(storageModule.readStoredCheckoutAttempt(key), { status: "ready", attempt: pending });
});

test("no desbloquea el flujo si el navegador impide descartar los datos", (t) => {
  const storage = storageFixture(t, "{dañado");
  storage.removeBlocked = true;
  assert.deepEqual(storageModule.discardDamagedCheckoutAttempt(key, "{dañado"), { status: "unavailable" });
  assert.equal(storage.getItem(key), "{dañado");
});

function find(node, predicate) {
  if (!node || typeof node !== "object") return null;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const found = find(child, predicate);
    if (found) return found;
  }
  return null;
}

function formFixture(t) {
  const slots = [];
  const effects = [];
  const calls = [];
  let index = 0;
  const hooks = {
    ...React,
    useState(initial) {
      const current = index++;
      if (!slots[current]) slots[current] = { value: initial };
      return [slots[current].value, (value) => { slots[current].value = typeof value === "function" ? value(slots[current].value) : value; }];
    },
    useRef(initial) {
      const current = index++;
      if (!slots[current]) slots[current] = { current: initial };
      return slots[current];
    },
    useEffect(effect, dependencies) {
      const current = index++;
      const old = slots[current];
      if (!old || dependencies.some((value, position) => !Object.is(value, old.dependencies[position]))) {
        effects.push(() => { old?.cleanup?.(); slots[current] = { dependencies, cleanup: effect() }; });
      }
    },
  };
  const { CheckoutForm } = loadSource("./components/CheckoutForm.tsx", {
    react: hooks,
    "next/link": "a",
    "@/components/ui/button": { Button: "button" },
    "@/components/ui/input": { Input: "input" },
    "@/components/ui/native-select": { NativeSelect: "select" },
    "@/components/ui/textarea": { Textarea: "textarea" },
    "@/features/loading/Loading": { FormSkeleton: "div", LoadingRegion: "div", LoadingIndicator: "span", Skeleton: "span" },
    "@/features/loading/LoadingButton": { LoadingButton: "button" },
    "@/features/cart/context/CartContext": { useCart: () => ({ initialized: true, cart: pending.selection, validation: null }) },
    "@/features/checkout/lib/validation": validation,
    "@/features/checkout/lib/checkoutAttemptStorage": storageModule,
    "@/features/checkout/lib/checkoutClient": { ...client, checkoutRequest: async (path, body) => {
      calls.push({ path, body });
      if (path === "/api/checkout/opciones") return { products: [], locations: [] };
      throw new client.CheckoutRequestError("Respuesta interrumpida");
    } },
    "@/features/checkout/components/CheckoutSummary": { CheckoutSummary: "aside" },
  });
  const oldWindow = globalThis.window;
  const oldDocument = globalThis.document;
  const oldFrame = globalThis.requestAnimationFrame;
  globalThis.window = { addEventListener() {}, removeEventListener() {} };
  globalThis.document = { visibilityState: "visible", addEventListener() {}, removeEventListener() {} };
  globalThis.requestAnimationFrame = () => 0;
  t.after(() => {
    slots.forEach((slot) => slot?.cleanup?.());
    for (const [name, value] of [["window", oldWindow], ["document", oldDocument], ["requestAnimationFrame", oldFrame]]) {
      if (value === undefined) delete globalThis[name]; else globalThis[name] = value;
    }
  });
  function render() {
    index = 0;
    return CheckoutForm({ userId: "test-user", initialContact: { contactName: "Cuenta de prueba", contactEmail: "test@example.invalid", contactPhone: "999999999" } });
  }
  return {
    calls,
    render,
    async settle() {
      let tree;
      for (let pass = 0; pass < 4; ++pass) {
        tree = render();
        effects.splice(0).forEach((effect) => effect());
        await new Promise((resolve) => setImmediate(resolve));
      }
      return tree;
    },
  };
}

for (const raw of ["{dañado", JSON.stringify({ ...pending, selection: [] })]) {
  test(`el formulario permite continuar tras confirmar el descarte: ${raw}`, async (t) => {
    const storage = storageFixture(t, raw);
    const fixture = formFixture(t);
    let tree = await fixture.settle();
    const discard = find(tree, (node) => node.props?.children === "Descartar datos dañados y continuar");
    assert.equal(discard.props.disabled, true);
    discard.props.onClick();
    assert.equal(storage.getItem(key), raw);
    find(tree, (node) => node.type === "input" && node.props.type === "checkbox").props.onChange({ target: { checked: true } });
    tree = fixture.render();
    find(tree, (node) => node.props?.children === "Descartar datos dañados y continuar").props.onClick();
    tree = await fixture.settle();
    assert.equal(storage.getItem(key), null);
    assert.ok(find(tree, (node) => node.type === "form" && node.props.className === "checkout-form"));
    assert.equal(find(tree, (node) => node.type === "fieldset").props.disabled, false);
    assert.equal(fixture.calls.some((call) => call.path === "/api/checkout/pedidos"), false);
  });
}

test("un intento pendiente se recupera con los mismos identificadores y sin opción de descartarlo", async (t) => {
  const storage = storageFixture(t, JSON.stringify(pending));
  const fixture = formFixture(t);
  let tree = await fixture.settle();
  assert.equal(find(tree, (node) => node.props?.children === "Descartar datos dañados y continuar"), null);
  const request = { quoteId: pending.quoteId, idempotencyKey: pending.idempotencyKey };
  assert.deepEqual(fixture.calls.filter((call) => call.path === "/api/checkout/pedidos"), [{ path: "/api/checkout/pedidos", body: request }]);
  await find(tree, (node) => node.props?.children === "Recuperar resultado del pedido").props.onClick();
  tree = await fixture.settle();
  assert.equal(fixture.calls.filter((call) => call.path === "/api/checkout/pedidos").length, 2);
  assert.deepEqual(fixture.calls.at(-1).body, request);
  assert.equal(storage.getItem(key), JSON.stringify(pending));
  assert.ok(find(tree, (node) => node.props?.children === "Recuperar resultado del pedido"));
});

test("reintentar la lectura recupera el formulario cuando el almacenamiento vuelve a estar disponible", async (t) => {
  const storage = storageFixture(t, null);
  storage.readBlocked = true;
  const fixture = formFixture(t);
  let tree = await fixture.settle();
  assert.equal(find(tree, (node) => node.props?.children === "Descartar datos dañados y continuar"), null);
  storage.readBlocked = false;
  find(tree, (node) => node.props?.children === "Reintentar lectura del intento").props.onClick();
  tree = await fixture.settle();
  assert.equal(find(tree, (node) => node.type === "fieldset").props.disabled, false);
});

test("reintentar tras un bloqueo recupera el intento válido sin sustituirlo por otro pedido", async (t) => {
  const storage = storageFixture(t, JSON.stringify(pending));
  storage.readBlocked = true;
  const fixture = formFixture(t);
  let tree = await fixture.settle();
  assert.equal(fixture.calls.some((call) => call.path === "/api/checkout/pedidos"), false);
  storage.readBlocked = false;
  find(tree, (node) => node.props?.children === "Reintentar lectura del intento").props.onClick();
  tree = await fixture.settle();
  assert.deepEqual(fixture.calls.find((call) => call.path === "/api/checkout/pedidos").body, {
    quoteId: pending.quoteId, idempotencyKey: pending.idempotencyKey,
  });
  assert.equal(storage.getItem(key), JSON.stringify(pending));
  assert.equal(find(tree, (node) => node.props?.children === "Descartar datos dañados y continuar"), null);
});

test("si aparece un intento válido antes del descarte, el formulario lo recupera sin borrarlo", async (t) => {
  const storage = storageFixture(t, "{dañado");
  const fixture = formFixture(t);
  let tree = await fixture.settle();
  find(tree, (node) => node.type === "input" && node.props.type === "checkbox").props.onChange({ target: { checked: true } });
  tree = fixture.render();
  storage.setItem(key, JSON.stringify(pending));
  find(tree, (node) => node.props?.children === "Descartar datos dañados y continuar").props.onClick();
  tree = await fixture.settle();
  assert.equal(storage.getItem(key), JSON.stringify(pending));
  assert.ok(find(tree, (node) => node.props?.children === "Recuperar resultado del pedido"));
  assert.equal(find(tree, (node) => node.props?.children === "Descartar datos dañados y continuar"), null);
});
