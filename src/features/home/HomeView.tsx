"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Skeleton, CardSkeleton, LoadingRegion } from "@/features/loading/Loading";
import { LoadingButton } from "@/features/loading/LoadingButton";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/features/products/components/ProductImage";
import { catalogHref, formatCatalogPrice } from "@/features/catalogo/lib/catalogPresentation";
import type { CatalogCategory, CatalogProduct } from "@/features/catalogo/types/catalog";
import { getHomeContent } from "@/features/home/homeContent";
import { HomeCategoryIcon } from "@/features/home/HomeCategoryIcon";

type HomeSelection = {
  category: CatalogCategory;
  products: CatalogProduct[];
  failed: boolean;
};

type HomeViewProps = {
  selections: HomeSelection[];
  loading?: boolean;
  failed?: boolean;
};

function ProductPrice({ product }: { product: CatalogProduct }) {
  return <strong>{product.priceFromPen === null ? "Sin opciones disponibles" : `${product.hasPriceRange ? "Desde " : ""}${formatCatalogPrice(product.priceFromPen)}`}</strong>;
}

function ProductNote({ product }: { product: CatalogProduct }) {
  return <span className="home-sample-note">{!product.isAvailable && "Agotado"}{!product.isAvailable && product.images[0]?.isReference && " · "}{product.images[0]?.isReference && "Imagen referencial"}</span>;
}

export default function HomeView({ selections, loading = false, failed = false }: HomeViewProps) {
  const [selectedSlug, setSelectedSlug] = useState("urnas");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const selection = selections.find(({ category }) => category.slug === selectedSlug) ?? selections[0];
  const content = getHomeContent(selection?.category);
  const [featured, ...products] = selection?.products ?? [];
  const unavailable = failed || selection?.failed;
  const catalogLink = catalogHref({ query: "", categorySlug: selection?.category.slug ?? null, page: 1 });

  function retry() {
    startTransition(() => router.refresh());
  }

  return (
    <div className="home-first-view" aria-busy={loading || pending}>
      <section className="home-hero" aria-label="Selección de productos funerarios">
        <Image className="home-stucco" src="/assets/plates/stucco.png" width={2048} height={768} alt="" loading="eager" unoptimized />
        <Image className="home-patio" src="/assets/plates/patio-view.png" width={1254} height={1254} alt="Patio soleado visto a través de un umbral" unoptimized />
        <div className="home-intro">
          <p className="home-kicker">{content.kicker}</p>
          <h1>{content.title}</h1>
          <p className="home-subtitle">{content.subtitle}</p>
          <div className="home-categories" role="group" aria-label="Categorías">
            {loading && Array.from({ length: 4 }, (_, index) => <Skeleton className="home-category-skeleton" key={index} />)}
            {selections.map(({ category }) => {
              const selected = selection?.category.slug === category.slug;
              return (
                <Button key={category.id} type="button" variant={selected ? "default" : "outline"}
                  className={selected ? "selected" : undefined} aria-pressed={selected}
                  onClick={() => setSelectedSlug(category.slug)}>
                  <HomeCategoryIcon categorySlug={category.slug} />{category.name}
                </Button>
              );
            })}
          </div>
        </div>
        {loading ? <div className="home-feature home-loading-feature"><LoadingRegion label="Cargando productos"><div className="home-loading-feature-layout"><Skeleton className="home-loading-feature-photo" /><div className="home-loading-feature-copy"><Skeleton className="loading-line" /><Skeleton className="loading-line" /><Skeleton className="loading-price" /></div></div></LoadingRegion></div> : featured ? (
          <Link className="home-feature" href={`/catalogo/${featured.slug}`} aria-label={`Ver ${featured.name}`}>
            <div className="home-feature-photo">
              <ProductImage src={featured.images[0]?.src} alt={featured.images[0]?.alt || featured.name} sizes="(max-width: 600px) 90vw, (max-width: 900px) 55vw, 30vw" />
            </div>
            <div className="home-feature-info">
              <h2>{featured.name}</h2>
              <p>{featured.description}</p>
              <ProductPrice product={featured} />
              <ProductNote product={featured} />
            </div>
          </Link>
        ) : (
          <div className="home-feature home-state" role="status">
            <h2>{unavailable ? "No pudimos cargar los productos" : selection ? "Aún no hay productos en esta categoría" : "Aún no hay categorías disponibles"}</h2>
            <p>{unavailable ? "Inténtalo de nuevo en un momento." : "Cuando haya productos publicados, podrás explorarlos aquí."}</p>
            {unavailable && <LoadingButton variant="outline" busy={pending} onClick={retry}>Reintentar</LoadingButton>}
          </div>
        )}
      </section>
      <section className="home-products" aria-labelledby="home-products-title">
        <div className="home-products-intro">
          <p className="home-kicker">{content.collection}</p>
          <h2 id="home-products-title">{content.heading}</h2>
          <p>{content.description}</p>
          <Link href={catalogLink}>{selection ? content.catalogLabel : "Ver catálogo"} <ArrowRight size={19} aria-hidden="true" /></Link>
        </div>
        <div className="home-product-list">
          {loading && Array.from({ length: 3 }, (_, index) => <CardSkeleton key={index} />)}
          {products.map((product) => (
            <article className="home-product-card" key={product.id}>
              <Link href={`/catalogo/${product.slug}`} aria-label={`Ver ${product.name}`}>
                <div className="home-card-image">
                  <ProductImage src={product.images[0]?.src} alt={product.images[0]?.alt || product.name} sizes="(max-width: 600px) 90vw, (max-width: 900px) 30vw, 23vw" />
                </div>
                <div className="home-product-meta">
                  <h3>{product.name}</h3>
                  <div><ProductPrice product={product} /></div>
                  <ProductNote product={product} />
                </div>
              </Link>
            </article>
          ))}
        </div>
        <p className="home-category-status" role="status">{selection && !unavailable ? `Mostrando ${selection.category.name}: ${selection.products.length} ${selection.products.length === 1 ? "producto" : "productos"}.` : ""}</p>
      </section>
    </div>
  );
}
