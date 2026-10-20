"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PRODUCTOS } from "@/features/products/data/productsData";

type Category = "todos" | "urnas" | "ataudes" | "relicarios" | "flores";

const categories: { id: Category; label: string; productCategory?: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "urnas", label: "Urnas", productCategory: "Urnas" },
  { id: "ataudes", label: "Ataúdes", productCategory: "Ataúdes" },
  { id: "relicarios", label: "Relicarios", productCategory: "Relicarios" },
  { id: "flores", label: "Arreglos florales", productCategory: "Arreglos florales" },
];

export default function CatalogoView({ initialCategory = "todos" }: { initialCategory?: Category }) {
  const [category, setCategory] = useState<Category>(initialCategory);
  const selected = categories.find((item) => item.id === category);
  const products = selected?.productCategory
    ? PRODUCTOS.filter((product) => product.categoria === selected.productCategory)
    : PRODUCTOS;

  return (
    <main className="shop-page">
      <header className="shop-heading">
        <div className="shop-container">
          <Link className="shop-back-link" href="/">Inicio <ArrowRight size={14} /></Link>
          <h1>Un catálogo para elegir con calma</h1>
          <p>Explora productos funerarios por categoría. Consulta materiales, opciones y precios a tu propio ritmo.</p>
        </div>
      </header>

      <section className="shop-container catalog-section" aria-label="Productos">
        <div className="catalog-toolbar">
          <div className="catalog-tabs" role="group" aria-label="Filtrar por categoría">
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={category === item.id}
                className={category === item.id ? "catalog-tab active" : "catalog-tab"}
                onClick={() => setCategory(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="catalog-count">{products.length} {products.length === 1 ? "producto" : "productos"}</p>
        </div>

        <p className="shop-image-note">Las imágenes actuales son referenciales y pueden diferir del producto.</p>
        {products.length > 0 ? (
          <div className="catalog-grid">
            {products.map((product) => (
              <article className="catalog-card" key={product.id}>
                <Link href={`/catalogo/${product.id}`} aria-label={`Ver ${product.nombre}`}>
                  <div className="catalog-card-image">
                    {product.imagenes?.[0] ? (
                      <Image src={product.imagenes[0]} alt={`Imagen referencial de ${product.nombre}`} fill sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 23vw" />
                    ) : <span>Imagen no disponible</span>}
                  </div>
                  <div className="catalog-card-content">
                    <p>{product.categoria}</p>
                    <h2>{product.nombre}</h2>
                    <div><strong>{product.precio}</strong><ArrowRight size={20} /></div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="catalog-empty"><h2>No hay productos en esta categoría</h2><p>Prueba otra categoría para seguir explorando.</p></div>
        )}
      </section>
    </main>
  );
}
