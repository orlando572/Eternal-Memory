import "server-only";

import { createCatalogClient } from "@/lib/supabase/catalog";
import { escapeCatalogSearch, isCatalogSlug, normalizeCatalogParams } from "@/features/catalogo/lib/catalogParams";
import type { CatalogCategory, CatalogFilters, CatalogPage, CatalogProduct, CatalogSearchParams } from "@/features/catalogo/types/catalog";

type CatalogClient = ReturnType<typeof createCatalogClient>;
type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  categories: CatalogCategory;
  product_variants: {
    id: string;
    name: string;
    price_pen: number;
    stock_on_hand: number;
    stock_reserved: number;
    sort_order: number;
  }[];
  product_images: {
    id: string;
    external_url: string | null;
    storage_path: string | null;
    alt_text: string | null;
    is_reference: boolean;
    sort_order: number;
  }[];
};

const PRODUCT_SELECT = `
  id,slug,name,description,
  categories!inner(id,slug,name),
  product_variants(id,name,price_pen,stock_on_hand,stock_reserved,sort_order),
  product_images(id,external_url,storage_path,alt_text,is_reference,sort_order)
`;

export class CatalogUnavailableError extends Error {
  constructor() {
    super("El catálogo no está disponible en este momento. Inténtalo de nuevo.");
    this.name = "CatalogUnavailableError";
  }
}

function publicProducts(client: CatalogClient, filters?: CatalogFilters, head = false) {
  let request = client.from("products")
    .select(PRODUCT_SELECT, { count: "exact", head })
    .eq("status", "published")
    .eq("categories.is_active", true)
    // Left embedding preserves published products without active variants.
    .eq("product_variants.is_active", true);

  if (filters?.categorySlug) request = request.eq("categories.slug", filters.categorySlug);
  if (filters?.query) request = request.regexIMatch("name", escapeCatalogSearch(filters.query));
  return request;
}

function comparePosition(a: { sort_order: number; id: string }, b: { sort_order: number; id: string }) {
  return a.sort_order - b.sort_order || a.id.localeCompare(b.id);
}

function mapProduct(row: ProductRow, client: CatalogClient): CatalogProduct {
  const variants = [...row.product_variants].sort(comparePosition).map((variant) => {
    const pricePen = Number(variant.price_pen);
    if (!Number.isFinite(pricePen) || pricePen < 0 ||
      !Number.isSafeInteger(variant.stock_on_hand) || !Number.isSafeInteger(variant.stock_reserved)) {
      throw new CatalogUnavailableError();
    }
    return {
      id: variant.id,
      name: variant.name,
      pricePen,
      availableQuantity: Math.max(0, variant.stock_on_hand - variant.stock_reserved),
    };
  });
  const prices = variants.map((variant) => variant.pricePen);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    category: row.categories,
    variants,
    images: [...row.product_images].sort(comparePosition).flatMap((image) => {
      const src = image.external_url ?? (image.storage_path
        ? client.storage.from("product-images").getPublicUrl(image.storage_path).data.publicUrl
        : null);
      return src ? [{ id: image.id, src, alt: image.alt_text ?? row.name, isReference: image.is_reference }] : [];
    }),
    priceFromPen: prices.length ? Math.min(...prices) : null,
    hasPriceRange: new Set(prices).size > 1,
    isAvailable: variants.some((variant) => variant.availableQuantity > 0),
  };
}

async function readCatalog<T>(operation: (client: CatalogClient) => Promise<T>): Promise<T> {
  try {
    return await operation(createCatalogClient());
  } catch {
    // Never forward connection details, SQL errors or credentials to callers.
    throw new CatalogUnavailableError();
  }
}

export async function listCatalogCategories(): Promise<CatalogCategory[]> {
  return readCatalog(async (client) => {
    const { data, error } = await client.from("categories").select("id,slug,name")
      .eq("is_active", true).order("sort_order").order("id");
    if (error || !data) throw new CatalogUnavailableError();
    return data;
  });
}

export async function listCatalogProducts(params: CatalogSearchParams = {}): Promise<CatalogPage> {
  const filters = normalizeCatalogParams(params);
  return readCatalog(async (client) => {
    const start = (filters.page - 1) * filters.pageSize;
    const { data, error, count } = await publicProducts(client, filters)
      .order("name").order("id").range(start, start + filters.pageSize - 1);

    // PostgREST may reject a range beyond the last row. Confirm the total using
    // identical filters before returning an empty page instead of a server error.
    if (error?.code === "PGRST103") {
      const totalResult = await publicProducts(client, filters, true);
      if (totalResult.error || totalResult.count === null || start < totalResult.count) {
        throw new CatalogUnavailableError();
      }
      return { products: [], filters, total: totalResult.count, totalPages: Math.ceil(totalResult.count / filters.pageSize) };
    }
    if (error || data === null || count === null) throw new CatalogUnavailableError();
    return {
      products: (data as unknown as ProductRow[]).map((row) => mapProduct(row, client)),
      filters,
      total: count,
      totalPages: Math.ceil(count / filters.pageSize),
    };
  });
}

export async function getCatalogProduct(slug: string): Promise<CatalogProduct | null> {
  if (!isCatalogSlug(slug)) return null;
  return readCatalog(async (client) => {
    const { data, error } = await publicProducts(client).eq("slug", slug).maybeSingle();
    if (error) throw new CatalogUnavailableError();
    return data ? mapProduct(data as unknown as ProductRow, client) : null;
  });
}
