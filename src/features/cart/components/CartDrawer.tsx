"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/context/CartContext";
import CartItemRow from "@/features/cart/components/CartItemRow";
import "@/features/cart/cart.css";

export default function CartDrawer() {
  const { cart, isOpen, initialized, closeCart, clearCart, totalItems, validation, error, retry, storageWarning, mutationWarning } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const excluded = validation?.lines.filter((line) => line.status !== "valid").length ?? 0;

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
      if (event.key !== "Tab") return;
      const controls = Array.from(drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])') ?? []);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    const content = [document.querySelector(".site-nav"), document.querySelector("#site-content"), document.querySelector(".site-footer")].filter((element): element is HTMLElement => element instanceof HTMLElement);
    const previousInert = content.map((element) => element.inert);
    content.forEach((element) => { element.inert = true; });
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      content.forEach((element, index) => { element.inert = previousInert[index]; });
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="cart-overlay">
      <button className="cart-backdrop" type="button" onClick={closeCart} aria-label="Cerrar carrito" tabIndex={-1} />
      <aside ref={drawerRef} className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <header className="cart-header">
          <div><h2 id="cart-title">Tu selección</h2><p>{totalItems} {totalItems === 1 ? "unidad guardada" : "unidades guardadas"}</p></div>
          <Button ref={closeButtonRef} variant="ghost" size="icon" type="button" onClick={closeCart} aria-label="Cerrar carrito"><X size={22} /></Button>
        </header>
        <div className="cart-body">
          {storageWarning && <p className="cart-notice" role="alert">{storageWarning}</p>}
          {mutationWarning && <p className="cart-notice" role="alert">{mutationWarning}</p>}
          {!initialized ? <p role="status">Recuperando tu selección…</p> : cart.length === 0 ? (
            <div className="cart-empty"><ShoppingBag size={38} strokeWidth={1.25} /><h3>Aún no elegiste productos</h3><p>Explora el catálogo y guarda las opciones que quieras revisar.</p><Link href="/catalogo" onClick={closeCart}>Explorar catálogo <ArrowRight size={18} /></Link></div>
          ) : cart.map((item) => <CartItemRow key={item.key} item={item} />)}
        </div>
        {cart.length > 0 && <footer className="cart-summary">
          <Button variant="ghost" type="button" onClick={clearCart}>Vaciar carrito</Button>
          <div aria-live="polite">
            <span>{excluded ? "Total de artículos válidos" : "Total de artículos"}</span>
            {validation ? <strong>S/ {validation.totalPen.toFixed(2)}</strong> : <span>{error ? "Sin validar" : "Validando…"}</span>}
          </div>
          <div className="cart-validation-status" aria-live="polite">
            {error ? <><p role="alert">{error} Conservamos tu selección; los importes están ocultos.</p><Button variant="outline" size="sm" type="button" onClick={retry}>Reintentar</Button></> : !validation ? <p role="status">Comprobando precios y existencias vigentes…</p> : excluded > 0 ? <p>{excluded} {excluded === 1 ? "línea excluida" : "líneas excluidas"} del total. Revisa los avisos de cada artículo.</p> : <p>Precios y existencias comprobados.</p>}
          </div>
          <p>Imágenes referenciales. Tu selección se guarda en este navegador y no reserva unidades. Total solo de artículos, sin envío ni cargos adicionales. La compra en línea aún no está disponible.</p>
          <Link href="/catalogo" onClick={closeCart}>Seguir explorando <ArrowRight size={18} /></Link>
        </footer>}
      </aside>
    </div>
  );
}
