import type { Metadata, MetadataRoute } from "next";
import type { CatalogCategory, CatalogFilters, CatalogProduct } from "@/features/catalogo/types/catalog";

export const SITE_NAME = "Eternal Memory";
export const SITE_TITLE = "Eternal Memory — Productos funerarios";
export const SITE_DESCRIPTION = "Un catálogo de productos funerarios para elegir con calma.";
export const SITE_LOCALE = "es_PE";
const LOCAL_SITE_URL = "http://localhost:3000";
const DESCRIPTION_LIMIT = 160;

// Pages a search engine has no reason to visit: accounts, checkout and internals.
export const PRIVATE_PATHS = [
  "/admin", "/api", "/auth", "/checkout", "/perfil", "/login", "/registro",
  "/recuperar-contrasena", "/restablecer-contrasena",
];

// Absolute URLs (canonical, Open Graph, sitemap) need the public origin. Without
// a valid NEXT_PUBLIC_SITE_URL they point to the local development server.
export function getSiteUrl(value: string | undefined = process.env.NEXT_PUBLIC_SITE_URL): string {
  try {
    const url = new URL(value?.trim() ?? "");
    if (url.protocol !== "http:" && url.protocol !== "https:") return LOCAL_SITE_URL;
    return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
  } catch {
    return LOCAL_SITE_URL;
  }
}

// Collapses whitespace and cuts long text at a word boundary for meta tags.
export function metaDescription(text: string, fallback: string): string {
  const clean = text.replace(/\s+/g, " ").trim() || fallback;
  if (clean.length <= DESCRIPTION_LIMIT) return clean;
  const cut = clean.slice(0, DESCRIPTION_LIMIT - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:]+$/, "")}…`;
}

// Páginas comerciales con contenido propio (TSK-20).
export const STATIC_PAGES = ["/nosotros", "/contacto", "/envios", "/privacidad", "/terminos"] as const;

export function productPath(slug: string): string {
  return `/catalogo/${slug}`;
}

export function categoryPath(slug: string): string {
  return `/catalogo?categoria=${encodeURIComponent(slug)}`;
}

export function productMetadata(product: Pick<CatalogProduct, "slug" | "name" | "description" | "category" | "images">): Metadata {
  const description = metaDescription(product.description, `${product.name} en la categoría ${product.category.name} de ${SITE_NAME}.`);
  const image = product.images[0];
  return {
    title: product.name,
    description,
    alternates: { canonical: productPath(product.slug) },
    // A page-level openGraph replaces the layout's one, including the default
    // image, so it is only defined when the product has its own picture.
    ...(image ? {
      openGraph: {
        type: "website",
        siteName: SITE_NAME,
        locale: SITE_LOCALE,
        url: productPath(product.slug),
        title: product.name,
        description,
        images: [{ url: image.src, alt: image.alt || product.name }],
      },
    } : {}),
  };
}

export function catalogMetadata(category: CatalogCategory | null, filters: Pick<CatalogFilters, "query" | "minPrice" | "maxPrice">): Metadata {
  const filtered = Boolean(filters.query) || filters.minPrice !== null || filters.maxPrice !== null;
  return {
    title: category ? category.name : "Catálogo",
    description: category
      ? `${category.name} en el catálogo de ${SITE_NAME}: compara opciones y precios para elegir con calma.`
      : `Catálogo de ${SITE_NAME}: urnas, ataúdes, relicarios y arreglos florales para elegir con calma.`,
    alternates: { canonical: category ? categoryPath(category.slug) : "/catalogo" },
    // Searches and price ranges are endless variations of the same listing.
    ...(filtered ? { robots: { index: false, follow: true } } : {}),
  };
}

export function sitemapEntries(
  siteUrl: string,
  categories: Pick<CatalogCategory, "slug">[],
  products: { slug: string; updatedAt: string | null }[],
): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/catalogo`, changeFrequency: "daily", priority: 0.9 },
    ...categories.map((category) => ({ url: `${siteUrl}${categoryPath(category.slug)}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...STATIC_PAGES.map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...products.map((product) => ({
      url: `${siteUrl}${productPath(product.slug)}`,
      ...(product.updatedAt ? { lastModified: product.updatedAt } : {}),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

export function robotsRules(siteUrl: string): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
