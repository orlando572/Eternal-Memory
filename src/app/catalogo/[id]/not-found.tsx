import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="shop-page">
      <div className="shop-container catalog-empty catalog-error">
        <h1>Este producto no está disponible</h1>
        <p>Vuelve al catálogo para consultar los productos publicados.</p>
        <div className="catalog-state-actions"><Button asChild><Link href="/catalogo">Volver al catálogo</Link></Button></div>
      </div>
    </main>
  );
}
