"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const categories = [
  { slug: null, name: "Todo el catálogo", href: "/catalogo" },
  { slug: "urnas", name: "Urnas", href: "/catalogo?categoria=urnas" },
  { slug: "ataudes", name: "Ataúdes", href: "/catalogo?categoria=ataudes" },
  { slug: "arreglos-florales", name: "Arreglos florales", href: "/catalogo?categoria=arreglos-florales" },
  { slug: "relicarios", name: "Relicarios", href: "/catalogo?categoria=relicarios" },
];

function CategoryLinks({ currentHref }: { currentHref?: string }) {
  return (
    <ul>
      {categories.map(({ href, name }) => (
        <li key={href}><Link href={href} aria-current={href === currentHref ? "page" : undefined}>{name}</Link></li>
      ))}
    </ul>
  );
}

function CurrentCategoryLinks() {
  const pathname = usePathname();
  const params = useSearchParams();
  const slug = params.get("categoria");
  const currentHref = pathname === "/catalogo"
    ? categories.find((category) => category.slug === (slug === "flores" ? "arreglos-florales" : slug))?.href
    : undefined;
  return <CategoryLinks currentHref={currentHref} />;
}

export function HeaderCategories() {
  return (
    <nav className="header-categories" aria-label="Categorías del catálogo">
      <Suspense fallback={<CategoryLinks />}><CurrentCategoryLinks /></Suspense>
    </nav>
  );
}
