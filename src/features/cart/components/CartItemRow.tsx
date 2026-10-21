"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/features/products/components/ProductImage";
import { CART_MAX_QUANTITY, type CartLine } from "@/features/cart/types/cart";
import { useCart } from "@/features/cart/context/CartContext";

export default function CartItemRow({ item }: { item: CartLine }) {
  const { updateQuantity, removeFromCart, closeCart, validation, priceChanges } = useCart();
  const result = validation?.lines.find((line) => line.key === item.key);
  const href = result?.productSlug ? `/catalogo/${encodeURIComponent(result.productSlug)}` : null;
  const name = result?.name ?? item.nombre;
  const image = <ProductImage src={result?.image} alt={`Imagen referencial de ${name}`} sizes="91px" />;
  const messageId = `cart-message-${item.key}`;

  return (
    <article className="cart-item" aria-label={`${name}, ${result?.option ?? item.selectedOption}`}>
      {href ? <Link href={href} onClick={closeCart} className="cart-item-image" aria-label={`Ver imagen referencial de ${name}`}>{image}</Link> : <div className="cart-item-image">{image}</div>}
      <div className="cart-item-content">
        <h3>{href ? <Link href={href} onClick={closeCart}>{name}</Link> : name}</h3>
        {(result?.option ?? item.selectedOption) && <p>{result?.option ?? item.selectedOption}</p>}
        {result?.unitPricePen !== undefined && <p>Por unidad: <strong>S/ {result.unitPricePen.toFixed(2)}</strong></p>}
        {result?.status === "valid" && <p className="cart-line-subtotal">Subtotal: S/ {result.subtotalPen!.toFixed(2)}</p>}
        <div className="cart-item-quantity">
          <Button variant="ghost" size="icon" type="button" disabled={item.quantity <= 1} onClick={() => updateQuantity(item.key, item.quantity - 1)} aria-label={`Reducir cantidad de ${name}`}><Minus size={15} /></Button>
          <input key={item.quantity} type="number" min="1" max={CART_MAX_QUANTITY} step="1" defaultValue={item.quantity}
            aria-label={`Cantidad de ${name}`} aria-describedby={result?.message ? messageId : undefined}
            onBlur={(event) => { updateQuantity(item.key, event.currentTarget.value === "" ? 0 : Number(event.currentTarget.value)); event.currentTarget.value = String(item.quantity); }}
            onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} />
          <Button variant="ghost" size="icon" type="button" disabled={item.quantity >= CART_MAX_QUANTITY || (result?.availableQuantity !== undefined && item.quantity >= result.availableQuantity)} onClick={() => updateQuantity(item.key, item.quantity + 1)} aria-label={`Aumentar cantidad de ${name}`}><Plus size={15} /></Button>
        </div>
        {result?.message && <p className="cart-line-notice" id={messageId}>{result.message} Esta línea no está incluida en el total.</p>}
        {result?.unitPricePen !== undefined && priceChanges.includes(item.key) && <p className="cart-line-notice">El precio cambió. Se muestra el precio vigente.</p>}
      </div>
      <Button variant="ghost" size="icon" className="cart-remove" type="button" onClick={() => removeFromCart(item.key)} aria-label={`Quitar ${name} del carrito`}><Trash2 size={18} /></Button>
    </article>
  );
}
