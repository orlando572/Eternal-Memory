import { Suspense, cache } from "react";
import HomeView from "@/features/home/HomeView";
import { HomeBanner } from "@/features/home/HomeBanner";
import { HomeHowItWorks } from "@/features/home/HomeHowItWorks";
import { HomeSupport } from "@/features/home/HomeSupport";
import { HomeFeaturedCategories } from "@/features/home/HomeFeaturedCategories";
import { HomeFaq } from "@/features/home/HomeFaq";
import { HomeContact } from "@/features/home/HomeContact";
import { listCatalogCategories, listHomeCatalogProducts } from "@/features/catalogo/services/catalogService";
import "@/features/home/home.css";

// La rejilla y las categorías destacadas comparten una sola consulta por petición.
const loadCategories = cache(listCatalogCategories);

async function loadHomeCatalog() {
  try {
    const categories = await loadCategories();
    const selections = await Promise.all(categories.map(async (category) => {
      try {
        const products = await listHomeCatalogProducts(category.slug, 4);
        return { category, products, failed: false };
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

async function HomeCategories() {
  const categories = await loadCategories().catch(() => []);
  return <HomeFeaturedCategories categories={categories} />;
}

export default function HomePage() {
  return (
    <main className="home-page">
      <Suspense fallback={<HomeView selections={[]} loading />}>
        <HomeCatalog />
      </Suspense>
      <HomeBanner />
      <HomeHowItWorks />
      <HomeSupport />
      <Suspense fallback={<HomeFeaturedCategories categories={[]} loading />}>
        <HomeCategories />
      </Suspense>
      <HomeFaq />
      <HomeContact />
    </main>
  );
}
