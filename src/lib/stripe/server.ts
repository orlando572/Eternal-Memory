import "server-only";

import Stripe from "stripe";

// Solo se admiten claves de prueba: TSK-11 cubre pagos de prueba, no cobros reales.
export function createStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !/^(sk|rk)_test_/.test(key)) throw new Error("PAYMENT_CONFIGURATION");
  return new Stripe(key);
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !secret.startsWith("whsec_")) throw new Error("PAYMENT_CONFIGURATION");
  return secret;
}
