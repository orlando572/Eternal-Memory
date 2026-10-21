'use client';

import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

export default function CartTrigger() {
  const { openCart, totalItems } = useCart();

  return (
    <button
      onClick={openCart}
      className="site-cart-trigger"
      aria-label={`Abrir carrito, ${totalItems} productos`}
    >
      <ShoppingCart size={21} fill="currentColor" strokeWidth={1.5} />
      <span>{totalItems}</span>
    </button>
  );
}
