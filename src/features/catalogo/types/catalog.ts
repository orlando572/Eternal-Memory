export type CatalogSearchParams = {
  q?: string | string[];
  categoria?: string | string[];
  pagina?: string | string[];
};

export type CatalogFilters = {
  query: string;
  categorySlug: string | null;
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
};
