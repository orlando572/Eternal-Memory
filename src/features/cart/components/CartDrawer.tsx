'use client';

import { useCart } from '../context/CartContext';
import CartItemRow from './CartItemRow';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, clearCart, totalItems } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fondo oscuro traslúcido */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Lateral */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-ink-800 border-l border-white/10 text-bone flex flex-col shadow-2xl">
          {/* Encabezado */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl text-bone font-light">Tu Carrito</h2>
              <span className="text-xs bg-brass/15 text-brass-300 border border-brass/30 px-2 py-0.5 rounded">
                {totalItems}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="text-bone-400 hover:text-bone transition-colors text-lg p-1"
            >
              ✕
            </button>
          </div>

          {/* Lista de Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-bone-500 py-12">
                <p className="text-sm">Tu carrito está vacío.</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <CartItemRow key={`${item.id}-${item.selectedOption}-${index}`} item={item} />
              ))
            )}
          </div>

          {/* Pie de Carrito y Acciones */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-ink-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={clearCart}
                  className="text-xs text-bone-500 hover:text-ember-400 transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>

              <button
                onClick={() => alert('Procediendo al pago...')}
                className="w-full py-3 bg-brass-400 hover:bg-brass-300 text-ink-900 font-medium text-sm rounded transition-colors text-center"
              >
                Finalizar Pedido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}