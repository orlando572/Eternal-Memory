import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money, orderStatusLabel, paymentStatusLabel } from "@/features/checkout/lib/checkoutClient";
import { formatOrderDate, historyPageHref, orderDetailHref, shortOrderNumber, statusTone, unitsLabel } from "@/features/account-orders/lib/orderPresentation";
import type { AccountOrderList } from "@/features/account-orders/types/accountOrders";

export function OrderHistoryList({ list }: { list: AccountOrderList }) {
  if (list.total === 0) {
    return <div className="orders-empty">
      <h3>Aún no tienes pedidos</h3>
      <p>Cuando confirmes un pedido, aparecerá aquí con su estado de pedido y de pago.</p>
      <Button asChild><Link href="/catalogo">Explorar el catálogo</Link></Button>
    </div>;
  }
  return <>
    <ul className="orders-list" aria-label="Tus pedidos">
      {list.orders.map((order) => <li key={order.id}>
        <Link href={orderDetailHref(order.id)} className="order-card">
          <div className="order-card-main">
            <p className="order-card-number">Pedido {shortOrderNumber(order.id)}</p>
            <p className="order-card-date">{formatOrderDate(order.createdAt)} · {unitsLabel(order.itemCount)}</p>
          </div>
          <dl className="order-card-facts">
            <div><dt>Total</dt><dd className="order-card-total">{money(order.totalPen)}</dd></div>
            <div><dt>Pedido</dt><dd><span className={`order-status order-status-${statusTone(order.status)}`}>{orderStatusLabel(order.status)}</span></dd></div>
            <div><dt>Pago</dt><dd>{paymentStatusLabel(order.paymentStatus)}</dd></div>
          </dl>
          <span className="order-card-more">Ver detalle <ArrowRight size={15} aria-hidden="true" /></span>
        </Link>
      </li>)}
    </ul>
    {list.totalPages > 1 && <nav className="orders-pagination" aria-label="Paginación de pedidos">
      {list.page > 1 ? <Link href={historyPageHref(list.page - 1)} rel="prev"><ArrowLeft size={15} aria-hidden="true" /> Anteriores</Link> : <span aria-hidden="true" />}
      <p aria-current="page">Página {list.page} de {list.totalPages}</p>
      {list.page < list.totalPages ? <Link href={historyPageHref(list.page + 1)} rel="next">Siguientes <ArrowRight size={15} aria-hidden="true" /></Link> : <span aria-hidden="true" />}
    </nav>}
  </>;
}
