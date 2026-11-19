import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

// Recorrido completo con la lógica real de cada módulo: catálogo → carrito → checkout → pago →
// resultado → historial. La base de datos y Stripe se simulan; no se consulta ningún servicio.

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

const validation = loadSource("./lib/validation.ts");
const checkoutClient = loadSource("./lib/checkoutClient.ts", { "@/features/checkout/lib/validation": validation });
const payment = loadSource("./lib/payment.ts", { "@/features/checkout/lib/validation": validation });
const result = loadSource("./lib/paymentResult.ts");
const cartTypes = loadSource("../cart/types/cart.ts");
const cartStorage = loadSource("../cart/lib/cartStorage.ts");
const { reducer, initialState } = loadSource("../cart/context/CartContext.tsx", {
  "@/features/cart/types/cart": cartTypes,
  "@/features/cart/lib/cartStorage": cartStorage,
}, "\nexport { reducer, initialState };\n");
const accountOrders = loadSource("../account-orders/lib/accountOrders.ts");
const presentation = loadSource("../account-orders/lib/orderPresentation.ts");
const transitions = loadSource("../admin-orders/lib/orderTransitions.ts");

const PRODUCT = "11111111-1111-4111-8111-111111111111";
const VARIANT = "22222222-2222-4222-8222-222222222222";
const ORDER_ID = "33333333-3333-4333-8333-333333333333";
const SESSION = "cs_test_journey";
const UNIT_PRICE = 365; // el precio lo decide el servidor, no el navegador
const DELIVERY = 10;

// Línea que el catálogo entrega al carrito (con un precio de pantalla que no se usa para cobrar).
const catalogItem = { key: "linea-1", id: VARIANT, productId: PRODUCT, variantId: VARIANT, nombre: "Urna de roble", categoria: "Urnas", precio: "S/ 1.00", badge: "", badgeTipo: "neutral", selectedOption: "Mediana", quantity: 1 };

const contact = { contactName: "Evelyn Prueba", contactEmail: "prueba@example.com", contactPhone: "+51900000000", addressLine: "Calle Real 123", addressDetail: "", ubigeo: "040101" };

// Emula las reglas de `record_payment_event` que el recorrido necesita: evento único, importe exacto y orden pagado.
function ledger(order) {
  const seen = new Set();
  return async (_fn, args) => {
    if (args.p_stripe_session_id !== SESSION) return { data: null, error: { message: "Unknown Stripe session" } };
    if (args.p_event_type === "checkout.session.completed" && args.p_amount_pen !== order.total_pen) return { data: null, error: { message: "Payment amount mismatch" } };
    if (seen.has(args.p_stripe_event_id)) return { data: false, error: null };
    seen.add(args.p_stripe_event_id);
    if (args.p_event_type === "checkout.session.completed") { order.status = "paid"; order.payment_status = "paid"; }
    return { data: true, error: null };
  };
}

const completed = (eventId, amountTotal) => ({ id: eventId, type: "checkout.session.completed", data: { object: { id: SESSION, amount_total: amountTotal, currency: "pen", payment_status: "paid" } } });

function checkoutFromCart(cart) {
  const input = validation.readCheckoutInput({ ...contact, lines: cart.map(({ key, productId, variantId, quantity }) => ({ key, productId, variantId, quantity, customization: null })) });
  const quantity = input.lines.reduce((sum, line) => sum + line.quantity, 0);
  return {
    input,
    order: {
      id: ORDER_ID, status: "pending_payment", payment_status: "pending", created_at: "2026-11-19T12:00:00Z", reservation_expires_at: "2099-01-01T00:00:00Z",
      delivery_pen: DELIVERY, subtotal_pen: UNIT_PRICE * quantity, total_pen: UNIT_PRICE * quantity + DELIVERY,
      order_items: input.lines.map((line) => ({ product_name: catalogItem.nombre, variant_name: catalogItem.selectedOption, quantity: line.quantity, unit_price_pen: UNIT_PRICE })),
    },
  };
}

const viewOf = (order, canceledByUser = false) => result.paymentResultView({ status: order.status, paymentStatus: order.payment_status, reservationExpiresAt: order.reservation_expires_at }, { canceledByUser, now: Date.parse("2026-11-19T12:05:00Z") });

