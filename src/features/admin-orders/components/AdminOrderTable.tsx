import Link from "next/link";
import { ArrowLeft, ArrowRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money, orderStatusLabel, paymentStatusLabel } from "@/features/checkout/lib/checkoutClient";
import { formatOrderDate, shortOrderNumber, statusTone, unitsLabel } from "@/features/account-orders/lib/orderPresentation";
import { ADMIN_ORDERS_PATH, adminOrderHref, adminOrdersHref, deliveryZoneLabel, hasActiveFilters } from "@/features/admin-orders/lib/adminOrders";
import type { AdminOrderList } from "@/features/admin-orders/types/adminOrders";

export function OrderStatusBadge({ status }: { status: string }) {
  return <span className={`admin-status admin-order-status-${statusTone(status)}`}><span aria-hidden="true" />{orderStatusLabel(status)}</span>;
}

export function AdminOrderTable({ list }: { list: AdminOrderList }) {
  if (list.orders.length === 0) {
    const filtered = hasActiveFilters(list.filters);
    return <div className="admin-empty-state">
      <Inbox size={35} strokeWidth={1.4} aria-hidden="true" />
      <h3>{filtered ? "No hay pedidos con esos filtros" : "Todavía no hay pedidos"}</h3>
      <p>{filtered ? "Prueba con otro número, nombre, correo, estado o rango de fechas." : "Cuando un cliente confirme un pedido, aparecerá aquí."}</p>
      {filtered && <Button asChild variant="outline"><Link href={ADMIN_ORDERS_PATH}>Limpiar filtros</Link></Button>}
    </div>;
  }

  const first = (list.page - 1) * list.pageSize + 1;
  const last = first + list.orders.length - 1;
  return <>
    <div className="admin-order-table" role="table" aria-label="Pedidos">
      <div className="admin-order-head" role="row">
        <span role="columnheader">Pedido</span>
        <span role="columnheader">Cliente</span>
        <span role="columnheader">Fecha</span>
        <span role="columnheader">Zona</span>
        <span role="columnheader">Total</span>
        <span role="columnheader">Estado</span>
        <span role="columnheader">Pago</span>
      </div>
      {list.orders.map((order) => <div className="admin-order-row" role="row" key={order.id}>
        <div className="admin-order-number" role="cell">
          <Link href={adminOrderHref(order.id)} aria-label={`Ver pedido ${shortOrderNumber(order.id)}`}>{shortOrderNumber(order.id)}</Link>
          <span>{unitsLabel(order.itemCount)}</span>
        </div>
        <div className="admin-order-customer" role="cell">
          <span>{order.customerName}</span>
          <span>{order.customerEmail}</span>
        </div>
        <div className="admin-order-date" role="cell">{formatOrderDate(order.createdAt)}</div>
        <div className="admin-order-zone" role="cell">{deliveryZoneLabel(order.deliveryZone)}</div>
        <div className="admin-order-total" role="cell">{money(order.totalPen)}</div>
        <div role="cell"><OrderStatusBadge status={order.status} /></div>
        <div className="admin-order-payment" role="cell"><span className="admin-order-cell-label">Pago: </span>{paymentStatusLabel(order.paymentStatus)}</div>
      </div>)}
    </div>
    <div className="admin-order-footer">
      <p className="admin-result-count" aria-live="polite">Mostrando {first}–{last} de {list.total} {list.total === 1 ? "pedido" : "pedidos"}</p>
      {list.totalPages > 1 && <nav className="admin-pagination" aria-label="Paginación de pedidos">
        {list.page > 1
          ? <Link href={adminOrdersHref({ ...list.filters, page: list.page - 1 })} rel="prev"><ArrowLeft size={15} aria-hidden="true" /> Anteriores</Link>
          : <span aria-hidden="true" />}
        <p aria-current="page">Página {list.page} de {list.totalPages}</p>
        {list.page < list.totalPages
          ? <Link href={adminOrdersHref({ ...list.filters, page: list.page + 1 })} rel="next">Siguientes <ArrowRight size={15} aria-hidden="true" /></Link>
          : <span aria-hidden="true" />}
      </nav>}
    </div>
  </>;
}
