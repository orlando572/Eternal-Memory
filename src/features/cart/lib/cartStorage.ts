import type { CartLine } from "@/features/cart/types/cart";

export const CART_STORAGE_KEY = "eternal_memory_cart";

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.slice(0, 200) : fallback;
}

export function readSavedCart(): { cart: CartLine[]; warning: string | null } {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) return { cart: [], warning: null };
    if (saved.length > 1_000_000) throw new Error("Cart too large");
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Invalid cart");
    let damaged = false;
    const keys = new Set<string>();
    const cart = parsed.flatMap((value, index): CartLine[] => {
      if (!value || typeof value !== "object" || Array.isArray(value)) { damaged = true; return []; }
      const item = value as Record<string, unknown>;
      let key = text(item.key, `saved-${index}`);
      let suffix = 0;
      while (!key || keys.has(key)) key = `saved-${index}-${suffix++}`;
      keys.add(key);
      return [{
        key, id: text(item.id, key), nombre: text(item.nombre, "Artículo guardado"),
        categoria: text(item.categoria), precio: "", badge: "", badgeTipo: "neutral",
        selectedOption: text(item.selectedOption),
        quantity: typeof item.quantity === "number" && Number.isSafeInteger(item.quantity) ? item.quantity : 0,
        productId: typeof item.productId === "string" ? text(item.productId) : undefined,
        variantId: typeof item.variantId === "string" ? text(item.variantId) : undefined,
        productSlug: typeof item.productSlug === "string" ? text(item.productSlug) : undefined,
        unitPricePen: typeof item.unitPricePen === "number" && Number.isFinite(item.unitPricePen) && item.unitPricePen >= 0 ? item.unitPricePen : undefined,
      }];
    });
    return { cart, warning: damaged ? "Parte del carrito guardado no pudo recuperarse." : null };
  } catch {
    return { cart: [], warning: "No se pudo recuperar el carrito guardado. El almacenamiento puede estar dañado o bloqueado." };
  }
}
