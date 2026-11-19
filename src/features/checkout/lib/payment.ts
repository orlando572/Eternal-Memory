import { CheckoutError } from "@/features/checkout/lib/validation";

// Lógica de pago sin dependencias de servidor para poder probarla con `node --test`.

export type PaymentOrderLine = { product_name: string; variant_name: string; quantity: number; unit_price_pen: number | string };
export type PaymentOrder = { total_pen: number | string; delivery_pen: number | string; order_items: PaymentOrderLine[] };

export type StripeLineItem = {
  quantity: number;
  price_data: { currency: "pen"; unit_amount: number; product_data: { name: string } };
};

export const toCents = (pen: number | string): number => Math.round(Number(pen) * 100);
export const fromCents = (cents: number): number => cents / 100;

/**
 * Líneas de Stripe a partir de los importes guardados en la base de datos.
 * Si la suma de las líneas no coincide con `total_pen`, se cobra una sola línea con el total.
 */
export function buildStripeLineItems(order: PaymentOrder): StripeLineItem[] {
  const total = toCents(order.total_pen);
  const items: StripeLineItem[] = order.order_items.map((line) => ({
    quantity: line.quantity,
    price_data: {
      currency: "pen",
      unit_amount: toCents(line.unit_price_pen),
      product_data: { name: `${line.product_name} — ${line.variant_name}`.slice(0, 250) },
    },
  }));
  const delivery = toCents(order.delivery_pen);
  if (delivery > 0) {
    items.push({ quantity: 1, price_data: { currency: "pen", unit_amount: delivery, product_data: { name: "Entrega" } } });
  }
  const sum = items.reduce((acc, item) => acc + item.quantity * item.price_data.unit_amount, 0);
  if (!Number.isSafeInteger(total) || total <= 0 || sum !== total) {
    return [{ quantity: 1, price_data: { currency: "pen", unit_amount: total, product_data: { name: "Pedido Eternal Memory" } } }];
  }
  return items;
}

export type WebhookVerifier = { constructEvent(payload: string, header: string, secret: string): StripeEventLike };

export type StripeEventLike = {
  id: string;
  type: string;
  data: { object: { id?: string; amount_total?: number | null; currency?: string | null; payment_status?: string | null } };
};

/** Verifica la firma con el cuerpo sin modificar; cualquier fallo se trata como firma inválida. */
export function readVerifiedEvent(webhooks: WebhookVerifier, rawBody: string, signature: string | null, secret: string): StripeEventLike {
  if (!signature) throw new CheckoutError("INVALID_SIGNATURE", "Falta la firma del evento.", 400);
  try {
    return webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    throw new CheckoutError("INVALID_SIGNATURE", "La firma del evento no es válida.", 400);
  }
}

export type PaymentEventInput = { eventId: string; sessionId: string; type: string; amountPen: number };

const failureEvents = new Set(["checkout.session.expired", "checkout.session.async_payment_failed"]);

/** Devuelve el evento que debe registrarse o `null` si no cambia el estado del pago. */
export function toPaymentEvent(event: StripeEventLike): PaymentEventInput | null {
  const session = event.data.object;
  if (!session?.id) return null;
  if (event.type === "checkout.session.completed") {
    // Solo un pago confirmado marca el pedido como pagado; una sesión completada sin cobro se ignora.
    if (session.payment_status !== "paid") return null;
    if (session.currency?.toLowerCase() !== "pen" || !Number.isSafeInteger(session.amount_total)) {
      throw new CheckoutError("PAYMENT_AMOUNT_MISMATCH", "El importe o la moneda del pago no coinciden.", 400);
    }
    return { eventId: event.id, sessionId: session.id, type: event.type, amountPen: fromCents(session.amount_total as number) };
  }
  if (failureEvents.has(event.type)) {
    return { eventId: event.id, sessionId: session.id, type: event.type, amountPen: fromCents(session.amount_total ?? 0) };
  }
  return null;
}

type Rpc = (fn: "record_payment_event", args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: { message: string } | null }>;

export type PaymentEventResult = "ignored" | "duplicate" | "processed";

export async function processPaymentEvent(event: StripeEventLike, rpc: Rpc): Promise<PaymentEventResult> {
  const input = toPaymentEvent(event);
  if (!input) return "ignored";
  const { data, error } = await rpc("record_payment_event", {
    p_stripe_event_id: input.eventId,
    p_stripe_session_id: input.sessionId,
    p_event_type: input.type,
    p_amount_pen: input.amountPen,
  });
  if (error) {
    if (error.message === "Payment amount mismatch") throw new CheckoutError("PAYMENT_AMOUNT_MISMATCH", "El importe del pago no coincide con el pedido.", 400);
    if (error.message === "Unknown Stripe session") throw new CheckoutError("UNKNOWN_PAYMENT_SESSION", "La sesión de pago no existe.", 404);
    throw new CheckoutError("PAYMENT_UNAVAILABLE", "No se pudo registrar el evento de pago.", 500);
  }
  // `record_payment_event` devuelve false cuando el evento ya estaba registrado.
  return data === false ? "duplicate" : "processed";
}
