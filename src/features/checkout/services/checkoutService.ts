import "server-only";

import { requireUser } from "@/features/auth/services/accessService";
import { validateCart } from "@/features/cart/services/validateCart";
import { CheckoutError, isUuid, readCheckoutInput, readObject } from "@/features/checkout/lib/validation";
import type { CheckoutOrder, CheckoutQuote } from "@/features/checkout/types/checkout";
import { createPrivilegedClient } from "@/lib/supabase/privileged";

const failures: Record<string, [number, string, string?]> = {
  INVALID_INPUT: [422, "Revisa los datos de contacto y dirección."],
  INVALID_CART: [422, "Revisa las líneas y cantidades del carrito.", "lines"],
  INVALID_LOCATION: [422, "Selecciona una ubicación válida.", "ubigeo"],
  DELIVERY_UNAVAILABLE: [422, "No realizamos entregas en esta ubicación.", "ubigeo"],
  DELIVERY_NOT_CONFIGURED: [503, "La tarifa de entrega no está disponible.", "ubigeo"],
  INVALID_CUSTOMIZATION: [422, "Revisa el grabado. Solo está disponible para urnas y admite de 1 a 80 caracteres.", "lines"],
  VARIANT_UNAVAILABLE: [409, "Un producto o variante ya no está disponible. Revisa el carrito.", "lines"],
  INSUFFICIENT_STOCK: [409, "Las existencias cambiaron. Revisa las cantidades.", "lines"],
  QUOTE_EXPIRED: [409, "El resumen venció. Solicita uno nuevo antes de confirmar."],
  QUOTE_CHANGED: [409, "Cambió el producto o su importe. Revisa un nuevo resumen antes de confirmar."],
  IDEMPOTENCY_CONFLICT: [409, "Este intento corresponde a otro resumen. Utiliza un nuevo identificador de intento."],
  TOO_MANY_QUOTES: [429, "Has solicitado varios resúmenes. Espera unos minutos e inténtalo de nuevo."],
};

function databaseFailure(error: { message: string }): never {
  const detail = failures[error.message];
  if (detail) throw new CheckoutError(error.message, detail[1], detail[0], detail[2]);
  // Never expose SQL errors, customer information or configuration to the browser.
  throw new CheckoutError("CHECKOUT_UNAVAILABLE", "No se pudo completar la operación. Reintenta con el mismo identificador de intento.", 503);
}

export async function quoteCheckout(body: unknown): Promise<CheckoutQuote> {
  const { user } = await requireUser();
  const input = readCheckoutInput(body);
  const validation = await validateCart({ lines: input.lines.map(({ key, productId, variantId, quantity }) => ({ key, productId, variantId, quantity })) });
  if (validation.lines.some((line) => line.status !== "valid")) {
    throw new CheckoutError("INVALID_CART", "Corrige las líneas del carrito antes de continuar.", 422, "lines", validation.lines);
  }
  const client = createPrivilegedClient();
  const { data, error } = await client.rpc("quote_checkout", { p_customer_id: user.id, p_payload: input });
  if (error) databaseFailure(error);
  return data as CheckoutQuote;
}

async function readOrder(client: ReturnType<typeof createPrivilegedClient>, userId: string, id: string): Promise<CheckoutOrder> {
  const { data, error } = await client.from("orders")
    .select("id,status,payment_status,reservation_expires_at,subtotal_pen,delivery_pen,total_pen,delivery_ubigeo,department,province,district,order_items(line_key,variant_id,product_name,variant_name,quantity,base_unit_price_pen,customization_unit_pen,unit_price_pen,line_total_pen,customization,product_variants(product_id))")
    .eq("id", id).eq("customer_id", userId).maybeSingle();
  if (error) databaseFailure(error);
  if (!data) throw new CheckoutError("ORDER_NOT_FOUND", "No se encontró el pedido.", 404);
  return {
    id: data.id, status: data.status, paymentStatus: data.payment_status,
    reservationExpiresAt: data.reservation_expires_at,
    subtotalPen: Number(data.subtotal_pen), deliveryPen: Number(data.delivery_pen), totalPen: Number(data.total_pen),
    location: { ubigeo: data.delivery_ubigeo, department: data.department, province: data.province, district: data.district },
    lines: data.order_items.map((line) => ({
      key: line.line_key, productId: (line.product_variants as unknown as { product_id: string }).product_id,
      variantId: line.variant_id, productName: line.product_name, variantName: line.variant_name,
      quantity: line.quantity, customization: line.customization,
      baseUnitPricePen: Number(line.base_unit_price_pen ?? line.unit_price_pen),
      customizationUnitPen: Number(line.customization_unit_pen), unitPricePen: Number(line.unit_price_pen), lineTotalPen: Number(line.line_total_pen),
    })).sort((a, b) => (a.key ?? "").localeCompare(b.key ?? "")),
  };
}

export async function createCheckoutOrder(body: unknown): Promise<CheckoutOrder> {
  const { user } = await requireUser();
  const input = readObject(body, ["quoteId", "idempotencyKey"]);
  if (!isUuid(input.quoteId) || !isUuid(input.idempotencyKey)) throw new CheckoutError("INVALID_INPUT", "El resumen o identificador de intento no es válido.");
  const client = createPrivilegedClient();
  const { data, error } = await client.rpc("create_checkout_order", {
    p_customer_id: user.id, p_quote_id: input.quoteId, p_idempotency_key: input.idempotencyKey,
  });
  if (error) databaseFailure(error);
  // A lost response can be recovered with exactly the same POST, even after expiry.
  return readOrder(client, user.id, data as string);
}

export async function getCheckoutOrder(id: string): Promise<CheckoutOrder> {
  const { user } = await requireUser();
  if (!isUuid(id)) throw new CheckoutError("ORDER_NOT_FOUND", "No se encontró el pedido.", 404);
  return readOrder(createPrivilegedClient(), user.id, id);
}
