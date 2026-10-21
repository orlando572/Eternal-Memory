const backgrounds: Record<string, string> = {
  urnas: "/assets/catalogo/backgrounds/urnas.webp",
  ataudes: "/assets/catalogo/backgrounds/ataudes.webp",
  "arreglos-florales": "/assets/catalogo/backgrounds/arreglos-florales.webp",
  relicarios: "/assets/catalogo/backgrounds/relicarios.webp",
};

export function getCatalogBackground(categorySlug: string | null): string {
  return categorySlug && Object.hasOwn(backgrounds, categorySlug)
    ? backgrounds[categorySlug]
    : "/assets/catalogo/backgrounds/todos.webp";
}
