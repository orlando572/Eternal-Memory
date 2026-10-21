import { CardSkeleton, FormSkeleton, LoadingRegion, Skeleton } from "@/features/loading/Loading";

export function CatalogLoading({ detail = false }: { detail?: boolean }) {
  return <main className="shop-page catalog-loading" aria-busy="true"><div className="shop-container">
    <LoadingRegion label={detail ? "Cargando producto" : "Cargando catálogo"}>
      <Skeleton className="loading-title" />
      {detail ? <div className="detail-layout"><Skeleton className="loading-detail-photo" /><div className="loading-detail-copy"><FormSkeleton fields={3} /></div></div> : <><div className="loading-options"><Skeleton className="loading-input" /><Skeleton className="loading-line" /></div><div className="catalog-grid">{Array.from({ length: 4 }, (_, index) => <CardSkeleton key={index} />)}</div></>}
    </LoadingRegion>
  </div></main>;
}
