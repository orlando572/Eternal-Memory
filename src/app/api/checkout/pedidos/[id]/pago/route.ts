import { assertSameOrigin, checkoutFailure, checkoutHeaders } from "@/features/checkout/lib/http";
import { createPaymentSession } from "@/features/checkout/services/paymentService";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const session = await createPaymentSession((await context.params).id, new URL(request.url).origin);
    return Response.json(session, { headers: checkoutHeaders });
  } catch (error) { return checkoutFailure(error); }
}
