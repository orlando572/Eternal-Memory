import { FormSkeleton, LoadingRegion, Skeleton } from "./Loading";

export function AccountLoading({ profile = false }: { profile?: boolean }) {
  return <main className={`shop-page ${profile ? "profile-page" : "auth-page"}`} aria-busy="true"><LoadingRegion label="Cargando cuenta" className="shop-container"><div className={profile ? "profile-workspace" : "auth-layout"}>
    <div className="loading-profile-sidebar"><Skeleton className={profile ? "loading-round" : "loading-title"} /><Skeleton className="loading-line" /><Skeleton className="loading-line" /><Skeleton className="loading-label" /></div>
    <section className="auth-panel"><FormSkeleton fields={profile ? 5 : 2} /></section>
  </div></LoadingRegion></main>;
}

export function CheckoutLoading() {
  return <main className="shop-page checkout-page" aria-busy="true"><div className="shop-container"><LoadingRegion label="Cargando pedido"><Skeleton className="loading-title" /><div className="checkout-grid"><section className="checkout-form"><FormSkeleton fields={5} /></section><aside className="checkout-summary"><FormSkeleton fields={3} /></aside></div></LoadingRegion></div></main>;
}
