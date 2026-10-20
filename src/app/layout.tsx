import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/features/cart/context/CartContext";
import CartDrawer from "@/features/cart/components/CartDrawer";
import CartTrigger from "@/features/cart/components/CartTrigger";

export const metadata: Metadata = {
  title: "Eternal Memory — Productos funerarios",
  description: "Un catálogo de productos funerarios para elegir con calma.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
          <nav className="site-nav" aria-label="Navegación principal">
            <Link href="/" className="site-brand" aria-label="Eternal Memory, inicio">
              <Image src="/assets/plates/logo.png" alt="Eternal Memory" width={307} height={58} priority />
            </Link>
            <div className="site-nav-links">
              <Link href="/catalogo">Catálogo</Link>
              <Link href="/login">Iniciar sesión</Link>
              <CartTrigger />
            </div>
          </nav>
          <main>{children}</main>
          <CartDrawer />
          <footer className="site-footer">
            <div><strong>Eternal Memory</strong><p>Productos funerarios para elegir con calma.</p></div>
            <div><Link href="/catalogo">Catálogo</Link><Link href="/login">Acceso</Link></div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
