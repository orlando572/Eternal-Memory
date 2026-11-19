import { FormSkeleton, LoadingRegion, Skeleton } from "@/features/loading/Loading";

export function AdminTableSkeleton() {
  return <LoadingRegion label="Cargando productos"><div className="loading-table">{Array.from({ length: 5 }, (_, index) => <div className="loading-table-row" key={index}><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div>)}</div></LoadingRegion>;
}

export function AdminLoading({ editor = false }: { editor?: boolean }) {
  return <section className="admin-content"><LoadingRegion label={editor ? "Cargando formulario de producto" : "Cargando administración"}><Skeleton className="loading-label" /><Skeleton className="loading-title" />{editor ? <><div className="loading-admin-panel"><FormSkeleton fields={4} /></div><div className="loading-admin-panel"><FormSkeleton fields={2} /></div></> : <><Skeleton className="loading-input" /><div className="loading-admin-panel"><AdminTableSkeleton /></div></>}</LoadingRegion></section>;
}
