import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductGallery from "@/features/products/components/ProductGallery";
import ProductSelector from "@/features/products/components/ProductSelector";
import { getCatalogProduct } from "@/features/catalogo/services/catalogService";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalleProductoPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getCatalogProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="shop-page detail-page">
      <div className="shop-container">
        <nav className="detail-breadcrumb" aria-label="Ruta de navegación"><Link href="/catalogo">Catálogo</Link><ChevronRight size={16} aria-hidden="true" /><span>{product.name}</span></nav>
      <div className="detail-layout">
        <ProductGallery key={`gallery-${product.id}`} images={product.images} name={product.name} />
        <ProductSelector key={`selector-${product.id}`} product={product} />
      </div>
      </div>
    </main>
  );
}
