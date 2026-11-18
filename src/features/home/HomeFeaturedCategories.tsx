import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/features/loading/Loading";
import { getCatalogBackground } from "@/features/catalogo/lib/catalogBackground";
import { catalogHref } from "@/features/catalogo/lib/catalogPresentation";
import type { CatalogCategory } from "@/features/catalogo/types/catalog";
import { getHomeContent, homeFeaturedCategories } from "@/features/home/homeContent";
import { HomeCategoryIcon } from "@/features/home/HomeCategoryIcon";
import { HomeSectionIntro } from "@/features/home/HomeSectionIntro";

type HomeFeaturedCategoriesProps = {
  categories: CatalogCategory[];
  loading?: boolean;
};

export function HomeFeaturedCategories({ categories, loading = false }: HomeFeaturedCategoriesProps) {
  const { kicker, title, intro, cardAction, allLabel, emptyText } = homeFeaturedCategories;
  return (
    <section className="home-section home-featured" aria-labelledby="home-featured-title" aria-busy={loading}>
      <HomeSectionIntro id="home-featured-title" kicker={kicker} title={title} intro={intro} />
      {loading ? (
        <div className="home-featured-list" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => <Skeleton className="home-featured-skeleton" key={index} />)}
        </div>
      ) : categories.length > 0 ? (
        <ul className="home-featured-list">
          {categories.map((category) => (
            <li key={category.id}>
              <Link className="home-featured-card"
                href={catalogHref({ query: "", categorySlug: category.slug, page: 1 })}
                aria-label={`${category.name}, ${cardAction.toLowerCase()}`}>
                <div className="home-featured-image">
                  <Image src={getCatalogBackground(category.slug)} alt="" fill
                    sizes="(max-width: 600px) 90vw, (max-width: 900px) 45vw, 23vw" />
                </div>
                <div className="home-featured-body">
                  <h3><HomeCategoryIcon categorySlug={category.slug} />{category.name}</h3>
                  <p>{getHomeContent(category).subtitle}</p>
                  <span className="home-featured-action">{cardAction} <ArrowRight size={17} aria-hidden="true" /></span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="home-featured-empty">{emptyText}</p>
      )}
      <Link className="home-featured-all" href="/catalogo">{allLabel} <ArrowRight size={18} aria-hidden="true" /></Link>
    </section>
  );
}
