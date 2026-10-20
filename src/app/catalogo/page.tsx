import CatalogoView from "@/features/catalogo/CatalogoView";

type Category = "todos" | "urnas" | "ataudes" | "relicarios" | "flores";

export default async function Page({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const initialCategory: Category =
    categoria === "urnas" || categoria === "ataudes" || categoria === "relicarios" || categoria === "flores"
      ? categoria
      : "todos";

  return <CatalogoView key={initialCategory} initialCategory={initialCategory} />;
}
