import "server-only";

import { getCatalogProduct, getCatalogProductsByIds } from "@/features/catalogo/services/catalogService";
import { isCatalogSlug } from "@/features/catalogo/lib/catalogParams";
import { CART_MAX_LINES, CART_MAX_QUANTITY, type CartSelection, type CartValidation, type ValidatedCartLine } from "@/features/cart/types/cart";

export class InvalidCartError extends Error {
  constructor(message = "La selección del carrito no es válida.") { super(message); }
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const selectionFields = new Set(["key", "productId", "variantId", "productSlug", "legacyId", "selectedOption", "quantity"]);

function readSelections(body: unknown): CartSelection[] {
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some((key) => key !== "lines")) throw new InvalidCartError();
  const lines = (body as { lines?: unknown }).lines;
  if (!Array.isArray(lines) || lines.length > CART_MAX_LINES) throw new InvalidCartError("El carrito admite hasta 50 líneas distintas.");
  const keys = new Set<string>();
  for (const line of lines) {
    if (!line || typeof line !== "object" || Array.isArray(line) || Object.keys(line).some((key) => !selectionFields.has(key))) throw new InvalidCartError();
    if (typeof line.key !== "string" || !line.key || line.key.length > 200 || keys.has(line.key)) throw new InvalidCartError();
    keys.add(line.key);
    for (const field of ["productId", "variantId", "productSlug", "legacyId", "selectedOption"]) {
      if (line[field] !== undefined && (typeof line[field] !== "string" || line[field].length > 200)) throw new InvalidCartError();
    }
  }
  return lines as CartSelection[];
}

export async function validateCart(body: unknown): Promise<CartValidation> {
  const selections = readSelections(body);
  const ids = [...new Set(selections.flatMap((line) => line.productId && uuid.test(line.productId) ? [line.productId] : []))];
  const slugs = [...new Set(selections.flatMap((line) => {
    if (line.productId !== undefined) return [];
    const slug = line.productSlug ?? line.legacyId;
    return slug && isCatalogSlug(slug) ? [slug] : [];
  }))];
  const [byId, bySlug] = await Promise.all([
    getCatalogProductsByIds(ids),
    Promise.all(slugs.map((slug) => getCatalogProduct(slug))),
  ]);
  const products = [...byId, ...bySlug.filter((product) => product !== null)];
  const totalsByVariant = new Map<string, number>();
  const lines = selections.map((line): ValidatedCartLine => {
    const product = line.productId !== undefined
      ? products.find((item) => item.id === line.productId)
      : products.find((item) => item.slug === (line.productSlug ?? line.legacyId));
    const base: ValidatedCartLine = { key: line.key, status: "invalid" };
    if (!product) return { ...base, status: line.variantId !== undefined || line.productId !== undefined ? "invalid" : "pending", message: "El producto no está disponible o no puede identificarse." };
    Object.assign(base, { productId: product.id, productSlug: product.slug, name: product.name, image: product.images[0]?.src });
    const candidates = line.variantId !== undefined
      ? product.variants.filter((variant) => variant.id === line.variantId)
      : product.variants.filter((variant) => variant.name === line.selectedOption);
    if (candidates.length !== 1) return {
      ...base, status: line.variantId !== undefined ? "invalid" : "pending",
      message: line.variantId !== undefined ? "La variante no está disponible para este producto." : "Vuelve a elegir la variante en la ficha del producto.",
    };
    const variant = candidates[0];
    Object.assign(base, { variantId: variant.id, option: variant.name, unitPricePen: variant.pricePen, availableQuantity: variant.availableQuantity });
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > CART_MAX_QUANTITY) {
      return { ...base, message: "Introduce una cantidad entera entre 1 y 50." };
    }
    totalsByVariant.set(variant.id, (totalsByVariant.get(variant.id) ?? 0) + line.quantity);
    return { ...base, status: "valid", subtotalPen: Math.round(variant.pricePen * 100) * line.quantity / 100 };
  });
  for (const line of lines) {
    if (line.status !== "valid" || !line.variantId) continue;
    const quantity = totalsByVariant.get(line.variantId)!;
    if (quantity > CART_MAX_QUANTITY || quantity > line.availableQuantity!) {
      line.status = "invalid";
      line.message = quantity > CART_MAX_QUANTITY ? "El máximo es de 50 unidades por variante." : `Disponibles: ${line.availableQuantity}. Ajusta la cantidad; no se ha reservado stock.`;
      delete line.subtotalPen;
    }
  }
  return { lines, totalPen: lines.reduce((total, line) => total + Math.round((line.subtotalPen ?? 0) * 100), 0) / 100 };
}
