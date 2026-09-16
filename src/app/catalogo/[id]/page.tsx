import { notFound } from "next/navigation";
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
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-12 flex-1 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        <ProductGallery images={product.imagenes} />
        <ProductSelector product={product} />
      </div>
    </main>
  );
}