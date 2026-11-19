import { AdminOrdersAccessState } from "@/features/admin-orders/components/AdminOrdersAccessState";
import { checkAdminOrdersAccess } from "@/features/admin-orders/services/adminOrdersAccess";
import { AdminRecentOrders } from "@/features/admin-summary/components/AdminRecentOrders";
import { AdminSummaryCards } from "@/features/admin-summary/components/AdminSummaryCards";
import { ADMIN_HOME_PATH, formatSummaryDay } from "@/features/admin-summary/lib/adminSummary";
import { getAdminSummary } from "@/features/admin-summary/services/adminSummaryService";
import type { AdminSummary } from "@/features/admin-summary/types/adminSummary";

export default async function AdminSummaryPage() {
  const access = await checkAdminOrdersAccess(ADMIN_HOME_PATH);
  if (access !== "ready") {
    return <AdminOrdersAccessState state={access} retryHref={ADMIN_HOME_PATH} deniedTitle="No tienes permisos para entrar a la administración" />;
  }

  let summary: AdminSummary | null = null;
  try {
    summary = await getAdminSummary();
  } catch {
    summary = null;
  }

  return <section className="admin-content" aria-labelledby="admin-page-title">
    <header className="admin-page-heading">
      <div>
        <p className="admin-path">Operación / Resumen</p>
        <h1 id="admin-page-title">Resumen</h1>
        <p>{summary ? `Hoy es ${formatSummaryDay(summary.today)}. ` : ""}Lo que conviene atender en pedidos y catálogo.</p>
      </div>
    </header>
    {summary
      ? <>
        <AdminSummaryCards summary={summary} />
        <AdminRecentOrders orders={summary.recentOrders} />
      </>
      : <div className="admin-order-load-error" role="alert">
        <p>No se pudo cargar el resumen. Inténtalo de nuevo en un momento.</p>
        <a href={ADMIN_HOME_PATH}>Reintentar</a>
      </div>}
  </section>;
}
