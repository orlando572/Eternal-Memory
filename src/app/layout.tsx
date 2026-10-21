import type { Metadata } from "next";
import "./globals.css";
import "@/features/loading/loading.css";
import { CartProvider } from "@/features/cart/context/CartContext";
import CartDrawer from "@/features/cart/components/CartDrawer";
import { SiteFooter } from "@/features/footer/SiteFooter";
import { SiteHeader } from "@/features/header/SiteHeader";

export const metadata: Metadata = {
  title: "Eternal Memory — Productos funerarios",
  description: "Un catálogo de productos funerarios para elegir con calma.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        <CartProvider>
          <SiteHeader />
          <div id="site-content">{children}</div>
          <CartDrawer />
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
