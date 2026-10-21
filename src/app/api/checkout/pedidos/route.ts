import { checkoutFailure, checkoutHeaders, readCheckoutBody } from "@/features/checkout/lib/http";
import { createCheckoutOrder } from "@/features/checkout/services/checkoutService";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    return Response.json(await createCheckoutOrder(await readCheckoutBody(request)), { headers: checkoutHeaders });
  } catch (error) { return checkoutFailure(error); }
}
