import { checkoutFailure, checkoutHeaders, readCheckoutBody } from "@/features/checkout/lib/http";
import { getCheckoutOptions } from "@/features/checkout/services/checkoutOptionsService";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    return Response.json(await getCheckoutOptions(await readCheckoutBody(request)), { headers: checkoutHeaders });
  } catch (error) { return checkoutFailure(error); }
}
