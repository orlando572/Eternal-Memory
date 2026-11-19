import Link from "next/link";
import type { AdminOrdersAccess } from "@/features/admin-orders/services/adminOrdersAccess";

/** Mismo aviso que `AdminAccessGate` de productos, para una cuenta sin permisos o sin verificar. */
export function AdminOrdersAccessState({ state, retryHref }: { state: Exclude<AdminOrdersAccess, "ready">; retryHref: string }) {
  return <section className="admin-content admin-access-state" role="alert">
    <h1>{state === "denied" ? "No tienes permisos para administrar pedidos" : "No se pudo comprobar el acceso"}</h1>
    {state === "denied"
      ? <Link href="/catalogo">Volver al catálogo</Link>
      : <Link href={retryHref}>Reintentar</Link>}
  </section>;
}
