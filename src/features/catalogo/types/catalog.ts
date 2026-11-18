export type CatalogSearchParams = {
  q?: string | string[];
  categoria?: string | string[];
  pagina?: string | string[];
  orden?: string | string[];
  min?: string | string[];
  max?: string | string[];
};

export type CatalogSort = "relevancia" | "precio-asc" | "precio-desc" | "nombre";

export type CatalogFilters = {
  query: string;
  categorySlug: string | null;
  sort: CatalogSort;
  minPrice: number | null;
  maxPrice: number | null;
  page: number;
  pageSize: number;
};

export type CatalogCategory = {
  id: string;
  slug: string;
  name: string;
};

export type CatalogVariant = {
  id: string;
  name: string;
  pricePen: number;
  availableQuantity: number;
};

export type CatalogImage = {
  id: string;
  src: string;
  alt: string;
  isReference: boolean;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: CatalogCategory;
  variants: CatalogVariant[];
  images: CatalogImage[];
  priceFromPen: number | null;
  hasPriceRange: boolean;
  isAvailable: boolean;
};

export type CatalogPage = {
  products: CatalogProduct[];
  filters: CatalogFilters;
  total: number;
  totalPages: number;
  // True when the database does not yet expose `price_from_pen`: the page was
  // served with the default order and without the requested price range.
  priceFiltersUnavailable: boolean;
};
