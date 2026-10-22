"use client";

import { createContext, useCallback, useContext, useEffect, useReducer } from "react";
import { CART_MAX_LINES, CART_MAX_QUANTITY, type CartItem, type CartLine, type CartValidation } from "@/features/cart/types/cart";
import { CART_STORAGE_KEY, readSavedCart } from "@/features/cart/lib/cartStorage";

export type { CartItem } from "@/features/cart/types/cart";

type State = {
  cart: CartLine[];
  isOpen: boolean;
  initialized: boolean;
  version: number;
  validation: CartValidation | null;
  error: string | null;
  storageWarning: string | null;
  mutationWarning: string | null;
  priceChanges: string[];
};
type Action =
  | { type: "consume-order"; orderId: string; lines: { key: string; productId: string; variantId: string; quantity: number }[] }
  | { type: "initialize"; cart: CartLine[]; warning: string | null }
  | { type: "add"; item: CartLine }
  | { type: "quantity"; key: string; quantity: number }
  | { type: "remove"; key: string }
  | { type: "clear" | "open" | "close" | "refresh" }
  | { type: "validated"; version: number; result: CartValidation }
  | { type: "failed"; version: number; message: string }
  | { type: "storage-warning"; message: string };

const initialState: State = { cart: [], isOpen: false, initialized: false, version: 0, validation: null, error: null, storageWarning: null, mutationWarning: null, priceChanges: [] };

function invalidate(state: State, cart = state.cart): State {
  return { ...state, cart, version: state.version + 1, validation: null, error: null, mutationWarning: null };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "consume-order": return invalidate(state, state.cart.flatMap((item) => {
      const ordered = action.lines.find((line) => line.key === item.key && line.productId === item.productId && line.variantId === item.variantId);
      if (!ordered || item.consumedOrderIds?.includes(action.orderId)) return [item];
      const quantity = item.quantity - ordered.quantity;
      if (quantity <= 0) return [];
      // Persist the receipt with the remaining units so recovery cannot deduct twice.
      return [{ ...item, quantity, consumedOrderIds: [...(item.consumedOrderIds ?? []), action.orderId] }];
    }));
    case "initialize": return { ...invalidate(state, action.cart), initialized: true, storageWarning: action.warning };
    case "open": return { ...invalidate(state), isOpen: true };
    case "close": return { ...state, isOpen: false };
    case "refresh": return invalidate(state);
    case "clear": return invalidate(state, []);
    case "remove": return invalidate(state, state.cart.filter((item) => item.key !== action.key));
    case "quantity":
      if (!Number.isInteger(action.quantity) || action.quantity < 1 || action.quantity > CART_MAX_QUANTITY) {
        return { ...state, mutationWarning: "Introduce una cantidad entera entre 1 y 50." };
      }
      return invalidate(state, state.cart.map((item) => item.key === action.key ? { ...item, quantity: action.quantity } : item));
    case "add": {
      const existing = state.cart.find((item) => item.variantId && item.variantId === action.item.variantId && item.productId === action.item.productId && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= CART_MAX_QUANTITY);
      const quantity = (existing?.quantity ?? 0) + action.item.quantity;
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > CART_MAX_QUANTITY || (!existing && state.cart.length >= CART_MAX_LINES)) {
        return { ...state, isOpen: true, mutationWarning: "El carrito admite 50 líneas y hasta 50 unidades por variante." };
      }
      const cart = existing ? state.cart.map((item) => item.key === existing.key ? { ...item, quantity } : item) : [...state.cart, action.item];
      return { ...invalidate(state, cart), isOpen: true };
    }
    case "validated": {
      if (action.version !== state.version) return state;
      const changes = new Set(state.priceChanges);
      const cart = state.cart.map((item) => {
        const result = action.result.lines.find((line) => line.key === item.key);
        if (!result) return item;
        if (result.unitPricePen !== undefined && item.unitPricePen !== undefined && result.unitPricePen !== item.unitPricePen) changes.add(item.key);
        return {
          ...item,
          ...(result.productId ? { productId: result.productId, productSlug: result.productSlug, nombre: result.name ?? item.nombre } : {}),
          ...(result.variantId ? { id: result.variantId, variantId: result.variantId, selectedOption: result.option ?? item.selectedOption } : {}),
          ...(result.unitPricePen !== undefined ? { unitPricePen: result.unitPricePen } : {}),
        };
      });
      // Legacy selections may resolve to a variant already present in the cart.
      const merged: CartLine[] = [];
      const resolved = new Map<string, CartLine>();
      for (const item of cart) {
        const result = action.result.lines.find((line) => line.key === item.key);
        const identity = result?.status === "valid" ? result.variantId : undefined;
        const existing = identity ? resolved.get(identity) : undefined;
        if (existing) existing.quantity += item.quantity;
        else {
          const copy = { ...item };
          merged.push(copy);
          if (identity) resolved.set(identity, copy);
        }
      }
      if (merged.length !== cart.length) return { ...invalidate(state, merged), priceChanges: [...changes] };
      return { ...state, cart, validation: action.result, error: null, priceChanges: [...changes] };
    }
    case "failed": return action.version === state.version ? { ...state, validation: null, error: action.message } : state;
    case "storage-warning": return { ...state, storageWarning: action.message };
  }
}

