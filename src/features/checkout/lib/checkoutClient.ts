import type { CheckoutOrder } from "@/features/checkout/types/checkout";
import { isUuid } from "@/features/checkout/lib/validation";

export class CheckoutRequestError extends Error {
  constructor(message: string, public readonly code = "NETWORK_ERROR", public readonly field?: string, public readonly lines?: { key: string; message?: string; status: string }[]) { super(message); }
}

export async function checkoutRequest<T>(path: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(path, { method: body === undefined ? "GET" : "POST", credentials: "same-origin", cache: "no-store", headers: body === undefined ? undefined : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body), signal: controller.signal });
    const data = await response.json();
    if (!response.ok) throw new CheckoutRequestError(data.error || "No se pudo completar la solicitud.", data.code, data.field, data.lines);
    return data as T;
  } catch (error) {
    if (error instanceof CheckoutRequestError) throw error;
    throw new CheckoutRequestError("No pudimos recibir la respuesta. Conservamos tus datos; vuelve a intentarlo.");
  } finally { clearTimeout(timer); }
}

export type CheckoutAttempt = {
  quoteId: string;
  idempotencyKey: string;
  selection: { key: string; productId: string; variantId: string; quantity: number }[];
  orderId?: string;
  finalized?: boolean;
};

export const attemptStorageKey = (userId: string) => `eternal_memory_checkout_attempt:${userId}`;

export function readAttempt(raw: string | null): CheckoutAttempt | null {
  if (!raw) return null;
  const input = JSON.parse(raw) as CheckoutAttempt;
  if (!input || !isUuid(input.quoteId) || !isUuid(input.idempotencyKey) || !Array.isArray(input.selection) || input.selection.length < 1 || input.selection.length > 50 || input.selection.some((line) => !line || typeof line.key !== "string" || !isUuid(line.productId) || !isUuid(line.variantId) || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 50) || (input.orderId !== undefined && !isUuid(input.orderId)) || (input.finalized !== undefined && typeof input.finalized !== "boolean") || (input.finalized && !input.orderId)) {
    throw new Error("No se pudo recuperar el intento de esta pestaña.");
  }
  return input;
}

export function isCheckoutOrder(value: CheckoutOrder): boolean {
  return !!value && isUuid(value.id) && Array.isArray(value.lines) && value.lines.length > 0 && Number.isFinite(value.totalPen) && typeof value.status === "string" && typeof value.reservationExpiresAt === "string";
}

export const money = (amount: number) => `S/ ${amount.toFixed(2)}`;

const orderLabels: Record<string, string> = { pending_payment: "Pendiente de pago", paid: "Pagado", processing: "En preparación", shipped: "Enviado", completed: "Completado", canceled: "Cancelado", review_required: "En revisión" };
const paymentLabels: Record<string, string> = { pending: "Pendiente", paid: "Confirmado", failed: "No completado", refunded: "Reembolsado" };
export const orderStatusLabel = (status: string) => orderLabels[status] ?? "En revisión";
export const paymentStatusLabel = (status: string) => paymentLabels[status] ?? "En revisión";
