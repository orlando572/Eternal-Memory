import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
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

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-ink text-bone font-body antialiased min-h-screen flex flex-col selection:bg-brass selection:text-ink">
        <CartProvider>
          {/* HEADER / NAVEGACIÓN GLOBAL */}
          <nav className="bg-ink/90 backdrop-blur border-b border-brass/10">
            <div className="w-full md:max-w-[85%] lg:max-w-[80%] mx-auto px-4 sm:px-6 md:px-10 h-16 sm:h-20 flex items-center justify-between gap-4">
              <Link href="/" className="flex items-center shrink-0 hover:opacity-85 transition-opacity">
                <Image
                  src="/logo.png"
                  alt="Eternal Memory"
                  width={180}
                  height={48}
                  priority
                  className="h-9 sm:h-12 w-auto object-contain"
                />
              </Link>

              <div className="flex items-center gap-3 sm:gap-6 md:gap-8 text-xs sm:text-sm">
                <Link href="/catalogo" className="text-bone-400 hover:text-bone transition-colors">
                  Catálogo
                </Link>
                <Link href="/servicios" className="text-bone-400 hover:text-bone transition-colors hidden sm:inline">
                  Servicios
                </Link>
                <Link href="/contacto" className="text-bone-400 hover:text-bone transition-colors hidden sm:inline">
                  Contacto
                </Link>

                {/* BOTÓN DEL CARRITO */}
                <CartTrigger />

                <Link
                  href="/login"
                  className="border border-brass/40 hover:border-brass text-bone text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded transition-colors shrink-0"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
          </nav>

          {/* CONTENIDO DE CADA PÁGINA */}
          <main className="flex-1 flex flex-col">{children}</main>

          {/* PANEL DRAWER DEL CARRITO */}
          <CartDrawer />

          {/* FOOTER */}
          <footer className="mt-auto border-t border-brass/10 pt-10 pb-8 bg-ink-800/40">
            <div className="w-full md:max-w-[85%] lg:max-w-[80%] mx-auto px-4 sm:px-6 md:px-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                {/* Columna Izquierda */}
                <div className="lg:col-span-5 space-y-3">
                  <Link href="/" className="inline-block hover:opacity-85 transition-opacity">
                    <Image
                      src="/logo.png"
                      alt="Eternal Memory"
                      width={240}
                      height={64}
                      className="h-12 sm:h-14 w-auto object-contain"
                    />
                  </Link>

                  <p className="text-xs text-bone-400 leading-relaxed max-w-sm">
                    Espacio de memoria y homenaje para honrar a seres queridos con serenidad, respeto y transparencia.
                  </p>
                </div>

                {/* Enlaces y Contacto */}
                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-brass font-semibold mb-2.5">
                      Secciones
                    </h4>
                    <ul className="space-y-2 text-xs text-bone-400">
                      <li>
                        <Link href="/catalogo" className="hover:text-bone transition-colors">
                          Catálogo
                        </Link>
                      </li>
                      <li>
                        <Link href="/servicios" className="hover:text-bone transition-colors">
                          Servicios
                        </Link>
                      </li>
                      <li>
                        <Link href="/contacto" className="hover:text-bone transition-colors">
                          Contacto
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-brass font-semibold mb-2.5">
                      Legal
                    </h4>
                    <ul className="space-y-2 text-xs text-bone-400">
                      <li>
                        <Link href="/terminos" className="hover:text-bone transition-colors">
                          Términos
                        </Link>
                      </li>
                      <li>
                        <Link href="/privacidad" className="hover:text-bone transition-colors">
                          Privacidad
                        </Link>
                      </li>
                      <li>
                        <Link href="/contacto" className="hover:text-bone transition-colors">
                          Ayuda
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <h4 className="text-xs uppercase tracking-wider text-brass font-semibold mb-2.5">
                      Atención Inmediata
                    </h4>
                    <div className="space-y-2 text-xs text-bone-400">
                      <a
                        href="https://wa.me/51999999999?text=Hola,%20necesito%20orientación"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-brass hover:underline font-medium"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>WhatsApp 24/7</span>
                      </a>
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-brass-300 shrink-0" />
                        <span>contacto@eternalmemory.com</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
