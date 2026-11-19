import { redirect } from "next/navigation";
import { AdminOrderFilters } from "@/features/admin-orders/components/AdminOrderFilters";
import { AdminOrderTable } from "@/features/admin-orders/components/AdminOrderTable";
import { AdminOrdersAccessState } from "@/features/admin-orders/components/AdminOrdersAccessState";
import { adminOrdersHref, readAdminOrderFilters, toSearchParams } from "@/features/admin-orders/lib/adminOrders";
import { checkAdminOrdersAccess } from "@/features/admin-orders/services/adminOrdersAccess";
import { listAdminOrders } from "@/features/admin-orders/services/adminOrdersService";
import type { AdminOrderList } from "@/features/admin-orders/types/adminOrders";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = toSearchParams(await searchParams);
  const filters = readAdminOrderFilters(params);
  const here = adminOrdersHref(filters);
  const access = await checkAdminOrdersAccess(here);
  if (access !== "ready") return <AdminOrdersAccessState state={access} retryHref={here} />;

  let list: AdminOrderList | null = null;
  try {
    list = await listAdminOrders(params);
  } catch {
    list = null;
  }
  // Una página fuera de rango se lleva a la última que tiene pedidos.
  if (list && list.orders.length === 0 && list.total > 0) redirect(adminOrdersHref({ ...list.filters, page: list.totalPages }));

  return <section className="admin-content" aria-labelledby="admin-page-title">
    <header className="admin-page-heading">
      <div>
        <p className="admin-path">Operación / Pedidos</p>
        <h1 id="admin-page-title">Pedidos</h1>
        <p>Busca un pedido, revisa su detalle y avanza su estado.</p>
      </div>
    </header>
    <div className="admin-list-section">
      <div className="admin-section-heading">
        <div><span className="admin-section-rule" /><h2>Pedidos recibidos</h2></div>
        <p>Del más reciente al más antiguo · horario de Perú</p>
      </div>
      <AdminOrderFilters filters={filters} />
      {list
        ? <AdminOrderTable list={list} />
        : <div className="admin-order-load-error" role="alert">
          <p>No se pudieron cargar los pedidos. Inténtalo de nuevo en un momento.</p>
          <a href={here}>Reintentar</a>
        </div>}
    </div>
  </section>;
}
