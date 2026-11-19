import { listAccountOrders } from "@/features/account-orders/services/accountOrdersService";
import { checkoutFailure, checkoutHeaders } from "@/features/checkout/lib/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    return Response.json(await listAccountOrders(new URL(request.url).searchParams), { headers: checkoutHeaders });
  } catch (error) { return checkoutFailure(error); }
}
