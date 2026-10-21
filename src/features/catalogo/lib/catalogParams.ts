import type { CatalogFilters, CatalogSearchParams } from "@/features/catalogo/types/catalog";

export const CATALOG_PAGE_SIZE = 12;
export const CATALOG_MAX_PAGE = 100_000;
const INVALID_CATEGORY = "__invalid__";

function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function normalizeCatalogParams(params: CatalogSearchParams = {}): CatalogFilters {
  const query = firstValue(params.q).replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 100).trim();
  const rawCategory = firstValue(params.categoria).toLowerCase();
  const category = rawCategory === "flores" ? "arreglos-florales" : rawCategory;
  const categorySlug = !category || category === "todos"
    ? null
    : category.length <= 100 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(category)
      ? category
      : INVALID_CATEGORY;
  const rawPage = firstValue(params.pagina);
  const pageNumber = /^\d{1,6}$/.test(rawPage) ? Number(rawPage) : 1;
  const page = pageNumber >= 1 && pageNumber <= CATALOG_MAX_PAGE ? pageNumber : 1;

  return { query, categorySlug, page, pageSize: CATALOG_PAGE_SIZE };
}

export function readCatalogSearchParams(params: URLSearchParams): CatalogSearchParams {
  return {
    q: params.get("q") ?? undefined,
    categoria: params.get("categoria") ?? undefined,
    pagina: params.get("pagina") ?? undefined,
  };
}

export function escapeCatalogSearch(query: string): string {
  // An escaped regex performs a literal substring search without LIKE's
  // %, _ and PostgREST * wildcard aliases changing the user's search.
  return query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isCatalogSlug(value: string): boolean {
  return value.length <= 200 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);
}
