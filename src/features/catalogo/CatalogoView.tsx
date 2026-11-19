"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { LoadingButton } from "@/features/loading/LoadingButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HomeCategoryIcon } from "@/features/home/HomeCategoryIcon";
import { ClearFiltersIcon } from "./components/ClearFiltersIcon";
import { CatalogProductCard } from "./components/CatalogProductCard";
import { CatalogRefine } from "./components/CatalogRefine";
import { catalogHref, describeCatalogFilters } from "@/features/catalogo/lib/catalogPresentation";
import { getCatalogBackground } from "@/features/catalogo/lib/catalogBackground";
import type { CatalogCategory, CatalogFilters, CatalogPage } from "@/features/catalogo/types/catalog";
import "./catalogo.css";

// "Limpiar filtros" removes what narrows the results (search, category and
// price range) and keeps the chosen order, which never hides products.
const CLEARED_FILTERS: Partial<CatalogFilters> = { query: "", categorySlug: null, minPrice: null, maxPrice: null, page: 1 };

export default function CatalogoView({ page, categories }: { page: CatalogPage; categories: CatalogCategory[] }) {
  const { products, filters, total, totalPages, priceFiltersUnavailable } = page;
  const [query, setQuery] = useState(filters.query);
  const [pending, startTransition] = useTransition();
  const [pendingTarget, setPendingTarget] = useState("");
  const router = useRouter();
  const hasFilters = Boolean(filters.query || filters.categorySlug) || filters.minPrice !== null || filters.maxPrice !== null;
  const filterSummary = describeCatalogFilters(filters);
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
      <header className="shop-heading catalog-heading" style={{ backgroundImage: `url("${getCatalogBackground(filters.categorySlug)}")`, backgroundPosition: "right center" }}>
        <div className="shop-container">
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
        </form>
        <CatalogRefine filters={filters} pending={pending} busyTarget={pendingTarget}
          onSortChange={(sort) => navigate({ sort, page: 1 }, "sort")}
          onPriceApply={(range) => navigate({ ...range, page: 1 }, "price")} />
        {priceFiltersUnavailable && <p className="catalog-price-notice" role="status">Por ahora no podemos ordenar ni filtrar por precio. Te mostramos el catálogo en su orden habitual.</p>}
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
          <p className="catalog-count" aria-live="polite">{total} {total === 1 ? "producto" : "productos"}{hasFilters ? (total === 1 ? " encontrado" : " encontrados") : ""}</p>
        </div>
        {hasFilters && (
          <div className="catalog-active-filters">
            <p className="catalog-navigation-status" role="status">{pending ? "" : filterSummary}</p>
            <LoadingButton busy={pending && pendingTarget === "clear"} variant="outline" type="button" disabled={pending} onClick={() => navigate(CLEARED_FILTERS, "clear")}><ClearFiltersIcon />Limpiar filtros</LoadingButton>
          </div>
        )}
        {products.length ? (
          <div className={pending ? "catalog-grid catalog-results-pending" : "catalog-grid"}>
            {products.map((product) => <CatalogProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="catalog-empty">
            <h2>{outOfRange ? "No hay productos en esta página" : hasFilters ? "No encontramos coincidencias" : "Aún no hay productos publicados"}</h2>
            <p>{outOfRange ? "Vuelve a la primera página para consultar los resultados." : hasFilters ? "Prueba otro nombre u otro rango de precio, o limpia los filtros para seguir explorando." : "Cuando haya productos publicados, podrás consultarlos aquí."}</p>
            {(outOfRange || hasFilters) && <div className="catalog-state-actions"><Button variant="outline" disabled={pending} onClick={() => navigate(outOfRange ? { page: 1 } : CLEARED_FILTERS, outOfRange ? "page-1" : "clear")}>{outOfRange ? "Volver a la primera página" : "Ver todo el catálogo"}</Button></div>}
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
