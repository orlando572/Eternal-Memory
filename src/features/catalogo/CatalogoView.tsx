"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { LoadingButton } from "@/features/loading/LoadingButton";
import { LoadingIndicator } from "@/features/loading/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductImage } from "@/features/products/components/ProductImage";
import { HomeCategoryIcon } from "@/features/home/HomeCategoryIcon";
import { ClearFiltersIcon } from "./components/ClearFiltersIcon";
import { catalogHref, formatCatalogPrice } from "@/features/catalogo/lib/catalogPresentation";
import type { CatalogCategory, CatalogFilters, CatalogPage } from "@/features/catalogo/types/catalog";

export default function CatalogoView({ page, categories }: { page: CatalogPage; categories: CatalogCategory[] }) {
  const { products, filters, total, totalPages } = page;
  const [query, setQuery] = useState(filters.query);
  const [pending, startTransition] = useTransition();
  const [pendingTarget, setPendingTarget] = useState("");
  const router = useRouter();
  const hasFilters = Boolean(filters.query || filters.categorySlug);
  const outOfRange = filters.page > 1 && products.length === 0;

  function navigate(next: Partial<CatalogFilters>, target?: string) {
    setPendingTarget(target ?? (next.categorySlug !== undefined ? `category-${next.categorySlug}` : next.query !== undefined ? "search" : `page-${next.page}`));
    startTransition(() => router.push(catalogHref({ ...filters, ...next }), { scroll: false }));
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate({ query: query.trim().slice(0, 100), page: 1 });
  }

  return (
    <main className="shop-page">
      <header className="shop-heading">
        <div className="shop-container">
          <Link className="shop-back-link" href="/">Inicio <ArrowRight size={14} /></Link>
          <h1>Un catálogo para elegir con calma</h1>
          <p>Explora productos funerarios por categoría. Consulta materiales, opciones y precios a tu propio ritmo.</p>
        </div>
      </header>
      <section className="shop-container catalog-section" aria-label="Productos" aria-busy={pending}>
        <form className="catalog-search" role="search" onSubmit={search}>
          <div>
            <label htmlFor="catalog-query">Buscar productos</label>
            <Input id="catalog-query" type="search" value={query} maxLength={100} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre del producto" />
          </div>
          <LoadingButton type="submit" busy={pending && pendingTarget === "search"} disabled={pending}><Search size={17} aria-hidden="true" /> Buscar</LoadingButton>
          {hasFilters && <LoadingButton busy={pending && pendingTarget === "clear"} variant="outline" type="button" disabled={pending} onClick={() => navigate({ query: "", categorySlug: null, page: 1 }, "clear")}><ClearFiltersIcon />Limpiar filtros</LoadingButton>}
        </form>
        <div className="catalog-toolbar">
          <div className="catalog-tabs" role="group" aria-label="Filtrar por categoría">
            {[{ id: "all", slug: null, name: "Todos" }, ...categories].map((category) => (
              <LoadingButton busy={pending && pendingTarget === `category-${category.slug}`} key={category.id} variant="outline" type="button" disabled={pending}
                aria-pressed={filters.categorySlug === category.slug}
                className={filters.categorySlug === category.slug ? "catalog-tab active" : "catalog-tab"}
                onClick={() => navigate({ categorySlug: category.slug, page: 1 })}>
                <HomeCategoryIcon categorySlug={category.slug ?? "all"} />
                {category.name}
              </LoadingButton>
            ))}
          </div>
          <p className="catalog-count" aria-live="polite">{total} {total === 1 ? "producto" : "productos"}</p>
        </div>
        <p className="catalog-navigation-status" role="status">{pending ? <LoadingIndicator label="Actualizando catálogo" /> : filters.query ? `Resultados para «${filters.query}»` : ""}</p>
        <p className="shop-image-note">Las imágenes marcadas como referenciales pueden diferir del producto.</p>
        {products.length ? (
          <div className={pending ? "catalog-grid catalog-results-pending" : "catalog-grid"}>
            {products.map((product) => (
              <article className="catalog-card" key={product.id}>
                <Link href={`/catalogo/${product.slug}`} aria-label={`Ver ${product.name}`}>
                  <div className="catalog-card-image">
                    <ProductImage src={product.images[0]?.src} alt={product.images[0]?.alt || `${product.images[0]?.isReference ? "Imagen referencial de " : ""}${product.name}`} sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 23vw" />
                  </div>
                  <div className="catalog-card-content">
                    <p>{product.category.name}</p>
                    <h2>{product.name}</h2>
                    <div><strong>{product.priceFromPen === null ? "Sin opciones disponibles" : `${product.hasPriceRange ? "Desde " : ""}${formatCatalogPrice(product.priceFromPen)}`}</strong><ArrowRight size={20} aria-hidden="true" /></div>
                    <p className="catalog-availability">{product.isAvailable ? "Disponible" : "Agotado"}{product.images[0]?.isReference ? " · Imagen referencial" : ""}</p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <h2>{outOfRange ? "No hay productos en esta página" : hasFilters ? "No encontramos coincidencias" : "Aún no hay productos publicados"}</h2>
            <p>{outOfRange ? "Vuelve a la primera página para consultar los resultados." : hasFilters ? "Prueba otro nombre o limpia los filtros para seguir explorando." : "Cuando haya productos publicados, podrás consultarlos aquí."}</p>
            {(outOfRange || hasFilters) && <div className="catalog-state-actions"><Button variant="outline" disabled={pending} onClick={() => navigate(outOfRange ? { page: 1 } : { query: "", categorySlug: null, page: 1 })}>{outOfRange ? "Volver a la primera página" : "Ver todo el catálogo"}</Button></div>}
          </div>
        )}
        {totalPages > 1 && products.length > 0 && (
          <nav className="catalog-pagination" aria-label="Páginas del catálogo">
            <LoadingButton busy={pending && pendingTarget === `page-${filters.page - 1}`} variant="outline" disabled={pending || filters.page <= 1} onClick={() => navigate({ page: filters.page - 1 })}><ArrowLeft size={16} aria-hidden="true" /> Anterior</LoadingButton>
            <span aria-current="page">Página {filters.page} de {totalPages}</span>
            <LoadingButton busy={pending && pendingTarget === `page-${filters.page + 1}`} variant="outline" disabled={pending || filters.page >= totalPages} onClick={() => navigate({ page: filters.page + 1 })}>Siguiente <ArrowRight size={16} aria-hidden="true" /></LoadingButton>
          </nav>
        )}
      </section>
    </main>
  );
}
