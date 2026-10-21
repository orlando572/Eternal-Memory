"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "../data/productsData";
import { useCart } from "@/features/cart/context/CartContext";

export default function ProductSelector({ product }: { product: Product }) {
  const [selectedOption, setSelectedOption] = useState(product.opciones?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const handleAddToCart = () => addToCart({ ...product, selectedOption, quantity });

  return (
    <div className="detail-info">
      <p className="detail-category">{product.categoria}</p>
      <h1>{product.nombre}</h1>
      <strong className="detail-price">{product.precio}</strong>
      <p className="detail-description">{product.descripcion}</p>

      {product.opciones && product.opciones.length > 0 && (
        <fieldset className="detail-options">
          <legend>Acabado o variante</legend>
          <div>
            {product.opciones.map((option) => (
              <button key={option} type="button" className={selectedOption === option ? "active" : ""} aria-pressed={selectedOption === option} onClick={() => setSelectedOption(option)}>{option}</button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="detail-purchase">
        <div className="detail-quantity">
          <span>Cantidad</span>
          <div>
            <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Reducir cantidad"><Minus size={17} /></button>
            <output aria-live="polite">{quantity}</output>
            <button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Aumentar cantidad"><Plus size={17} /></button>
          </div>
        </div>
        <Button type="button" className="detail-add-button" onClick={handleAddToCart}><ShoppingCart size={19} /> Añadir al carrito</Button>
      </div>
      <p className="detail-support">Tu selección queda guardada en este navegador para que puedas revisarla con calma.</p>
      <div className="detail-mobile-sticky-add"><strong>{product.precio}</strong><Button type="button" onClick={handleAddToCart}><ShoppingCart size={18} /> Añadir al carrito</Button></div>
    </div>
  );
}
