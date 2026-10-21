'use client';

import { LoadingIndicator } from "@/features/loading/Loading";
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

export default function CartTrigger() {
  const { openCart, totalItems, initialized } = useCart();

  return (
    <button
      onClick={openCart}
      className="site-cart-trigger"
      aria-label={initialized ? `Abrir carrito, ${totalItems} productos` : "Abrir carrito"}
    >
      <ShoppingCart size={21} fill="currentColor" strokeWidth={1.5} />
      <span>{initialized ? totalItems : <LoadingIndicator label="Recuperando carrito" />}</span>
    </button>
  );
}
