"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <main id="main-content" className="shop-page auth-page">
      <div className="auth-layout shop-container">
        <section className="auth-intro" aria-labelledby="auth-page-title">
          <Link href="/" className="shop-back-link">
            <ArrowLeft size={14} aria-hidden="true" /> Volver al inicio
          </Link>
          <h1 id="auth-page-title">{title}</h1>
          <p>{description}</p>
          <Link href="/catalogo" className="auth-catalog-link">
            Explorar catálogo <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
        <section className="auth-panel" aria-labelledby="auth-panel-title">
          {children}
        </section>
      </div>
    </main>
  );
}
