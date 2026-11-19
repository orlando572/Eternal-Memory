import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductGallery from "@/features/products/components/ProductGallery";
import ProductSelector from "@/features/products/components/ProductSelector";
import { ProductBreadcrumb } from "@/features/products/components/ProductBreadcrumb";
import { ProductServiceInfo } from "@/features/products/components/ProductServiceInfo";
import { RelatedProducts } from "@/features/products/components/RelatedProducts";
import { getCatalogProduct } from "@/features/catalogo/services/catalogService";
import { getEngravingOption, getRelatedProducts, getShippingRates } from "@/features/products/services/productDetailService";
import { productMetadata } from "@/features/seo/seo";
import "@/features/products/product-detail.css";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Metadata and page share one catalog query per request.
const loadProduct = cache(getCatalogProduct);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await loadProduct(id);
    return product ? productMetadata(product) : { title: "Producto no encontrado", robots: { index: false } };
  } catch {
    // The page itself reports the failure through error.tsx.
    return {};
  }
}

export default async function DetalleProductoPage({ params }: PageProps) {
  const { id } = await params;
  const product = await loadProduct(id);

  if (!product) {
    notFound();
  }

  const [relatedProducts, shippingRates, engraving] = await Promise.all([
    getRelatedProducts(product),
    getShippingRates(),
    getEngravingOption(product.category.slug),
  ]);

  return (
    <main className="shop-page detail-page">
      <div className="shop-container">
        <ProductBreadcrumb product={product} />
        <div className="detail-layout">
          <ProductGallery key={`gallery-${product.id}`} images={product.images} name={product.name} />
          <ProductSelector key={`selector-${product.id}`} product={product} serviceInfo={<ProductServiceInfo shippingRates={shippingRates} engraving={engraving} />} />
        </div>
        <RelatedProducts products={relatedProducts} />
      </div>
    </main>
  );
}
