import { changeOrderStatus } from "@/features/admin-orders/services/adminOrderStatusService";
import { checkoutFailure, checkoutHeaders, readCheckoutBody } from "@/features/checkout/lib/http";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const result = await changeOrderStatus((await context.params).id, await readCheckoutBody(request));
    return Response.json(result, { headers: checkoutHeaders });
  } catch (error) { return checkoutFailure(error); }
}
