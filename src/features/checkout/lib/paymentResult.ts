// Lógica de la pantalla de resultado sin dependencias de React ni del servidor,
// para poder probarla con `node --test`.

export type ResultOrder = { status: string; paymentStatus: string; reservationExpiresAt: string };

export type PaymentView = "paid" | "pending" | "canceled" | "expired" | "review";

/** Intervalo entre consultas del estado mientras el pago sigue pendiente. */
export const POLL_INTERVAL_MS = 3_000;
/** Tras este tiempo se deja de consultar sola y se ofrece comprobar a mano. */
export const POLL_MAX_MS = 3 * 60_000;

/**
 * Qué vista corresponde al pedido. Solo el estado guardado en la base de datos decide:
 * volver desde Stripe con la URL de éxito, por sí sola, nunca muestra el pedido como pagado.
 */
export function paymentResultView(order: ResultOrder, options: { canceledByUser: boolean; now: number }): PaymentView {
  if (order.status === "review_required") return "review";
  if (order.paymentStatus === "paid" && ["paid", "processing", "shipped", "completed"].includes(order.status)) return "paid";
  if (order.status === "canceled" || order.paymentStatus === "failed") return "canceled";
  if (order.status === "pending_payment") {
    if (Date.parse(order.reservationExpiresAt) <= options.now) return "expired";
    return options.canceledByUser ? "canceled" : "pending";
  }
  // Estados que esta pantalla no conoce (p. ej. reembolsado) se revisan en lugar de afirmar algo.
  return "review";
}

/** Solo un pedido pendiente con reserva vigente admite un nuevo intento de pago. */
export function canRetryPayment(order: ResultOrder, now: number): boolean {
  return order.status === "pending_payment" && order.paymentStatus === "pending" && Date.parse(order.reservationExpiresAt) > now;
}

/** La redirección solo se acepta hacia la página de pago de Stripe. */
export function isStripeCheckoutUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "checkout.stripe.com";
  } catch {
    return false;
  }
}

/** TSK-14 sustituirá este destino por `/perfil/historial/[id]` cuando exista el detalle. */
export const orderHistoryHref = () => "/perfil/historial";
