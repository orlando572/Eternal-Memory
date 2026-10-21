import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountNavigation } from "@/features/auth/components/AccountNavigation";
import CartTrigger from "@/features/cart/components/CartTrigger";
import { HeaderCart } from "@/features/header/HeaderCart";
import { HeaderCategories } from "@/features/header/HeaderCategories";
import { HeaderIcon } from "@/features/header/HeaderIcon";
import "@/features/header/header.css";

export function SiteHeader() {
  return (
    <header className="site-nav site-header">
      <nav className="header-main" aria-label="Navegación principal">
        <Link href="/" className="site-brand" aria-label="Eternal Memory, inicio">
          <Image src="/assets/plates/logo.png" alt="Eternal Memory" width={307} height={58} priority />
        </Link>
        <form className="header-search" action="/catalogo" method="get" role="search" aria-label="Buscar en el catálogo">
          <label className="header-search-label" htmlFor="header-query">Buscar productos por nombre</label>
          <Input id="header-query" name="q" type="search" placeholder="Buscar productos por nombre…" maxLength={100} />
          <Button type="submit" variant="ghost" aria-label="Buscar productos"><HeaderIcon name="search" /></Button>
        </form>
        <div className="site-nav-links">
          <Link className="header-mobile-catalog" href="/catalogo">Catálogo</Link>
          <AccountNavigation />
          <CartTrigger />
          <HeaderCart />
        </div>
      </nav>
      <HeaderCategories />
    </header>
  );
}
