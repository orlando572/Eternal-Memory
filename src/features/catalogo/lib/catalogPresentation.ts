import type { CatalogFilters } from "@/features/catalogo/types/catalog";

type CatalogLinkFilters = Pick<CatalogFilters, "query" | "categorySlug" | "page"> &
  Partial<Pick<CatalogFilters, "sort" | "minPrice" | "maxPrice">>;

export function formatCatalogPrice(price: number): string {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(price);
}

export function catalogHref(filters: CatalogLinkFilters): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.categorySlug) params.set("categoria", filters.categorySlug);
  if (filters.sort && filters.sort !== "relevancia") params.set("orden", filters.sort);
  if (filters.minPrice !== undefined && filters.minPrice !== null) params.set("min", String(filters.minPrice));
  if (filters.maxPrice !== undefined && filters.maxPrice !== null) params.set("max", String(filters.maxPrice));
  if (filters.page > 1) params.set("pagina", String(filters.page));
  return `/catalogo${params.size ? `?${params}` : ""}`;
}

// Describes the active search and price range for the results summary.
export function describeCatalogFilters(filters: Pick<CatalogFilters, "query" | "minPrice" | "maxPrice">): string {
  const parts: string[] = [];
  if (filters.query) parts.push(`para «${filters.query}»`);
  if (filters.minPrice !== null && filters.maxPrice !== null) {
    parts.push(`entre ${formatCatalogPrice(filters.minPrice)} y ${formatCatalogPrice(filters.maxPrice)}`);
  } else if (filters.minPrice !== null) {
    parts.push(`desde ${formatCatalogPrice(filters.minPrice)}`);
  } else if (filters.maxPrice !== null) {
    parts.push(`hasta ${formatCatalogPrice(filters.maxPrice)}`);
  }
  return parts.length ? `Resultados ${parts.join(" ")}` : "";
}
