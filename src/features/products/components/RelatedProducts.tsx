import { CatalogProductCard } from "@/features/catalogo/components/CatalogProductCard";
import type { CatalogProduct } from "@/features/catalogo/types/catalog";

export function RelatedProducts({ products }: { products: CatalogProduct[] }) {
  if (!products.length) return null;
  return (
    <section className="detail-related" aria-labelledby="detail-related-title">
      <h2 id="detail-related-title">También te puede interesar</h2>
      <div className="catalog-grid">
        {products.map((product) => <CatalogProductCard key={product.id} product={product} headingLevel="h3" />)}
      </div>
    </section>
  );
}
