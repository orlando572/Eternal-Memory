import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

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
      <body className="bg-ink text-bone font-body antialiased min-h-screen selection:bg-brass selection:text-ink">
        {children}
      </body>
    </html>
  );
}
