import { Suspense } from "react";
import CatalogoView from "@/features/catalogo/CatalogoView";
import { CatalogLoading } from "@/features/catalogo/components/CatalogLoading";
import { listCatalogCategories, listCatalogProducts } from "@/features/catalogo/services/catalogService";
import type { CatalogSearchParams } from "@/features/catalogo/types/catalog";

async function CatalogResults({ params }: { params: CatalogSearchParams }) {
  const [page, categories] = await Promise.all([listCatalogProducts(params), listCatalogCategories()]);
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
