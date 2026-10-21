import { Suspense } from "react";
import HomeView from "@/features/home/HomeView";
import { listCatalogCategories, listCatalogProducts } from "@/features/catalogo/services/catalogService";
import "@/features/home/home.css";

async function loadHomeCatalog() {
  try {
    const categories = await listCatalogCategories();
    const selections = await Promise.all(categories.map(async (category) => {
      try {
        const page = await listCatalogProducts({ categoria: category.slug });
        return { category, products: page.products.slice(0, 4), failed: false };
      } catch {
        return { category, products: [], failed: true };
      }
    }));
    return { selections, failed: false };
  } catch {
    return { selections: [], failed: true };
  }
}

async function HomeCatalog() {
  const data = await loadHomeCatalog();
  return <HomeView {...data} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeView selections={[]} loading />}>
      <HomeCatalog />
    </Suspense>
  );
}
