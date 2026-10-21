import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductGallery from "@/features/products/components/ProductGallery";
import ProductSelector from "@/features/products/components/ProductSelector";
import { getProductById } from "@/features/products/data/productsData";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalleProductoPage({ params }: PageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="shop-page detail-page">
      <div className="shop-container">
        <nav className="detail-breadcrumb" aria-label="Ruta de navegación"><Link href="/catalogo">Catálogo</Link><ChevronRight size={16} /><span>{product.nombre}</span></nav>
      <div className="detail-layout">
        <ProductGallery images={product.imagenes} name={product.nombre} />
        <ProductSelector product={product} />
      </div>
      </div>
    </main>
  );
}
