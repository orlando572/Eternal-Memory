"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CatalogError({ retry }: { retry: () => void }) {
  return (
    <main className="shop-page">
      <div className="shop-container catalog-empty catalog-error" role="alert">
        <h1>No pudimos cargar esta información</h1>
        <p>El catálogo no está disponible en este momento. Vuelve a intentarlo.</p>
        <div className="catalog-state-actions">
          <Button onClick={retry}>Volver a intentar</Button>
          <Button asChild variant="outline"><Link href="/catalogo">Ir al catálogo</Link></Button>
        </div>
      </div>
    </main>
  );
}
