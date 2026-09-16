import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/features/cart/context/CartContext";
import CartDrawer from "@/features/cart/components/CartDrawer";
import CartTrigger from "@/features/cart/components/CartTrigger";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eternal Memory — Honrar con calma y dignidad",
  description: "Acompañamos a familias en un momento delicado con serenidad, respeto y calidez.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-ink text-bone font-body antialiased min-h-screen flex flex-col selection:bg-brass selection:text-ink">
        <CartProvider>
          {/* HEADER GLOBAL */}
          <nav className="bg-ink/90 backdrop-blur border-b border-brass/10">
            <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
              <Link href="/" className="font-display text-xl tracking-tight hover:text-brass-300 transition-colors">
                Eternal Memory
              </Link>

              <div className="flex items-center gap-6 md:gap-8 text-sm">
                <Link href="/catalogo" className="text-bone-400 hover:text-bone transition-colors">
                  Catálogo
                </Link>
                <Link href="/servicios" className="text-bone-400 hover:text-bone transition-colors hidden sm:inline">
                  Servicios
                </Link>
                <Link href="/contacto" className="text-bone-400 hover:text-bone transition-colors hidden sm:inline">
                  Contacto
                </Link>
                
                {/* BOTÓN TRIGGER DEL CARRITO */}
                <CartTrigger />

                <Link
                  href="/login"
                  className="border border-brass/40 hover:border-brass text-bone text-xs md:text-sm px-4 py-2 rounded transition-colors"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
          </nav>

          {/* CONTENIDO DE CADA PÁGINA */}
          <div className="flex-1 flex flex-col">
            {children}
          </div>

          {/* PANEL DRAWER DEL CARRITO */}
          <CartDrawer />

          {/* FOOTER GLOBAL */}
          <footer className="mt-auto border-t border-brass/10 py-12 bg-ink-800/40">
            <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-bone-500">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                <span className="font-display text-sm text-bone font-medium tracking-tight">Eternal Memory</span>
                <span>Espacio de homenaje y memoria</span>
              </div>

              <div className="flex items-center gap-6">
                <Link href="/terminos" className="hover:text-bone transition-colors">
                  Términos
                </Link>
                <Link href="/privacidad" className="hover:text-bone transition-colors">
                  Privacidad
                </Link>
                <Link href="/contacto" className="hover:text-bone transition-colors">
                  Ayuda
                </Link>
              </div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}