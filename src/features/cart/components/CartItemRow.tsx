'use client';

import { CartItem, useCart } from '../context/CartContext';

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex gap-4 py-4 border-b border-white/10 items-center">
      <div className="w-16 h-16 bg-ink-700 rounded border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
        {item.imagenes?.[0] ? (
          <img src={item.imagenes[0]} alt={item.nombre} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[10px] text-bone-500 text-center">Sin imagen</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-bone truncate">{item.nombre}</p>
        {item.selectedOption && (
          <p className="text-xs text-bone-500 mt-0.5">Opción: {item.selectedOption}</p>
        )}
        <p className="text-xs text-brass-300 font-medium mt-1">{item.precio}</p>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <button
          onClick={() => removeFromCart(item.id, item.selectedOption)}
          className="text-xs text-bone-500 hover:text-ember-400 transition-colors"
          title="Eliminar"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 border border-white/10 bg-ink-800/50 rounded px-1.5 py-0.5">
          <button
            onClick={() => updateQuantity(item.id, item.selectedOption, item.quantity - 1)}
            className="text-xs text-bone-400 hover:text-bone w-4 h-4 flex items-center justify-center"
          >
            -
          </button>
          <span className="text-xs font-medium text-bone w-4 text-center">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.selectedOption, item.quantity + 1)}
            className="text-xs text-bone-400 hover:text-bone w-4 h-4 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}