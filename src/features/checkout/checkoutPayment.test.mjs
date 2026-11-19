import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import Stripe from "stripe";

const require = createRequire(import.meta.url);

function loadSource(path, mocks = {}) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name), loaded, loaded.exports,
  );
  return loaded.exports;
}

const validation = loadSource("./lib/validation.ts");
const payment = loadSource("./lib/payment.ts", { "@/features/checkout/lib/validation": validation });

const secret = "whsec_test_secret";
const stripe = new Stripe("sk_test_unit");
const completed = (overrides = {}) => ({
  id: "evt_1", type: "checkout.session.completed",
  data: { object: { id: "cs_test_1", amount_total: 12500, currency: "pen", payment_status: "paid", ...overrides } },
});
const sign = (body, timestamp) => stripe.webhooks.generateTestHeaderString({ payload: body, secret, timestamp });

test("una firma inválida o ausente se rechaza", () => {
  const body = JSON.stringify(completed());
  for (const header of [null, "t=1,v1=firma-falsa", sign(body + " ", Math.floor(Date.now() / 1000))]) {
    assert.throws(() => payment.readVerifiedEvent(stripe.webhooks, body, header, secret), { code: "INVALID_SIGNATURE", status: 400 });
  }
});

test("una firma válida devuelve el evento", () => {
  const body = JSON.stringify(completed());
  const event = payment.readVerifiedEvent(stripe.webhooks, body, sign(body, Math.floor(Date.now() / 1000)), secret);
  assert.equal(event.id, "evt_1");
});

test("un evento duplicado se informa y no se vuelve a procesar", async () => {
  const seen = new Set();
  const rpc = async (_fn, args) => {
    const first = !seen.has(args.p_stripe_event_id);
    seen.add(args.p_stripe_event_id);
    return { data: first, error: null };
  };
  assert.equal(await payment.processPaymentEvent(completed(), rpc), "processed");
  assert.equal(await payment.processPaymentEvent(completed(), rpc), "duplicate");
});

test("un importe distinto al del pedido no marca el pedido como pagado", async () => {
  const rpc = async () => ({ data: null, error: { message: "Payment amount mismatch" } });
  await assert.rejects(payment.processPaymentEvent(completed({ amount_total: 100 }), rpc), { code: "PAYMENT_AMOUNT_MISMATCH", status: 400 });
});

test("el importe y la moneda se toman de la sesión de Stripe", async () => {
  let received;
  await payment.processPaymentEvent(completed(), async (_fn, args) => { received = args; return { data: true, error: null }; });
  assert.deepEqual(received, { p_stripe_event_id: "evt_1", p_stripe_session_id: "cs_test_1", p_event_type: "checkout.session.completed", p_amount_pen: 125 });
  await assert.rejects(payment.processPaymentEvent(completed({ currency: "usd" }), async () => ({ data: true, error: null })), { code: "PAYMENT_AMOUNT_MISMATCH" });
});

test("una sesión completada sin cobro y los eventos ajenos se ignoran", async () => {
  const rpc = async () => assert.fail("no debe registrar");
  assert.equal(await payment.processPaymentEvent(completed({ payment_status: "unpaid" }), rpc), "ignored");
  assert.equal(await payment.processPaymentEvent({ id: "evt_2", type: "charge.refunded", data: { object: { id: "ch_1" } } }, rpc), "ignored");
});

test("las expiraciones y fallos se registran sin exigir importe", async () => {
  for (const type of ["checkout.session.expired", "checkout.session.async_payment_failed"]) {
    let received;
    await payment.processPaymentEvent({ id: `evt_${type}`, type, data: { object: { id: "cs_test_1", amount_total: 12500, currency: "pen" } } },
      async (_fn, args) => { received = args; return { data: true, error: null }; });
    assert.equal(received.p_event_type, type);
  }
});

test("una sesión desconocida y un fallo de base de datos devuelven códigos distintos", async () => {
  await assert.rejects(payment.processPaymentEvent(completed(), async () => ({ data: null, error: { message: "Unknown Stripe session" } })), { status: 404 });
  await assert.rejects(payment.processPaymentEvent(completed(), async () => ({ data: null, error: { message: "boom" } })), { status: 500 });
});

test("las líneas de Stripe suman exactamente el total del pedido", () => {
  const order = {
    total_pen: "135.00", delivery_pen: "10.00",
    order_items: [{ product_name: "Urna", variant_name: "Roble", quantity: 2, unit_price_pen: "62.50" }],
  };
  const items = payment.buildStripeLineItems(order);
  assert.equal(items.reduce((sum, i) => sum + i.quantity * i.price_data.unit_amount, 0), 13500);
  assert.ok(items.every((i) => i.price_data.currency === "pen"));
});

test("si las líneas no cuadran con el total se cobra una sola línea con el total", () => {
  const items = payment.buildStripeLineItems({
    total_pen: "100.00", delivery_pen: "0",
    order_items: [{ product_name: "Urna", variant_name: "Roble", quantity: 1, unit_price_pen: "90.00" }],
  });
  assert.equal(items.length, 1);
  assert.equal(items[0].price_data.unit_amount, 10000);
});
