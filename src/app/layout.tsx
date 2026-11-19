import type { Metadata } from "next";
import "./globals.css";
import "@/features/loading/loading.css";
import { CartProvider } from "@/features/cart/context/CartContext";
import CartDrawer from "@/features/cart/components/CartDrawer";
import { SiteFooter } from "@/features/footer/SiteFooter";
import { SiteHeader } from "@/features/header/SiteHeader";
import { SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_TITLE, getSiteUrl } from "@/features/seo/seo";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  // Without `images`: src/app/opengraph-image.tsx provides the default picture.
  openGraph: { type: "website", siteName: SITE_NAME, locale: SITE_LOCALE },
  twitter: { card: "summary_large_image" },
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
