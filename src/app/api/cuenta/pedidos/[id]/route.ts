import { getAccountOrder } from "@/features/account-orders/services/accountOrdersService";
import { checkoutFailure, checkoutHeaders } from "@/features/checkout/lib/http";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    return Response.json(await getAccountOrder((await context.params).id), { headers: checkoutHeaders });
  } catch (error) { return checkoutFailure(error); }
}
