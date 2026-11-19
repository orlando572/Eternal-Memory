import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { formatOrderDate, shortOrderNumber } from "@/features/account-orders/lib/orderPresentation";
import { ADMIN_ORDERS_PATH, adminOrderHref } from "@/features/admin-orders/lib/adminOrders";
import { OrderStatusBadge } from "@/features/admin-orders/components/AdminOrderTable";
import type { AdminOrderSummary } from "@/features/admin-orders/types/adminOrders";
import { money } from "@/features/checkout/lib/checkoutClient";

export function AdminRecentOrders({ orders }: { orders: AdminOrderSummary[] }) {
  return <section className="admin-list-section" aria-labelledby="admin-recent-orders-title">
    <div className="admin-section-heading">
      <div><span className="admin-section-rule" /><h2 id="admin-recent-orders-title">Últimos pedidos</h2></div>
      <Link className="admin-summary-link" href={ADMIN_ORDERS_PATH}>Ver todos los pedidos <ArrowRight size={14} aria-hidden="true" /></Link>
    </div>
    {orders.length === 0
      ? <div className="admin-empty-state">
        <Inbox size={35} strokeWidth={1.4} aria-hidden="true" />
        <h3>Todavía no hay pedidos</h3>
        <p>Cuando un cliente confirme un pedido, aparecerá aquí.</p>
      </div>
      : <ol className="admin-summary-orders">
        {orders.map((order) => <li key={order.id}>
          <Link href={adminOrderHref(order.id)} aria-label={`Ver pedido ${shortOrderNumber(order.id)} de ${order.customerName}`}>
            <span className="admin-summary-order-number">{shortOrderNumber(order.id)}</span>
            <span className="admin-summary-order-customer">{order.customerName}</span>
            <span className="admin-summary-order-date">{formatOrderDate(order.createdAt)}</span>
            <span className="admin-summary-order-total">{money(order.totalPen)}</span>
          </Link>
          <OrderStatusBadge status={order.status} />
        </li>)}
      </ol>}
  </section>;
}
