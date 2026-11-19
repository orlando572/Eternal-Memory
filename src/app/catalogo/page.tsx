import { Suspense, cache } from "react";
import type { Metadata } from "next";
import CatalogoView from "@/features/catalogo/CatalogoView";
import { CatalogLoading } from "@/features/catalogo/components/CatalogLoading";
import { listCatalogCategories, listCatalogProducts } from "@/features/catalogo/services/catalogService";
import { normalizeCatalogParams } from "@/features/catalogo/lib/catalogParams";
import type { CatalogSearchParams } from "@/features/catalogo/types/catalog";
import { catalogMetadata } from "@/features/seo/seo";

// Metadata and the listing share one categories query per request.
const loadCategories = cache(listCatalogCategories);

export async function generateMetadata({ searchParams }: { searchParams: Promise<CatalogSearchParams> }): Promise<Metadata> {
  const filters = normalizeCatalogParams(await searchParams);
  const categories = filters.categorySlug ? await loadCategories().catch(() => []) : [];
  const category = categories.find((item) => item.slug === filters.categorySlug) ?? null;
  return catalogMetadata(category, filters);
}

async function CatalogResults({ params }: { params: CatalogSearchParams }) {
  const [page, categories] = await Promise.all([listCatalogProducts(params), loadCategories()]);
  return <CatalogoView key={JSON.stringify(page.filters)} page={page} categories={categories} />;
}

export default async function Page({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  const params = await searchParams;
  return (
    <Suspense fallback={<CatalogLoading />}>
      <CatalogResults params={params} />
    </Suspense>
  );
}
