import type { CatalogFilters } from "@/features/catalogo/types/catalog";

export function formatCatalogPrice(price: number): string {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(price);
}

export function catalogHref(filters: Pick<CatalogFilters, "query" | "categorySlug" | "page">): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.categorySlug) params.set("categoria", filters.categorySlug);
  if (filters.page > 1) params.set("pagina", String(filters.page));
  return `/catalogo${params.size ? `?${params}` : ""}`;
}
