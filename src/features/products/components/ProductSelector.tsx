"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CatalogProduct } from "@/features/catalogo/types/catalog";
import { formatCatalogPrice } from "@/features/catalogo/lib/catalogPresentation";
import { catalogCartItem } from "@/features/catalogo/lib/catalogCart";
import { useCart } from "@/features/cart/context/CartContext";

export default function ProductSelector({ product }: { product: CatalogProduct }) {
  const [variantId, setVariantId] = useState(product.variants.find((variant) => variant.availableQuantity > 0)?.id ?? product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const { cart, addToCart } = useCart();
  const variant = product.variants.find((item) => item.id === variantId);
  const inCart = cart.reduce((total, item) => total + (item.variantId === variantId ? item.quantity : 0), 0);
  const remaining = Math.max(0, (variant?.availableQuantity ?? 0) - inCart);
  const selectedQuantity = Math.min(quantity, remaining);
  const canAdd = Boolean(variant && selectedQuantity > 0);
  const price = variant ? formatCatalogPrice(variant.pricePen) : "Sin opciones disponibles";
  const availability = !variant ? "No hay variantes activas disponibles."
    : variant.availableQuantity === 0 ? "Esta variante está agotada."
    : remaining === 0 ? "Ya tienes en tu selección todas las unidades disponibles de esta variante."
    : `${variant.availableQuantity} ${variant.availableQuantity === 1 ? "unidad disponible" : "unidades disponibles"}${inCart > 0 ? ` · ${inCart} en tu selección` : ""}.`;

  function handleAddToCart() {
    if (!variant || !canAdd) return;
    addToCart(catalogCartItem(product, variant, selectedQuantity));
  }

  return (
    <div className="detail-info">
      <p className="detail-category">{product.category.name}</p>
      <h1>{product.name}</h1>
      <strong className="detail-price" aria-live="polite">{price}</strong>
      <p className="detail-description">{product.description || "Consulta las opciones y la disponibilidad de este producto."}</p>
      {product.variants.length > 0 && (
        <fieldset className="detail-options">
          <legend>Acabado o variante</legend>
          <div>
            {product.variants.map((option) => (
              <Button key={option.id} variant="outline" type="button" className={variantId === option.id ? "active" : ""} aria-pressed={variantId === option.id}
                onClick={() => { setVariantId(option.id); setQuantity(1); }}>
                {option.name}{option.availableQuantity === 0 ? " · Agotado" : ""}
              </Button>
            ))}
          </div>
        </fieldset>
      )}
      <p id="variant-availability" className="detail-availability" role="status">{availability}</p>
      <div className="detail-purchase">
        <div className="detail-quantity">
          <span>Cantidad</span>
          <div>
            <Button variant="ghost" type="button" disabled={selectedQuantity <= 1} onClick={() => setQuantity(Math.max(1, selectedQuantity - 1))} aria-label="Reducir cantidad"><Minus size={17} /></Button>
            <output aria-live="polite" aria-label="Cantidad seleccionada">{selectedQuantity}</output>
            <Button variant="ghost" type="button" disabled={selectedQuantity >= remaining} onClick={() => setQuantity(selectedQuantity + 1)} aria-label="Aumentar cantidad"><Plus size={17} /></Button>
          </div>
        </div>
        <Button type="button" className="detail-add-button" onClick={handleAddToCart} disabled={!canAdd} aria-describedby="variant-availability"><ShoppingCart size={19} /> Añadir al carrito</Button>
      </div>
      <p className="detail-support">Tu selección se guarda en este navegador. La disponibilidad puede cambiar; añadir al carrito no reserva unidades.</p>
      <div className="detail-mobile-sticky-add"><strong>{price}</strong><Button type="button" onClick={handleAddToCart} disabled={!canAdd} aria-describedby="variant-availability"><ShoppingCart size={18} /> Añadir al carrito</Button></div>
    </div>
  );
}
