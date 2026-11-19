import type { CatalogProduct, CatalogVariant } from "@/features/catalogo/types/catalog";
import type { CartItem } from "@/features/cart/context/CartContext";
import { formatCatalogPrice } from "@/features/catalogo/lib/catalogPresentation";

export function catalogCartItem(product: CatalogProduct, variant: CatalogVariant, quantity: number): CartItem {
  return {
    // The existing cart keys lines by id and option. A variant UUID keeps new
    // lines distinct from legacy sample slugs without migrating saved carts.
    id: variant.id,
    productId: product.id,
    variantId: variant.id,
    productSlug: product.slug,
    unitPricePen: variant.pricePen,
    categoria: product.category.name,
    nombre: product.name,
    precio: formatCatalogPrice(variant.pricePen),
    descripcion: product.description,
    imagenes: product.images.map((image) => image.src),
    badge: "",
    badgeTipo: "neutral",
    selectedOption: variant.name,
    quantity,
  };
}