test("catálogo → carrito → checkout → pago → resultado → historial", async () => {
  // 1. El carrito agrupa las unidades de la misma variante.
  let state = reducer(initialState, { type: "initialize", cart: [], warning: null });
  state = reducer(state, { type: "add", item: { ...catalogItem } });
  state = reducer(state, { type: "quantity", key: catalogItem.key, quantity: 2 });
  assert.deepEqual(state.cart.map((line) => [line.variantId, line.quantity]), [[VARIANT, 2]]);

  // 2. El checkout valida la selección y el pedido nace pendiente de pago, con importes del servidor.
  const { input, order } = checkoutFromCart(state.cart);
  assert.equal(input.lines[0].quantity, 2);
  assert.equal(order.total_pen, 740);
  assert.equal(viewOf(order), "pending");

  // 3. Las líneas enviadas a Stripe suman exactamente el total del pedido.
  const items = payment.buildStripeLineItems(order);
  assert.equal(items.reduce((sum, item) => sum + item.quantity * item.price_data.unit_amount, 0), payment.toCents(order.total_pen));

  // 4. Volver de Stripe sin que llegue el webhook no basta para mostrar el pedido como pagado.
  assert.equal(viewOf(order), "pending");
  assert.equal(viewOf(order, true), "canceled");

  // 5. El webhook confirma el pago con el importe correcto; repetirlo no cambia nada.
  const rpc = ledger(order);
  assert.equal(await payment.processPaymentEvent(completed("evt_1", 74_000), rpc), "processed");
  assert.equal(order.status, "paid");
  assert.equal(viewOf(order), "paid");
  assert.equal(await payment.processPaymentEvent(completed("evt_1", 74_000), rpc), "duplicate");
  assert.equal(viewOf(order), "paid");

  // 6. Con el pedido confirmado, el carrito retira lo comprado.
  state = reducer(state, { type: "consume-order", orderId: ORDER_ID, lines: input.lines.map(({ key, productId, variantId, quantity }) => ({ key, productId, variantId, quantity })) });
  assert.deepEqual(state.cart, []);

  // 7. El historial lo lista con las mismas etiquetas y enlaza a su detalle.
  const summary = accountOrders.toAccountOrderSummary({ ...order, total_pen: String(order.total_pen) });
  assert.deepEqual([summary.itemCount, summary.totalPen, summary.status], [2, 740, "paid"]);
  assert.equal(checkoutClient.orderStatusLabel(summary.status), "Pagado");
  assert.equal(checkoutClient.paymentStatusLabel(summary.paymentStatus), "Confirmado");
  assert.equal(presentation.orderDetailHref(summary.id), `/perfil/historial/${ORDER_ID}`);
  assert.equal(result.orderHistoryHref(ORDER_ID), presentation.orderDetailHref(ORDER_ID));

  // 8. A partir de ahí, solo un administrador avanza el estado, y nunca hacia «pagado».
  assert.ok(transitions.findTransition(order.status, "processing"));
  assert.equal(transitions.findTransition(order.status, "paid"), undefined);
});

test("un pago con importe distinto no marca el pedido como pagado ni lo muestra como tal", async () => {
  const { order } = checkoutFromCart([{ ...catalogItem, quantity: 2 }]);
  await assert.rejects(payment.processPaymentEvent(completed("evt_bad", 100), ledger(order)), { code: "PAYMENT_AMOUNT_MISMATCH" });
  assert.equal(order.status, "pending_payment");
  assert.equal(viewOf(order), "pending");
});

test("un pedido sin pago a tiempo termina en la vista de vencimiento y no admite reintento", () => {
  const { order } = checkoutFromCart([{ ...catalogItem }]);
  order.reservation_expires_at = "2026-11-19T12:01:00Z";
  assert.equal(viewOf(order), "expired");
  assert.equal(result.canRetryPayment({ status: order.status, paymentStatus: order.payment_status, reservationExpiresAt: order.reservation_expires_at }, Date.parse("2026-11-19T12:05:00Z")), false);
});

test("el checkout rechaza una selección inválida antes de crear el pedido", () => {
  for (const quantity of [0, -1, 51, 1.5]) {
    assert.throws(() => checkoutFromCart([{ ...catalogItem, quantity }]), { code: "INVALID_CART" });
  }
  assert.throws(() => validation.readCheckoutInput({ ...contact, lines: [] }), { code: "INVALID_CART" });
});
