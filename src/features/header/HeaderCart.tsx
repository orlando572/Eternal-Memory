"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/context/CartContext";
import { HeaderIcon } from "@/features/header/HeaderIcon";

export function HeaderCart() {
  const { openCart, totalItems } = useCart();
  return (
    <Button className="header-cart" variant="ghost" type="button" onClick={openCart}
      aria-label={`Abrir carrito, ${totalItems} ${totalItems === 1 ? "producto" : "productos"}`}>
      <HeaderIcon name="cart" /><span>Carrito</span><span className="header-cart-count">{totalItems}</span>
    </Button>
  );
}
