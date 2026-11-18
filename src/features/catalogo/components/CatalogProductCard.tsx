import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductImage } from "@/features/products/components/ProductImage";
import { formatCatalogPrice } from "@/features/catalogo/lib/catalogPresentation";
import type { CatalogProduct } from "@/features/catalogo/types/catalog";

type CatalogProductCardProps = {
  product: CatalogProduct;
  headingLevel?: "h2" | "h3";
  sizes?: string;
};

export function CatalogProductCard({ product, headingLevel: Heading = "h2", sizes = "(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 23vw" }: CatalogProductCardProps) {
  const image = product.images[0];
  return (
    <article className="catalog-card">
      <Link href={`/catalogo/${product.slug}`} aria-label={`Ver ${product.name}`}>
        <div className="catalog-card-image">
          <ProductImage src={image?.src} alt={image?.alt || `${image?.isReference ? "Imagen referencial de " : ""}${product.name}`} sizes={sizes} />
        </div>
        <div className="catalog-card-content">
          <p>{product.category.name}</p>
          <Heading>{product.name}</Heading>
          <div><strong>{product.priceFromPen === null ? "Sin opciones disponibles" : `${product.hasPriceRange ? "Desde " : ""}${formatCatalogPrice(product.priceFromPen)}`}</strong><ArrowRight size={20} aria-hidden="true" /></div>
          <p className="catalog-availability">{product.isAvailable ? "Disponible" : "Agotado"}</p>
        </div>
      </Link>
    </article>
  );
}
