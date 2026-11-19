import { CheckoutError } from "@/features/checkout/lib/validation";
import { handleStripeWebhook } from "@/features/checkout/services/paymentService";

export const runtime = "nodejs";

// La firma se calcula sobre el cuerpo exacto: se lee como texto, nunca como JSON.
export async function POST(request: Request) {
  try {
    const result = await handleStripeWebhook(await request.text(), request.headers.get("stripe-signature"));
    return Response.json({ received: true, result });
  } catch (error) {
    if (error instanceof CheckoutError) return Response.json({ code: error.code }, { status: error.status });
    return Response.json({ code: "WEBHOOK_UNAVAILABLE" }, { status: 500 });
  }
}
