import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import React from "react";
import ts from "typescript";

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
const storage = loadSource("./lib/checkoutAttemptStorage.ts", { "@/features/checkout/lib/checkoutClient": client });
const productId = "11111111-1111-4111-8111-111111111111";
const secondProductId = "33333333-3333-4333-8333-333333333333";
const rule = { mode: "urn_name", unitSurchargePen: 25, maxCharacters: 80 };
const location = { ubigeo: "040101", department: "Arequipa", province: "Arequipa", district: "Cercado", is_covered: true };
const line = { key: "line-a", productId, variantId: "22222222-2222-4222-8222-222222222222", quantity: 2, nombre: "Urna de prueba", selectedOption: "Bronce" };

function findAll(node, predicate) {
  if (!node || typeof node !== "object") return [];
  return [...(predicate(node) ? [node] : []), ...[node.props?.children].flat(Infinity).flatMap((child) => findAll(child, predicate))];
}
function fixture(t, cart = [line]) {
  const slots = [];
  const effects = [];
  const calls = [];
  let index = 0;
  let currentOptions = { locations: [location], products: cart.map((item) => ({ id: item.productId, name: item.nombre, customization: { ...rule } })) };
  let quoteHandler;
  const hooks = {
    ...React,
    useState(initial) {
      const position = index++;
      if (!slots[position]) slots[position] = { value: typeof initial === "function" ? initial() : initial };
      return [slots[position].value, (value) => { slots[position].value = typeof value === "function" ? value(slots[position].value) : value; }];
    },
    useRef(initial) {
      const position = index++;
      if (!slots[position]) slots[position] = { current: initial };
      return slots[position];
    },
    useEffect(effect, dependencies) {
      const position = index++;
      const old = slots[position];
      if (!old || dependencies.some((value, offset) => !Object.is(value, old.dependencies[offset]))) {
        effects.push(() => { old?.cleanup?.(); slots[position] = { dependencies, cleanup: effect() }; });
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
    "@/features/cart/context/CartContext": { useCart: () => ({ initialized: true, cart, validation: { lines: cart.map((item) => ({ key: item.key, status: "valid" })) } }) },
    "@/features/checkout/lib/validation": validation,
    "@/features/checkout/lib/checkoutAttemptStorage": storage,
    "@/features/checkout/lib/checkoutClient": { ...client, checkoutRequest: async (path, body) => {
      calls.push({ path, body: structuredClone(body) });
      if (path === "/api/checkout/opciones") return structuredClone(currentOptions);
      if (path === "/api/checkout/resumen") return quoteHandler ? quoteHandler(body) : quote(body);
      throw new Error("Esta prueba no debe crear pedidos");
    } },
    "@/features/checkout/components/CheckoutSummary": { CheckoutSummary: "aside" },
  });
  function quote(body, price = currentOptions.products[0]?.customization?.unitSurchargePen ?? 0) {
    return {
      quoteId: "55555555-5555-4555-8555-555555555555", expiresAt: new Date(Date.now() + 300_000).toISOString(),
      summary: { lines: body.lines.map((item) => ({ ...item, customizationUnitPen: item.customization ? price : 0 })) },
    };
  }
  const previous = Object.fromEntries(["window", "document", "requestAnimationFrame", "sessionStorage"].map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  Object.defineProperties(globalThis, {
    window: { configurable: true, value: new EventTarget() },
    document: { configurable: true, value: Object.assign(new EventTarget(), { visibilityState: "visible" }) },
    requestAnimationFrame: { configurable: true, value: () => 0 },
    sessionStorage: { configurable: true, value: { getItem: () => null } },
  });
  t.after(() => {
    slots.forEach((slot) => slot?.cleanup?.());
    for (const [name, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name];
    }
  });
  function render() {
    index = 0;
    return CheckoutForm({ userId: "engraving-test", initialContact: { contactName: "Cuenta de prueba", contactEmail: "test@example.invalid", contactPhone: "999999999" } });
  }
  function find(predicate) {
    const found = findAll(render(), predicate)[0];
    assert.ok(found, "Debe existir el control solicitado");
    return found;
  }
  async function settle() {
    for (let pass = 0; pass < 4; ++pass) {
      render();
      effects.splice(0).forEach((effect) => effect());
      await new Promise((resolve) => setImmediate(resolve));
    }
    return render();
  }
  return {
    calls, render, settle, quote,
    get options() { return currentOptions; },
    set quoteHandler(handler) { quoteHandler = handler; },
    async refresh(options) {
      currentOptions = structuredClone(options);
      window.dispatchEvent(new Event("focus"));
      await new Promise((resolve) => setTimeout(resolve, 120));
      return settle();
    },
    edit(id, value) { find((node) => node.props?.id === id).props.onChange({ target: { value } }); },
    check(productIndex, checked = true, perUnit = false) {
      const product = findAll(render(), (node) => node.props?.className === "checkout-product")[productIndex];
      const checkbox = findAll(product, (node) => node.type === "input" && node.props.type === "checkbox")[perUnit ? 1 : 0];
      assert.ok(checkbox, "Debe existir la opción de grabado");
      checkbox.props.onChange({ target: { checked } });
    },
    input: (id) => find((node) => node.props?.id === id).props,
    summary: () => find((node) => node.type === "aside").props,
    review: () => find((node) => node.type === "form").props.onSubmit({ preventDefault() {} }),
    latestInput: () => calls.filter((call) => call.path === "/api/checkout/resumen").at(-1)?.body,
    fill() {
      this.edit("contactName", "Nombre editado");
      this.edit("checkout-department", "04");
      this.edit("checkout-province", "0401");
      this.edit("checkout-district", "040101");
      this.edit("addressLine", "Calle de prueba 123");
      this.edit("addressDetail", "Referencia de prueba");
    },
  };
}

for (const missingProduct of [false, true]) {
  test(`no envía grabados ocultos cuando ${missingProduct ? "desaparece el producto de las opciones" : "customization pasa a null"}`, async (t) => {
    const app = fixture(t);
    await app.settle();
    app.fill();
    app.check(0);
    app.edit("engraving-0", "Nombre grabado");
    await app.refresh({ ...app.options, products: missingProduct ? [] : [{ ...app.options.products[0], customization: null }] });
    assert.equal(findAll(app.render(), (node) => node.type === "input" && node.props.type === "checkbox").length, 0);
    await app.review();
    const input = app.latestInput();
    assert.ok(input, "Debe poder solicitar un resumen sin grabado");
    assert.equal(input.lines[0].customization, null);
    assert.equal(input.contactName, "Nombre editado");
    assert.equal(input.addressLine, "Calle de prueba 123");
    assert.equal(input.addressDetail, "Referencia de prueba");
    assert.equal(input.ubigeo, "040101");
    assert.equal(app.input("checkout-department").value, "04");
    assert.equal(app.input("checkout-province").value, "0401");
  });
}

test("retira los nombres individuales y conserva la cantidad al desactivar el grabado", async (t) => {
  const app = fixture(t);
  await app.settle(); app.fill(); app.check(0); app.check(0, true, true);
  app.edit("engraving-0-0", "Nombre uno"); app.edit("engraving-0-1", "Nombre dos");
  await app.review();
  assert.equal(app.latestInput().lines.length, 2);
  await app.refresh({ ...app.options, products: [{ ...app.options.products[0], customization: null }] });
  await app.review();
  assert.deepEqual(app.latestInput().lines, [{ key: line.key, productId, variantId: line.variantId, quantity: 2, customization: null }]);
});

test("si el grabado vuelve a estar disponible no reactiva nombres antiguos", async (t) => {
  const app = fixture(t);
  await app.settle(); app.fill(); app.check(0); app.edit("engraving-0", "Nombre anterior");
  const available = structuredClone(app.options);
  await app.refresh({ ...available, products: [{ ...available.products[0], customization: null }] });
  await app.refresh(available);
  const checkbox = findAll(app.render(), (node) => node.type === "input" && node.props.type === "checkbox")[0];
  assert.equal(checkbox.props.checked, false);
  app.check(0);
  assert.equal(app.input("engraving-0").value, "");
});

test("cambiar solo el precio conserva el nombre y exige revisar el resumen", async (t) => {
  const app = fixture(t);
  await app.settle(); app.fill(); app.check(0); app.edit("engraving-0", "Nombre conservado");
  await app.review();
  assert.equal(app.summary().valid, true);
  await app.refresh({ ...app.options, products: [{ ...app.options.products[0], customization: { ...rule, unitSurchargePen: 30 } }] });
  assert.equal(app.input("engraving-0").value, "Nombre conservado");
  assert.equal(app.summary().valid, false);
  await app.review();
  assert.equal(app.latestInput().lines[0].customization.text, "Nombre conservado");
  assert.equal(app.summary().valid, true);
  assert.equal(app.summary().quote.summary.lines[0].customizationUnitPen, 30);
});

test("un resumen antiguo que responde después del cambio de precio no permite confirmar", async (t) => {
  const app = fixture(t);
  await app.settle(); app.fill(); app.check(0); app.edit("engraving-0", "Nombre conservado");
  let release;
  app.quoteHandler = (body) => new Promise((resolve) => { release = () => resolve(app.quote(body, 25)); });
  const pending = app.review();
  try {
    await app.refresh({ ...app.options, products: [{ ...app.options.products[0], customization: { ...rule, unitSurchargePen: 30 } }] });
  } finally { release(); await pending; }
  assert.equal(app.summary().valid, false);
  assert.equal(app.input("engraving-0").value, "Nombre conservado");
});

test("un resumen pendiente pierde validez si desaparece el grabado", async (t) => {
  const app = fixture(t);
  await app.settle(); app.fill(); app.check(0); app.edit("engraving-0", "Nombre anterior");
  let release;
  app.quoteHandler = (body) => new Promise((resolve) => { release = () => resolve(app.quote(body, 25)); });
  const pending = app.review();
  try {
    await app.refresh({ ...app.options, products: [{ ...app.options.products[0], customization: null }] });
  } finally { release(); await pending; }
  assert.equal(app.summary().valid, false);
});

test("una actualización sin cambios conserva el grabado y la revisión vigente", async (t) => {
  const app = fixture(t);
  await app.settle(); app.fill(); app.check(0); app.edit("engraving-0", "Nombre sin cambios");
  await app.review();
  await app.refresh(app.options);
  assert.equal(app.input("engraving-0").value, "Nombre sin cambios");
  assert.equal(app.summary().valid, true);
});

test("los errores de la siguiente urna usan el índice correcto tras retirar nombres individuales", async (t) => {
  const app = fixture(t, [line, { ...line, key: "line-b", productId: secondProductId }]);
  await app.settle(); app.fill(); app.check(0); app.check(0, true, true);
  app.edit("engraving-0-0", "Nombre uno"); app.edit("engraving-0-1", "Nombre dos");
  app.check(1);
  await app.refresh({ ...app.options, products: app.options.products.map((product) => product.id === productId ? { ...product, customization: null } : product) });
  await app.review();
  const error = findAll(app.render(), (node) => node.props?.id === "error-lines.1.customization.text");
  assert.equal(error.length, 1);
  assert.equal(app.input("engraving-1")["aria-invalid"], true);
});

test("sin seleccionar grabado envía una línea por producto con personalización nula", async (t) => {
  const app = fixture(t);
  await app.settle(); app.fill();
  await app.review();
  assert.equal(app.latestInput().lines.length, 1);
  assert.equal(app.latestInput().lines[0].customization, null);
  assert.equal(app.latestInput().lines[0].quantity, 2);
});
