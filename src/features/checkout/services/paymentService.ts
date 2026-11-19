import "server-only";

import { requireUser } from "@/features/auth/services/accessService";
import { buildStripeLineItems, processPaymentEvent, readVerifiedEvent, type PaymentEventResult, type WebhookVerifier } from "@/features/checkout/lib/payment";
import { CheckoutError, isUuid } from "@/features/checkout/lib/validation";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { createStripeClient, getStripeWebhookSecret } from "@/lib/stripe/server";

const STRIPE_MIN_SESSION_MINUTES = 31; // Stripe exige al menos 30 minutos de vigencia.

export async function createPaymentSession(orderId: string, origin: string): Promise<{ url: string }> {
  const { user } = await requireUser();
  if (!isUuid(orderId)) throw new CheckoutError("ORDER_NOT_FOUND", "No se encontró el pedido.", 404);
  const client = createPrivilegedClient();

  // El importe se lee siempre de la base de datos, nunca del navegador.
  const { data: order, error } = await client.from("orders")
    .select("id,status,payment_status,reservation_expires_at,delivery_pen,total_pen,contact_email,order_items(product_name,variant_name,quantity,unit_price_pen)")
    .eq("id", orderId).eq("customer_id", user.id).maybeSingle();
  if (error) throw new CheckoutError("PAYMENT_UNAVAILABLE", "No se pudo iniciar el pago. Inténtalo más tarde.", 503);
  if (!order) throw new CheckoutError("ORDER_NOT_FOUND", "No se encontró el pedido.", 404);
  if (order.status !== "pending_payment" || order.payment_status !== "pending") {
    throw new CheckoutError("ORDER_NOT_PAYABLE", "Este pedido ya no admite pago.", 409);
  }
  if (new Date(order.reservation_expires_at).getTime() <= Date.now()) {
    throw new CheckoutError("RESERVATION_EXPIRED", "La reserva del pedido venció. Realiza un nuevo pedido.", 409);
  }

  const stripe = createStripeClient();

  // Una sesión abierta se reutiliza para no duplicar intentos de pago.
  const { data: pending, error: pendingError } = await client.from("payment_attempts")
    .select("stripe_session_id").eq("order_id", order.id).eq("status", "pending").maybeSingle();
  if (pendingError) throw new CheckoutError("PAYMENT_UNAVAILABLE", "No se pudo iniciar el pago. Inténtalo más tarde.", 503);
  if (pending) {
    const existing = await stripe.checkout.sessions.retrieve(pending.stripe_session_id);
    if (existing.status === "open" && existing.url) return { url: existing.url };
    throw new CheckoutError("PAYMENT_PENDING", "El pago anterior aún se está procesando. Inténtalo en unos minutos.", 409);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: order.id,
    customer_email: order.contact_email,
    metadata: { order_id: order.id },
    line_items: buildStripeLineItems(order),
    expires_at: Math.floor(Date.now() / 1000) + STRIPE_MIN_SESSION_MINUTES * 60,
    success_url: `${origin}/checkout/resultado?pedido=${order.id}`,
    cancel_url: `${origin}/checkout/resultado?pedido=${order.id}&cancelado=1`,
  });
  if (!session.url) throw new CheckoutError("PAYMENT_UNAVAILABLE", "No se pudo iniciar el pago. Inténtalo más tarde.", 503);

  const { error: registerError } = await client.rpc("register_payment_session", {
    p_order_id: order.id, p_stripe_session_id: session.id, p_amount_pen: Number(order.total_pen),
  });
  if (registerError) {
    // El pedido cambió mientras se creaba la sesión: se cierra para que no pueda pagarse.
    await stripe.checkout.sessions.expire(session.id).catch(() => undefined);
    throw new CheckoutError("PAYMENT_UNAVAILABLE", "No se pudo iniciar el pago. Revisa el estado del pedido.", 409);
  }
  return { url: session.url };
}

export async function handleStripeWebhook(rawBody: string, signature: string | null): Promise<PaymentEventResult> {
  const stripe = createStripeClient();
  const event = readVerifiedEvent(stripe.webhooks as unknown as WebhookVerifier, rawBody, signature, getStripeWebhookSecret());
  const client = createPrivilegedClient();
  return processPaymentEvent(event, (fn, args) => client.rpc(fn, args));
}
