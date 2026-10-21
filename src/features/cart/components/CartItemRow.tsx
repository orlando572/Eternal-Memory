"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem, useCart } from "../context/CartContext";

export default function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <article className="cart-item">
      <div className="cart-item-image">
        {item.imagenes?.[0] ? <img src={item.imagenes[0]} alt={`Imagen referencial de ${item.nombre}`} /> : <span>Sin imagen</span>}
      </div>
      <div className="cart-item-content">
        <h3>{item.nombre}</h3>
        {item.selectedOption && <p>{item.selectedOption}</p>}
        <strong>{item.precio}</strong>
        <div className="cart-item-quantity">
          <button type="button" onClick={() => updateQuantity(item.id, item.selectedOption, item.quantity - 1)} aria-label={`Reducir cantidad de ${item.nombre}`}><Minus size={15} /></button>
          <span>{item.quantity}</span>
          <button type="button" onClick={() => updateQuantity(item.id, item.selectedOption, item.quantity + 1)} aria-label={`Aumentar cantidad de ${item.nombre}`}><Plus size={15} /></button>
        </div>
      </div>
      <button className="cart-remove" type="button" onClick={() => removeFromCart(item.id, item.selectedOption)} aria-label={`Quitar ${item.nombre} del carrito`}><Trash2 size={18} /></button>
    </article>
  );
}
