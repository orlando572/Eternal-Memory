export function CatalogLoading({ detail = false }: { detail?: boolean }) {
  return (
    <main className="shop-page catalog-loading" aria-busy="true" aria-label={detail ? "Cargando producto" : "Cargando catálogo"}>
      <div className="shop-container">
        <p role="status">{detail ? "Cargando los detalles del producto…" : "Cargando catálogo…"}</p>
        <div className={detail ? "detail-layout" : "catalog-grid"} aria-hidden="true">
          {Array.from({ length: detail ? 2 : 4 }, (_, index) => <div className="catalog-skeleton" key={index} />)}
        </div>
      </div>
    </main>
  );
}
