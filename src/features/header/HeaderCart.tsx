"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/context/CartContext";
import { LoadingIndicator } from "@/features/loading/Loading";
import { HeaderIcon } from "@/features/header/HeaderIcon";

export function HeaderCart() {
  const { openCart, totalItems, initialized } = useCart();
  return (
    <Button className="header-cart" variant="ghost" type="button" onClick={openCart}
      aria-label={initialized ? `Abrir carrito, ${totalItems} ${totalItems === 1 ? "producto" : "productos"}` : "Abrir carrito"}>
      <HeaderIcon name="cart" /><span>Carrito</span><span className="header-cart-count">{initialized ? totalItems : <LoadingIndicator label="Recuperando carrito" />}</span>
    </Button>
  );
}
