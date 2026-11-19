"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { LoadingIndicator, LoadingRegion, Skeleton } from "@/features/loading/Loading";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/context/CartContext";
import CartItemRow from "@/features/cart/components/CartItemRow";
import { CartIcon } from "@/features/cart/components/CartIcon";
import { useCartMotion } from "@/features/cart/components/useCartMotion";
import "@/features/cart/cart.css";

export default function CartDrawer() {
  const { cart, isOpen, initialized, closeCart, clearCart, totalItems, validation, error, retry, storageWarning, mutationWarning } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const excluded = validation?.lines.filter((line) => line.status !== "valid").length ?? 0;
  const { present, finishExit } = useCartMotion(isOpen);

  useEffect(() => {
    if (!present) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
      if (event.key !== "Tab") return;
      const controls = Array.from(drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])') ?? [])
        .filter((control) => control.getClientRects().length > 0);
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
  }, [present, closeCart]);

  if (!present) return null;

  return (
    <div className="cart-overlay" data-state={isOpen ? "open" : "closed"}>
      <button className="cart-backdrop" type="button" onClick={closeCart} aria-label="Cerrar carrito" tabIndex={-1} />
      <aside ref={drawerRef} className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title"
        onTransitionEnd={(event) => { if (event.target === event.currentTarget && event.propertyName === "transform") finishExit(); }}>
        <header className="cart-header">
          <div><h2 id="cart-title">Tu selección</h2><p>{totalItems} {totalItems === 1 ? "unidad guardada" : "unidades guardadas"}</p></div>
          <div className="cart-header-actions">
            {cart.length > 0 && <Button className="cart-clear-desktop" variant="ghost" type="button" onClick={clearCart}>Vaciar carrito</Button>}
            <Button className="cart-close" ref={closeButtonRef} variant="ghost" size="icon" type="button" onClick={closeCart} aria-label="Cerrar carrito"><CartIcon name="close" /></Button>
          </div>
        </header>
        <div className="cart-body">
          {storageWarning && <p className="cart-notice" role="alert">{storageWarning}</p>}
          {mutationWarning && <p className="cart-notice" role="alert">{mutationWarning}</p>}
          {!initialized ? <LoadingRegion label="Recuperando selección"><div className="loading-options"><Skeleton className="loading-input" /><Skeleton className="loading-input" /></div></LoadingRegion> : cart.length === 0 ? (
            <div className="cart-empty"><CartIcon name="cart" /><h3>Aún no elegiste productos</h3><p>Explora el catálogo y guarda las opciones que quieras revisar.</p><Link href="/catalogo" onClick={closeCart}>Explorar catálogo <CartIcon name="arrow" /></Link></div>
          ) : cart.map((item) => <CartItemRow key={item.key} item={item} />)}
        </div>
        {cart.length > 0 && <footer className="cart-summary">
          <Button className="cart-clear-mobile" variant="ghost" type="button" onClick={clearCart}>Vaciar carrito</Button>
          <div className="cart-total" aria-live="polite">
            <span>{excluded ? "Total de artículos válidos" : "Total de artículos"}</span>
            {validation ? <strong>S/ {validation.totalPen.toFixed(2)}</strong> : <span>{error ? "Sin validar" : <LoadingIndicator label="Validando total" />}</span>}
          </div>
          {(error || !validation || excluded > 0) && (
            <div className="cart-validation-status" data-status={error ? "error" : !validation ? "loading" : "warning"} aria-live="polite">
              {error ? <><p role="alert">{error} Conservamos tu selección; los importes están ocultos.</p><Button variant="outline" size="sm" type="button" onClick={retry}>Reintentar</Button></> : !validation ? <LoadingIndicator label="Comprobando precios y existencias" /> : <p>{excluded} {excluded === 1 ? "línea excluida" : "líneas excluidas"} del total. Revisa los avisos de cada artículo.</p>}
            </div>
          )}
          {initialized && validation && !error && excluded === 0 && <Button asChild><Link className="cart-checkout" href="/checkout" onClick={closeCart}>Continuar con pedido <CartIcon name="arrow" /></Link></Button>}
          <Button className="cart-continue-desktop" variant="ghost" type="button" onClick={closeCart}>Seguir explorando</Button>
          <Link className="cart-continue-mobile" href="/catalogo" onClick={closeCart}>Seguir explorando <CartIcon name="arrow" /></Link>
        </footer>}
      </aside>
    </div>
  );
}
