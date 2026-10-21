"use client";
import { AdminTableSkeleton } from "./AdminLoading";
import { Skeleton } from "@/features/loading/Loading";


import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Archive, PackageOpen, Pencil, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { listAdminCategories, listAdminProducts } from "../data/adminProductRepository";
import type { AdminCategory, AdminProductDraft, ProductStatus } from "../data/adminProducts";
import { useAdminClient } from "./AdminAccessGate";

const statusLabel: Record<ProductStatus, string> = { draft: "Borrador", published: "Publicado", archived: "Archivado" };
export function StatusBadge({ status }: { status: ProductStatus }) {
  return <span className={`admin-status admin-status-${status}`}><span aria-hidden="true" />{statusLabel[status]}</span>;
}

export function AdminProductList() {
  const client = useAdminClient();
  const [products, setProducts] = useState<AdminProductDraft[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  useEffect(() => {
    let active = true;
    Promise.all([listAdminProducts(client), listAdminCategories(client)])
      .then(([loadedProducts, loadedCategories]) => {
        if (!active) return;
        setProducts(loadedProducts); setCategories(loadedCategories); setLoadState("ready");
      })
      .catch(() => { if (active) setLoadState("error"); });
    return () => { active = false; };
  }, [client]);
  const filteredProducts = useMemo(() => products.filter((product) => {
    const query = search.trim().toLocaleLowerCase("es-PE");
    return (!query || `${product.name} ${product.slug}`.toLocaleLowerCase("es-PE").includes(query))
      && (status === "all" || product.status === status)
      && (category === "all" || product.categoryId === category);
  }), [products, search, status, category]);
  return <section className="admin-content" aria-labelledby="admin-page-title">
    <header className="admin-page-heading"><div><p className="admin-path">Catálogo / Productos</p><h1 id="admin-page-title">Productos</h1><p>Revisa las fichas y prepara cada pieza antes de publicarla.</p></div><Button asChild className="admin-primary-button"><Link href="/admin/productos/nuevo"><Plus size={18} /> Crear producto</Link></Button></header>
    <div className="admin-list-section">
      <div className="admin-section-heading"><div><span className="admin-section-rule" /><h2>Inventario de productos</h2></div><p>{loadState === "loading" ? <Skeleton className="loading-price-placeholder" /> : `${products.length} productos`}</p></div>
      <div className="admin-toolbar"><label className="admin-search-field"><Search size={17} aria-hidden="true" /><span className="sr-only">Buscar por nombre o slug</span><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o slug" /></label><div className="admin-filters"><SlidersHorizontal size={17} aria-hidden="true" /><label><span className="sr-only">Filtrar por estado</span><NativeSelect value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos los estados</option><option value="draft">Borradores</option><option value="published">Publicados</option><option value="archived">Archivados</option></NativeSelect></label><label><span className="sr-only">Filtrar por categoría</span><NativeSelect value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">Todas las categorías</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</NativeSelect></label></div></div>
      {loadState === "loading" ? <AdminTableSkeleton /> : loadState === "error" ? <div role="alert">No se pudieron cargar los productos. <button type="button" onClick={() => window.location.reload()}>Reintentar</button></div> : filteredProducts.length ? <div className="admin-product-table" role="table" aria-label="Productos"><div className="admin-table-head" role="row"><span role="columnheader">Producto</span><span role="columnheader">Estado</span><span role="columnheader">Variantes</span><span role="columnheader">Precio desde</span><span role="columnheader">Acciones</span></div>{filteredProducts.map((product) => {
        const prices = product.variants.filter((variant) => variant.isActive).map((variant) => Number(variant.pricePen));
        const fromPrice = prices.length ? Math.min(...prices) : null;
        return <div className="admin-product-row" role="row" key={product.id}><div className="admin-product-identity" role="cell"><span className="admin-product-monogram" aria-hidden="true">{product.name.charAt(0)}</span><div><Link href={`/admin/productos/${product.id}/editar`}>{product.name}</Link><span>{product.category} <span aria-hidden="true">/</span> {product.slug}</span></div></div><div role="cell"><StatusBadge status={product.status} /></div><div className="admin-product-count" role="cell">{product.variants.length} {product.variants.length === 1 ? "opción" : "opciones"}</div><div className="admin-product-price" role="cell">{fromPrice === null ? "Sin precio" : `S/ ${fromPrice.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div><div className="admin-row-actions" role="cell"><Link className="admin-row-link" href={`/admin/productos/${product.id}/editar`} aria-label={`Editar ${product.name}`} title={`Editar ${product.name}`}><Pencil size={17} /></Link>{product.status !== "archived" && <Link className="admin-row-link admin-row-link-archive" href={`/admin/productos/${product.id}/editar?accion=archivar`} aria-label={`Archivar ${product.name}`} title={`Archivar ${product.name}`}><Archive size={17} /></Link>}</div></div>;
      })}</div> : <div className="admin-empty-state"><PackageOpen size={35} strokeWidth={1.4} /><h3>No hay productos con esos filtros</h3><p>Prueba otro nombre, categoría o estado.</p><Button variant="outline" onClick={() => { setSearch(""); setStatus("all"); setCategory("all"); }}>Limpiar filtros</Button></div>}
      {loadState === "ready" && <p className="admin-result-count" aria-live="polite">Mostrando {filteredProducts.length} de {products.length} productos</p>}
    </div>
  </section>;
}
