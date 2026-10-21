import "server-only";

import { AccountAccessError } from "@/features/auth/services/accessService";
import { CheckoutError } from "@/features/checkout/lib/validation";

export const checkoutHeaders = { "Cache-Control": "private, no-store", "Vary": "Cookie" };

export async function readCheckoutBody(request: Request): Promise<unknown> {
  const origin = request.headers.get("origin");
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new CheckoutError("INVALID_ORIGIN", "La solicitud no está permitida.", 403);
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new CheckoutError("INVALID_INPUT", "Envía los datos en formato JSON.", 415);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new CheckoutError("INVALID_INPUT", "Completa los datos del pedido.", 400);
  let length = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 65_536) { await reader.cancel(); throw new CheckoutError("BODY_TOO_LARGE", "La solicitud supera el tamaño permitido.", 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch (error) {
    if (error instanceof CheckoutError) throw error;
    throw new CheckoutError("INVALID_INPUT", "Los datos enviados no son válidos.", 400);
  } finally { reader.releaseLock(); }
}

export function checkoutFailure(error: unknown): Response {
  if (error instanceof CheckoutError) {
    return Response.json({ error: error.message, code: error.code, field: error.field, lines: error.lines }, { status: error.status, headers: checkoutHeaders });
  }
  if (error instanceof AccountAccessError) {
    return Response.json({ error: error.message, code: error.status === 401 ? "UNAUTHENTICATED" : "ACCESS_UNAVAILABLE" }, { status: error.status, headers: checkoutHeaders });
  }
  return Response.json({ error: "El servicio de pedidos no está disponible. Inténtalo más tarde.", code: "CHECKOUT_UNAVAILABLE" }, { status: 503, headers: checkoutHeaders });
}
