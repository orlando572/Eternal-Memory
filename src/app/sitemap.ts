import type { MetadataRoute } from "next";
import { listCatalogCategories, listCatalogSitemapProducts } from "@/features/catalogo/services/catalogService";
import { getSiteUrl, sitemapEntries } from "@/features/seo/seo";

// Read on each request so newly published products appear without a rebuild.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    listCatalogCategories().catch(() => []),
    listCatalogSitemapProducts().catch(() => []),
  ]);
  return sitemapEntries(getSiteUrl(), categories, products);
}
