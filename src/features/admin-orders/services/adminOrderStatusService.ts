import "server-only";

import { requireAdmin } from "@/features/auth/services/accessService";
import { CheckoutError, isUuid, readObject } from "@/features/checkout/lib/validation";
import { isAdminTargetStatus, normalizeReason, REASON_MAX_LENGTH } from "@/features/admin-orders/lib/orderTransitions";
import { createStripeClient } from "@/lib/stripe/server";
import { createPrivilegedClient } from "@/lib/supabase/privileged";

export type AdminOrderStatusResult = { id: string; status: string; paymentStatus: string };

const failures: Record<string, [number, string, string]> = {
  "Administrator role required": [403, "ADMIN_REQUIRED", "No tienes permisos de administrador para realizar esta acción."],
  "Order not found": [404, "ORDER_NOT_FOUND", "No se encontró el pedido."],
  "Invalid order status transition": [409, "INVALID_TRANSITION", "El pedido no puede pasar a ese estado desde su estado actual."],
  "Reason required": [422, "REASON_REQUIRED", "Indica el motivo del cambio."],
  "Reason too long": [422, "INVALID_REASON", `El motivo admite hasta ${REASON_MAX_LENGTH} caracteres.`],
};

function databaseFailure(error: { message: string }): never {
  const detail = failures[error.message];
  if (detail) throw new CheckoutError(detail[1], detail[2], detail[0], error.message === "Reason required" || error.message === "Reason too long" ? "reason" : undefined);
  // Nunca se muestran errores SQL ni datos internos al navegador.
  throw new CheckoutError("ORDER_STATUS_UNAVAILABLE", "No se pudo cambiar el estado del pedido. Inténtalo más tarde.", 503);
}

/**
 * Cambia el estado de un pedido. La identidad del administrador sale siempre de la sesión
 * verificada, nunca del cuerpo de la solicitud, y la base de datos valida la transición.
 */
export async function changeOrderStatus(orderId: string, body: unknown): Promise<AdminOrderStatusResult> {
  const { user } = await requireAdmin();
  if (!isUuid(orderId)) throw new CheckoutError("ORDER_NOT_FOUND", "No se encontró el pedido.", 404);
  const input = readObject(body, ["status", "reason"]);
  if (input.status === "paid") {
    throw new CheckoutError("INVALID_STATUS", "El estado «Pagado» lo asigna el pago, no se puede cambiar a mano.", 422, "status");
  }
  if (!isAdminTargetStatus(input.status)) throw new CheckoutError("INVALID_STATUS", "Elige un estado válido.", 422, "status");
  const reason = normalizeReason(input.reason);
  if (reason === undefined) throw new CheckoutError("INVALID_REASON", `El motivo admite hasta ${REASON_MAX_LENGTH} caracteres sin símbolos de control.`, 422, "reason");
  if ((input.status === "canceled" || input.status === "review_required") && reason === null) {
    throw new CheckoutError("REASON_REQUIRED", "Indica el motivo del cambio.", 422, "reason");
  }

  const client = createPrivilegedClient();
  // Se anotan antes los pagos abiertos: si se cancela un pedido pendiente, su página de pago se cierra.
  const pending = input.status === "canceled"
    ? await client.from("payment_attempts").select("stripe_session_id").eq("order_id", orderId).eq("status", "pending")
    : null;

  const { error } = await client.rpc("admin_change_order_status", {
    p_order_id: orderId, p_admin_id: user.id, p_to_status: input.status, p_reason: reason,
  });
  if (error) databaseFailure(error);

  // El cambio ya está guardado; cerrar la sesión de Stripe es un esfuerzo adicional y no puede deshacerlo.
  for (const attempt of pending?.data ?? []) {
    try { await createStripeClient().checkout.sessions.expire(attempt.stripe_session_id); } catch { /* ya vencida o sin configurar */ }
  }

  const { data, error: readError } = await client.from("orders").select("id,status,payment_status").eq("id", orderId).maybeSingle();
  if (readError || !data) throw new CheckoutError("ORDER_STATUS_UNAVAILABLE", "El cambio se guardó, pero no pudimos leer el pedido actualizado. Recarga la página.", 503);
  return { id: data.id, status: data.status, paymentStatus: data.payment_status };
}
