'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTOS } from "@/features/products/data/productsData";

export default function CatalogoView() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<
    "todos" | "urnas" | "ataudes" | "relicarios" | "flores"
  >("todos");

  const productosFiltrados =
    categoriaSeleccionada === "todos"
      ? PRODUCTOS
      : PRODUCTOS.filter((p) => {
          if (categoriaSeleccionada === "urnas") return p.categoria === "Urnas";
          if (categoriaSeleccionada === "ataudes") return p.categoria === "Ataúdes";
          if (categoriaSeleccionada === "relicarios") return p.categoria === "Relicarios";
          if (categoriaSeleccionada === "flores") return p.categoria === "Arreglos florales";
          return true;
        });

  return (
    <>
      {/* CABECERA */}
      <header className="border-b border-brass/10 py-12 md:py-16 bg-ink-800/30">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <span className="text-xs font-medium text-brass-400 tracking-wider">SELECCIÓN</span>
          <h1 className="font-display font-light text-4xl md:text-5xl mt-2 mb-4">Catálogo de productos</h1>
          <p className="text-bone-400 text-sm md:text-base max-w-2xl leading-relaxed">
            Explora los homenajes disponibles organizados con calma y sobriedad.
          </p>
        </div>
      </header>

      {/* REJILLA */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/10 mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCategoriaSeleccionada("todos")}
              className={`text-xs font-medium px-3.5 py-1.5 rounded transition-colors cursor-pointer ${
                categoriaSeleccionada === "todos"
                  ? "bg-brass/15 text-brass-300 border border-brass/30"
                  : "text-bone-400 hover:text-bone hover:bg-white/5 border border-transparent"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setCategoriaSeleccionada("urnas")}
              className={`text-xs font-medium px-3.5 py-1.5 rounded transition-colors cursor-pointer ${
                categoriaSeleccionada === "urnas"
                  ? "bg-brass/15 text-brass-300 border border-brass/30"
                  : "text-bone-400 hover:text-bone hover:bg-white/5 border border-transparent"
              }`}
            >
              Urnas
            </button>
            <button
              onClick={() => setCategoriaSeleccionada("ataudes")}
              className={`text-xs font-medium px-3.5 py-1.5 rounded transition-colors cursor-pointer ${
                categoriaSeleccionada === "ataudes"
                  ? "bg-brass/15 text-brass-300 border border-brass/30"
                  : "text-bone-400 hover:text-bone hover:bg-white/5 border border-transparent"
              }`}
            >
              Ataúdes
            </button>
            <button
              onClick={() => setCategoriaSeleccionada("relicarios")}
              className={`text-xs font-medium px-3.5 py-1.5 rounded transition-colors cursor-pointer ${
                categoriaSeleccionada === "relicarios"
                  ? "bg-brass/15 text-brass-300 border border-brass/30"
                  : "text-bone-400 hover:text-bone hover:bg-white/5 border border-transparent"
              }`}
            >
              Relicarios
            </button>
            <button
              onClick={() => setCategoriaSeleccionada("flores")}
              className={`text-xs font-medium px-3.5 py-1.5 rounded transition-colors cursor-pointer ${
                categoriaSeleccionada === "flores"
                  ? "bg-brass/15 text-brass-300 border border-brass/30"
                  : "text-bone-400 hover:text-bone hover:bg-white/5 border border-transparent"
              }`}
            >
              Arreglos florales
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-bone-500">
            <span>Ordenar: Relevancia</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {productosFiltrados.map((item) => (
            <Link key={item.id} href={`/catalogo/${item.id}`} className="group block">
              <div className="aspect-4/5 bg-ink-700 rounded-md border border-white/10 group-hover:border-brass/30 group-hover:shadow-glow transition-all flex flex-col items-center justify-center relative p-3 overflow-hidden">
                {item.imagenes?.[0] ? (
                  <Image
                    src={item.imagenes[0]}
                    alt={item.nombre}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                  />
                ) : (
                  <span className="text-bone-500 text-xs">imagen del producto</span>
                )}
              </div>

              <div className="pt-4">
                <p className="text-xs text-bone-500 mb-1">{item.categoria}</p>
                <p className="font-medium text-sm text-bone">{item.nombre}</p>
                <p className="text-brass-300 text-sm mt-1">{item.precio}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
