import type { CatalogFilters, CatalogSearchParams, CatalogSort } from "@/features/catalogo/types/catalog";

export const CATALOG_PAGE_SIZE = 12;
export const CATALOG_MAX_PAGE = 100_000;
export const CATALOG_DEFAULT_SORT: CatalogSort = "relevancia";
export const CATALOG_SORT_OPTIONS: readonly { value: CatalogSort; label: string }[] = [
  { value: "relevancia", label: "Relevancia" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre", label: "Nombre (A-Z)" },
];
const INVALID_CATEGORY = "__invalid__";

function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function isCatalogSort(value: string): value is CatalogSort {
  return CATALOG_SORT_OPTIONS.some((option) => option.value === value);
}

export function usesCatalogPrice(filters: Pick<CatalogFilters, "sort" | "minPrice" | "maxPrice">): boolean {
  return filters.sort === "precio-asc" || filters.sort === "precio-desc" ||
    filters.minPrice !== null || filters.maxPrice !== null;
}

// Whole soles or up to two decimals with a dot ("150", "150.5", "150.50").
// Negatives, signs, thousands separators, exponents and empty values are null.
export function parseCatalogPrice(value: string | string[] | undefined): number | null {
  const raw = firstValue(value);
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(raw)) return null;
  const price = Number(raw);
  return Number.isFinite(price) ? price : null;
}

// An inverted range is ambiguous, so both limits return to "no limit".
export function normalizeCatalogPriceRange(rawMin: string | string[] | undefined, rawMax: string | string[] | undefined) {
  const minPrice = parseCatalogPrice(rawMin);
  const maxPrice = parseCatalogPrice(rawMax);
  return minPrice !== null && maxPrice !== null && minPrice > maxPrice
    ? { minPrice: null, maxPrice: null }
    : { minPrice, maxPrice };
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
  const rawSort = firstValue(params.orden).toLowerCase();
  const sort = isCatalogSort(rawSort) ? rawSort : CATALOG_DEFAULT_SORT;
  const { minPrice, maxPrice } = normalizeCatalogPriceRange(params.min, params.max);
  const rawPage = firstValue(params.pagina);
  const pageNumber = /^\d{1,6}$/.test(rawPage) ? Number(rawPage) : 1;
  const page = pageNumber >= 1 && pageNumber <= CATALOG_MAX_PAGE ? pageNumber : 1;

  return { query, categorySlug, sort, minPrice, maxPrice, page, pageSize: CATALOG_PAGE_SIZE };
}

export function readCatalogSearchParams(params: URLSearchParams): CatalogSearchParams {
  return {
    q: params.get("q") ?? undefined,
    categoria: params.get("categoria") ?? undefined,
    orden: params.get("orden") ?? undefined,
    min: params.get("min") ?? undefined,
    max: params.get("max") ?? undefined,
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
