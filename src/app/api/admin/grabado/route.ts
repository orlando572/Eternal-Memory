import { checkoutFailure, checkoutHeaders, readCheckoutBody } from "@/features/checkout/lib/http";
import { getAdminEngravingSettings, updateAdminEngravingSettings } from "@/features/checkout/services/adminEngravingService";

export const runtime = "nodejs";

export async function GET() {
  try { return Response.json(await getAdminEngravingSettings(), { headers: checkoutHeaders }); }
  catch (error) { return checkoutFailure(error); }
}

export async function PATCH(request: Request) {
  try { return Response.json(await updateAdminEngravingSettings(await readCheckoutBody(request)), { headers: checkoutHeaders }); }
  catch (error) { return checkoutFailure(error); }
}
