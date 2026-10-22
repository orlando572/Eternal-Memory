import { readAttempt, type CheckoutAttempt } from "@/features/checkout/lib/checkoutClient";

export type StoredCheckoutAttempt =
  | { status: "ready"; attempt: CheckoutAttempt | null }
  | { status: "invalid"; raw: string }
  | { status: "unavailable" };

export function readStoredCheckoutAttempt(key: string): StoredCheckoutAttempt {
  let raw: string | null;
  try { raw = sessionStorage.getItem(key); }
  catch { return { status: "unavailable" }; }
  if (raw === null) return { status: "ready", attempt: null };

  try {
    const attempt = readAttempt(raw);
    if (attempt) return { status: "ready", attempt };
  } catch { /* Keep damaged data until the user explicitly discards it. */ }
  return { status: "invalid", raw };
}

export function discardDamagedCheckoutAttempt(key: string, expectedRaw: string): StoredCheckoutAttempt {
  const current = readStoredCheckoutAttempt(key);
  // Never remove a valid attempt or data that changed after the user reviewed it.
  if (current.status !== "invalid" || current.raw !== expectedRaw) return current;

  try { sessionStorage.removeItem(key); }
  catch { return { status: "unavailable" }; }
  return readStoredCheckoutAttempt(key);
}
