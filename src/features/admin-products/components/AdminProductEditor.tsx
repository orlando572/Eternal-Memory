"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLoading } from "./AdminLoading";
import { useAdminClient } from "./AdminAccessGate";
import { ProductForm } from "./ProductForm";
import { getAdminProduct, listAdminCategories } from "../data/adminProductRepository";
import { createEmptyProduct, type AdminCategory, type AdminProductDraft } from "../data/adminProducts";

export function AdminProductEditor({ id, archive = false }: { id?: string; archive?: boolean }) {
  const client = useAdminClient();
  const [product, setProduct] = useState<AdminProductDraft | null>(id ? null : createEmptyProduct());
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  useEffect(() => {
    let active = true;
    Promise.all([listAdminCategories(client), id ? getAdminProduct(client, id) : Promise.resolve(createEmptyProduct())])
      .then(([loadedCategories, loadedProduct]) => {
        if (!active) return;
        setCategories(loadedCategories);
        if (!loadedProduct) { setState("missing"); return; }
        setProduct(loadedProduct); setState("ready");
      })
      .catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, [client, id]);
  if (state === "loading") return <AdminLoading editor />;
  if (state !== "ready" || !product) return <section className="admin-content admin-access-state" role="alert">
    <h1>{state === "missing" ? "Producto no encontrado" : "No se pudo cargar el producto"}</h1>
    <Link href="/admin/productos">Volver a productos</Link>
    {state === "error" && <button type="button" onClick={() => window.location.reload()}>Reintentar</button>}
  </section>;
  return <ProductForm key={product.id || "new"} initialProduct={product} categories={categories} isNew={!id} startArchiveConfirmation={archive} />;
}
