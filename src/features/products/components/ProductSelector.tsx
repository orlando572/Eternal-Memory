'use client';

import { useState } from 'react';
import { Product } from '../data/productsData';
import { useCart } from '@/features/cart/context/CartContext';

interface ProductSelectorProps {
  product: Product;
}

export default function ProductSelector({ product }: ProductSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<string>(
    product.opciones?.[0] || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      ...product,
      selectedOption,
      quantity,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs text-bone-500 uppercase tracking-wider">
            {product.categoria}
          </span>
          {product.badgeTipo === 'moss' && (
            <span className="text-[11px] font-medium bg-moss/15 text-moss-400 border border-moss/30 px-2.5 py-0.5 rounded">
              {product.badge}
            </span>
          )}
          {product.badgeTipo === 'ember' && (
            <span className="text-[11px] font-medium bg-ember/15 text-ember-400 border border-ember/30 px-2.5 py-0.5 rounded">
              {product.badge}
            </span>
          )}
          {product.badgeTipo === 'brass' && (
            <span className="text-[11px] font-medium bg-brass/15 text-brass-300 border border-brass/30 px-2.5 py-0.5 rounded">
              {product.badge}
            </span>
          )}
          {product.badgeTipo === 'neutral' && (
            <span className="text-[11px] font-medium bg-white/5 text-bone-400 border border-white/10 px-2.5 py-0.5 rounded">
              {product.badge}
            </span>
          )}
        </div>
        <h1 className="font-display font-light text-3xl md:text-4xl text-bone">
          {product.nombre}
        </h1>
        <p className="text-2xl text-brass-300 font-medium mt-2">
          {product.precio}
        </p>
      </div>

      <p className="text-bone-400 text-sm leading-relaxed">
        {product.descripcion}
      </p>

      {/* Selector de Opciones */}
      {product.opciones && product.opciones.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-bone-400">
            Variante / Acabado:
          </label>
          <div className="flex flex-wrap gap-2">
            {product.opciones.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedOption(option)}
                className={`px-3.5 py-1.5 text-xs rounded border transition-colors ${
                  selectedOption === option
                    ? 'bg-brass/15 text-brass-300 border-brass/30'
                    : 'text-bone-400 border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selector de Cantidad */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-bone-400">Cantidad:</label>
        <div className="flex items-center gap-3 w-max border border-white/10 bg-ink-800/50 rounded p-1">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-8 h-8 flex items-center justify-center text-bone-400 hover:text-bone hover:bg-white/5 rounded font-bold"
          >
            -
          </button>
          <span className="w-8 text-center text-sm font-medium text-bone">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-8 h-8 flex items-center justify-center text-bone-400 hover:text-bone hover:bg-white/5 rounded font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Botón para Añadir al Carrito */}
      <button
        onClick={handleAddToCart}
        className="w-full py-3 bg-brass-400 hover:bg-brass-300 text-ink-900 font-medium text-sm rounded transition-colors mt-2"
      >
        Añadir al Carrito
      </button>
    </div>
  );
}