import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminOrderDetail } from "@/features/admin-orders/components/AdminOrderDetail";
import { AdminOrdersAccessState } from "@/features/admin-orders/components/AdminOrdersAccessState";
import { ADMIN_ORDERS_PATH, adminOrderHref } from "@/features/admin-orders/lib/adminOrders";
import { checkAdminOrdersAccess } from "@/features/admin-orders/services/adminOrdersAccess";
import { getAdminOrder } from "@/features/admin-orders/services/adminOrdersService";
import { CheckoutError } from "@/features/checkout/lib/validation";
import type { AdminOrderDetail as Detail } from "@/features/admin-orders/types/adminOrders";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const here = adminOrderHref(encodeURIComponent(id));
  const access = await checkAdminOrdersAccess(here);
  if (access !== "ready") return <AdminOrdersAccessState state={access} retryHref={here} />;

  let order: Detail | null = null;
  let missing = false;
  try {
    order = await getAdminOrder(id);
  } catch (error) {
    missing = error instanceof CheckoutError && error.code === "ORDER_NOT_FOUND";
  }
  // `notFound` interrumpe la ejecución, por eso va fuera del `try`.
  if (missing) notFound();

  if (!order) {
    return <section className="admin-content">
      <div className="admin-order-load-error" role="alert">
        <p>No se pudo cargar este pedido. Inténtalo de nuevo en un momento.</p>
        <a href={here}>Reintentar</a> · <Link href={ADMIN_ORDERS_PATH}>Volver a pedidos</Link>
      </div>
    </section>;
  }
  return <AdminOrderDetail order={order} />;
}
