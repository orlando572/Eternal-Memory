import type { CatalogCategory } from "@/features/catalogo/types/catalog";

type HomeContent = {
  kicker: string;
  title: string;
  subtitle: string;
  collection: string;
  heading: string;
  description: string;
  catalogLabel: string;
};

const contentByCategory: Record<string, HomeContent> = {
  urnas: {
    kicker: "Un último homenaje, siempre presente",
    title: "Elegir con calma",
    subtitle: "Urnas para honrar a quienes amamos.",
    collection: "Nuestras urnas",
    heading: "Diseños para cada historia",
    description: "Materiales y formas para conservar su recuerdo. Explora cada urna y conoce sus opciones con calma.",
    catalogLabel: "Ver todas las urnas",
  },
  ataudes: {
    kicker: "Una despedida con respeto",
    title: "Honrar su historia",
    subtitle: "Ataúdes para acompañar un último homenaje.",
    collection: "Nuestros ataúdes",
    heading: "Detalles que acompañan",
    description: "Conoce materiales, acabados y opciones para elegir una despedida que exprese tu cariño.",
    catalogLabel: "Ver todos los ataúdes",
  },
  "arreglos-florales": {
    kicker: "El cariño también florece",
    title: "Expresar el cariño",
    subtitle: "Arreglos florales para acompañar y recordar.",
    collection: "Nuestros arreglos florales",
    heading: "Flores para un homenaje",
    description: "Formas y colores para expresar lo que sientes. Encuentra un arreglo para acompañar su recuerdo.",
    catalogLabel: "Ver todos los arreglos",
  },
  relicarios: {
    kicker: "Un vínculo que permanece",
    title: "Sentir su cercanía",
    subtitle: "Relicarios para llevar contigo un recuerdo especial.",
    collection: "Nuestros relicarios",
    heading: "Recuerdos que acompañan",
    description: "Pequeños detalles con un significado personal. Explora diseños para mantener cerca su memoria.",
    catalogLabel: "Ver todos los relicarios",
  },
};

export function getHomeContent(category?: CatalogCategory): HomeContent {
  if (!category) return contentByCategory.urnas;
  return contentByCategory[category.slug] ?? {
    kicker: "Un homenaje a su memoria",
    title: "Recordar con cariño",
    subtitle: `${category.name} para honrar a quienes amamos.`,
    collection: category.name,
    heading: "Una elección personal",
    description: "Explora los productos de esta categoría y conoce sus detalles y opciones a tu propio ritmo.",
    catalogLabel: "Ver toda la categoría",
  };
}
