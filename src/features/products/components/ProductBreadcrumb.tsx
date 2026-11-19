import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { catalogHref } from "@/features/catalogo/lib/catalogPresentation";
import type { CatalogProduct } from "@/features/catalogo/types/catalog";

export function ProductBreadcrumb({ product }: { product: Pick<CatalogProduct, "name" | "category"> }) {
  const separator = <ChevronRight size={15} aria-hidden="true" />;
  return (
    <nav className="detail-breadcrumb" aria-label="Ruta de navegación">
      <ol>
        <li><Link href="/">Inicio</Link>{separator}</li>
        <li><Link href="/catalogo">Catálogo</Link>{separator}</li>
        <li><Link href={catalogHref({ query: "", categorySlug: product.category.slug, page: 1 })}>{product.category.name}</Link>{separator}</li>
        <li><span aria-current="page">{product.name}</span></li>
      </ol>
    </nav>
  );
}
