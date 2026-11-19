import { checkoutFailure, checkoutHeaders } from "@/features/checkout/lib/http";
import { getCheckoutOrder } from "@/features/checkout/services/checkoutService";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    return Response.json(await getCheckoutOrder((await context.params).id), { headers: checkoutHeaders });
  } catch (error) { return checkoutFailure(error); }
}
