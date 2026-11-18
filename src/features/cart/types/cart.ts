// Datos de presentación que el carrito guarda de cada producto.
interface CartProduct {
  id: string;
  categoria: string;
  nombre: string;
  precio: string;
  badge: string;
  badgeTipo: "moss" | "neutral" | "ember" | "brass";
  descripcion?: string;
  imagenes?: string[];
  opciones?: string[];
}

export const CART_MAX_LINES = 50;
export const CART_MAX_QUANTITY = 50;

export interface CartItem extends CartProduct {
  productId?: string;
  variantId?: string;
  productSlug?: string;
  unitPricePen?: number;
  selectedOption: string;
  quantity: number;
}

export interface CartLine extends CartItem {
  key: string;
  consumedOrderIds?: string[];
}

export type CartSelection = {
  key: string;
  productId?: string;
  variantId?: string;
  productSlug?: string;
  legacyId?: string;
  selectedOption?: string;
  quantity: number;
};

export type ValidatedCartLine = {
  key: string;
  status: "valid" | "invalid" | "pending";
  message?: string;
  productId?: string;
  productSlug?: string;
  variantId?: string;
  name?: string;
  option?: string;
  image?: string;
  unitPricePen?: number;
  availableQuantity?: number;
  subtotalPen?: number;
};

export type CartValidation = {
  lines: ValidatedCartLine[];
  totalPen: number;
};
