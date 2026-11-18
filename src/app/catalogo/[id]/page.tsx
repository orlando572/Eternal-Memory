import { notFound } from "next/navigation";
import ProductGallery from "@/features/products/components/ProductGallery";
import ProductSelector from "@/features/products/components/ProductSelector";
import { ProductBreadcrumb } from "@/features/products/components/ProductBreadcrumb";
import { ProductServiceInfo } from "@/features/products/components/ProductServiceInfo";
import { RelatedProducts } from "@/features/products/components/RelatedProducts";
import { getCatalogProduct } from "@/features/catalogo/services/catalogService";
import { getEngravingOption, getRelatedProducts, getShippingRates } from "@/features/products/services/productDetailService";
import "@/features/products/product-detail.css";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalleProductoPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getCatalogProduct(id);

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
