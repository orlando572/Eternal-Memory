"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import CartItemRow from "./CartItemRow";

export default function CartDrawer() {
  const { cart, isOpen, closeCart, clearCart, totalItems } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const subtotal = cart.reduce((total, item) => total + (item.unitPricePen ?? Number(item.precio.replace(/[^\d.]/g, ""))) * item.quantity, 0);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") closeCart(); };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = previousOverflow; };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="cart-overlay">
      <button className="cart-backdrop" type="button" onClick={closeCart} aria-label="Cerrar carrito" />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <header className="cart-header"><div><h2 id="cart-title">Tu selección</h2><p>{totalItems} {totalItems === 1 ? "producto guardado" : "productos guardados"}</p></div><button ref={closeButtonRef} type="button" onClick={closeCart} aria-label="Cerrar carrito"><X size={22} /></button></header>
        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty"><ShoppingBag size={38} strokeWidth={1.25} /><h3>Aún no elegiste productos</h3><p>Explora el catálogo y guarda las opciones que quieras revisar.</p><Link href="/catalogo" onClick={closeCart}>Explorar catálogo <ArrowRight size={18} /></Link></div>
          ) : cart.map((item) => <CartItemRow key={`${item.id}-${item.selectedOption}`} item={item} />)}
        </div>
        {cart.length > 0 && <footer className="cart-summary"><button type="button" onClick={clearCart}>Vaciar carrito</button><div><span>Subtotal referencial</span><strong>S/ {subtotal.toFixed(2)}</strong></div><p>Tu selección se guarda en este navegador. La compra en línea aún no está disponible.</p><Link href="/catalogo" onClick={closeCart}>Seguir explorando <ArrowRight size={18} /></Link></footer>}
      </aside>
    </div>
  );
}
