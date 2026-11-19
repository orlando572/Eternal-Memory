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

const result = loadSource("./lib/paymentResult.ts");
const now = Date.parse("2026-11-19T12:00:00Z");
const future = "2026-11-19T12:20:00Z";
const past = "2026-11-19T11:50:00Z";
const order = (status, paymentStatus, reservationExpiresAt = future) => ({ status, paymentStatus, reservationExpiresAt });
const view = (o, canceledByUser = false) => result.paymentResultView(o, { canceledByUser, now });

test("volver de Stripe con la URL de éxito no muestra el pedido como pagado", () => {
  // El pedido sigue pendiente en la base de datos: la pantalla espera la confirmación del webhook.
  assert.equal(view(order("pending_payment", "pending")), "pending");
});

test("solo el estado guardado marca el pedido como pagado", () => {
  for (const status of ["paid", "processing", "shipped", "completed"]) assert.equal(view(order(status, "paid")), "paid");
  assert.notEqual(view(order("paid", "pending")), "paid");
});

test("cancelado, fallido y cancelación del usuario muestran la vista de pago no completado", () => {
  assert.equal(view(order("canceled", "failed")), "canceled");
  assert.equal(view(order("pending_payment", "failed")), "canceled");
  assert.equal(view(order("pending_payment", "pending"), true), "canceled");
});

test("una reserva vencida sin pago muestra la vista de vencimiento", () => {
  assert.equal(view(order("pending_payment", "pending", past)), "expired");
  assert.equal(view(order("pending_payment", "pending", past), true), "expired");
});

test("un pago fuera de plazo o un estado desconocido se envía a revisión", () => {
  assert.equal(view(order("review_required", "paid")), "review");
  assert.equal(view(order("refunded", "refunded")), "review");
});

test("solo un pedido pendiente con reserva vigente admite reintentar el pago", () => {
  assert.equal(result.canRetryPayment(order("pending_payment", "pending"), now), true);
  assert.equal(result.canRetryPayment(order("pending_payment", "pending", past), now), false);
  assert.equal(result.canRetryPayment(order("canceled", "failed"), now), false);
  assert.equal(result.canRetryPayment(order("paid", "paid"), now), false);
});

test("la redirección solo se acepta hacia la página de pago de Stripe", () => {
  assert.equal(result.isStripeCheckoutUrl("https://checkout.stripe.com/c/pay/cs_test_123"), true);
  for (const bad of ["http://checkout.stripe.com/x", "https://checkout.stripe.com.evil.test/x", "https://evil.test/https://checkout.stripe.com", "javascript:alert(1)", "", null, undefined, 5]) {
    assert.equal(result.isStripeCheckoutUrl(bad), false);
  }
});

test("el sondeo es corto y tiene un límite de duración", () => {
  assert.ok(result.POLL_INTERVAL_MS >= 1_000 && result.POLL_INTERVAL_MS <= 10_000);
  assert.ok(result.POLL_MAX_MS > result.POLL_INTERVAL_MS);
});

test("«Ver mi pedido» lleva al detalle del pedido en el perfil", () => {
  assert.equal(result.orderHistoryHref("96436d50-a677-446c-88b9-98771ed7ef08"), "/perfil/historial/96436d50-a677-446c-88b9-98771ed7ef08");
});
