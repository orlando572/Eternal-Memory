'use client';

import { useCart } from '../context/CartContext';

export default function CartTrigger() {
  const { openCart, totalItems } = useCart();

  return (
    <button
      onClick={openCart}
      className="relative text-bone-400 hover:text-bone transition-colors flex items-center gap-2 text-sm"
      aria-label="Abrir Carrito"
    >
      <span>Carrito</span>
      {totalItems > 0 && (
        <span className="text-xs font-medium bg-brass/15 text-brass-300 border border-brass/30 px-2 py-0.5 rounded-full">
          {totalItems}
        </span>
      )}
    </button>
  );
}