interface CartContextType {
  consumeOrder: (lines: { key: string; productId: string; variantId: string; quantity: number }[], orderId: string) => void;
  cart: CartLine[];
  isOpen: boolean;
  initialized: boolean;
  validation: CartValidation | null;
  error: string | null;
  storageWarning: string | null;
  mutationWarning: string | null;
  priceChanges: string[];
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  retry: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Cargar carrito guardado desde localStorage
  useEffect(() => {
    let active = true;
    const saved = readSavedCart();
    queueMicrotask(() => { if (active) dispatch({ type: "initialize", ...saved }); });
    return () => { active = false; };
  }, []);

  // Guardar en localStorage cuando el carrito cambie
  useEffect(() => {
    if (!state.initialized) return;
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart)); }
    catch { dispatch({ type: "storage-warning", message: "No se pudo guardar la selección en este navegador. Puede perderse al recargar." }); }
  }, [state.cart, state.initialized]);

  useEffect(() => {
    if (!state.initialized || state.cart.length === 0) return;
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    const version = state.version;
    const lines = state.cart.map((item) => ({
      key: item.key, productId: item.productId, variantId: item.variantId,
      productSlug: item.productSlug, legacyId: item.id, selectedOption: item.selectedOption, quantity: item.quantity,
    }));
    void (async () => {
      try {
        const response = await fetch("/api/carrito/validar", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", signal: controller.signal, body: JSON.stringify({ lines }) });
        const result = await response.json();
        if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "No se pudo validar el carrito.");
        if (!Array.isArray(result.lines) || result.lines.length !== lines.length || !Number.isFinite(result.totalPen)) throw new Error("La respuesta del carrito no es válida.");
        if (active) dispatch({ type: "validated", version, result });
      } catch (error) {
        if (active) dispatch({ type: "failed", version, message: error instanceof Error && error.name !== "AbortError" ? error.message : "No se pudo validar el carrito. Reintenta en un momento." });
      } finally { clearTimeout(timer); }
    })();
    return () => { active = false; controller.abort(); clearTimeout(timer); };
    // A validated response updates display metadata without changing the selection version.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.version, state.initialized]);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") dispatch({ type: "refresh" }); };
    const onFocus = () => dispatch({ type: "refresh" });
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => { document.removeEventListener("visibilitychange", onVisible); window.removeEventListener("focus", onFocus); };
  }, []);

  const openCart = useCallback(() => dispatch({ type: "open" }), []);
  const closeCart = useCallback(() => dispatch({ type: "close" }), []);
  const addToCart = useCallback((item: CartItem) => dispatch({ type: "add", item: { ...item, key: crypto.randomUUID() } }), []);
  const removeFromCart = useCallback((key: string) => dispatch({ type: "remove", key }), []);
  const updateQuantity = useCallback((key: string, quantity: number) => dispatch({ type: "quantity", key, quantity }), []);
  const clearCart = useCallback(() => dispatch({ type: "clear" }), []);
  const consumeOrder = useCallback((lines: { key: string; productId: string; variantId: string; quantity: number }[], orderId: string) => dispatch({ type: "consume-order", lines, orderId }), []);
  const retry = useCallback(() => dispatch({ type: "refresh" }), []);
  const totalItems = state.cart.reduce((total, item) => total + (Number.isSafeInteger(item.quantity) && item.quantity > 0 ? item.quantity : 0), 0);

  return <CartContext.Provider value={{ ...state, openCart, closeCart, addToCart, removeFromCart, updateQuantity, clearCart, consumeOrder, retry, totalItems }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe ser usado dentro de un CartProvider");
  return context;
}
