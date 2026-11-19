const backgrounds: Record<string, string> = {
  urnas: "/assets/banners/categoria-urnas.webp",
  ataudes: "/assets/banners/categoria-ataudes.webp",
  "arreglos-florales": "/assets/banners/categoria-arreglos-florales.webp",
  relicarios: "/assets/banners/categoria-relicarios.webp",
};

export function getCatalogBackground(categorySlug: string | null): string {
  return categorySlug && Object.hasOwn(backgrounds, categorySlug)
    ? backgrounds[categorySlug]
    : "/assets/catalogo/backgrounds/todos.webp";
}
