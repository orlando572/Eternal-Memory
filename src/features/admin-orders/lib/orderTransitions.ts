// Transiciones de estado que puede hacer un administrador. Sin dependencias de servidor, para
// probarlas con `node --test` y para que el panel de pedidos (TSK-16) muestre solo las válidas.
// La misma lista está en `supabase/migrations/20261119040000_admin_change_order_status.sql`.

export type OrderTransition = { from: string; to: string; reasonRequired: boolean };

export const ORDER_TRANSITIONS: readonly OrderTransition[] = [
  { from: "paid", to: "processing", reasonRequired: false },
  { from: "processing", to: "shipped", reasonRequired: false },
  { from: "shipped", to: "completed", reasonRequired: false },
  { from: "processing", to: "review_required", reasonRequired: true },
  { from: "review_required", to: "processing", reasonRequired: true },
  { from: "pending_payment", to: "canceled", reasonRequired: true },
  { from: "paid", to: "canceled", reasonRequired: true },
  { from: "processing", to: "canceled", reasonRequired: true },
  { from: "shipped", to: "canceled", reasonRequired: true },
  { from: "completed", to: "canceled", reasonRequired: true },
  { from: "review_required", to: "canceled", reasonRequired: true },
];

/** Estados a los que un administrador puede mover un pedido. `paid` no está: lo asigna el pago. */
export const ADMIN_TARGET_STATUSES = ["processing", "shipped", "completed", "review_required", "canceled"] as const;
export type AdminTargetStatus = (typeof ADMIN_TARGET_STATUSES)[number];

export const REASON_MAX_LENGTH = 500;

export const isAdminTargetStatus = (value: unknown): value is AdminTargetStatus =>
  typeof value === "string" && (ADMIN_TARGET_STATUSES as readonly string[]).includes(value);

export function findTransition(from: string, to: string): OrderTransition | undefined {
  return ORDER_TRANSITIONS.find((transition) => transition.from === from && transition.to === to);
}

export function allowedTransitions(from: string): OrderTransition[] {
  return ORDER_TRANSITIONS.filter((transition) => transition.from === from);
}

/** Motivo limpio o `null`; devuelve `undefined` si tiene caracteres de control o supera el máximo. */
export function normalizeReason(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return undefined;
  const reason = value.normalize("NFC").trim();
  if (reason === "") return null;
  if ([...reason].length > REASON_MAX_LENGTH || /[\p{Cc}\p{Cf}<>]/u.test(reason)) return undefined;
  return reason;
}
