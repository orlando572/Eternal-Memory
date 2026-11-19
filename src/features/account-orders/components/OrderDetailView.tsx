import { money, orderStatusLabel, paymentStatusLabel } from "@/features/checkout/lib/checkoutClient";
import { formatOrderDate, shortOrderNumber, statusTone, unitsLabel } from "@/features/account-orders/lib/orderPresentation";
import type { AccountOrderDetail } from "@/features/account-orders/types/accountOrders";

export function OrderDetailView({ order }: { order: AccountOrderDetail }) {
  const { address } = order;
  return <div className="order-detail">
    <header className="order-detail-head">
      <div>
        <p className="order-card-number">Pedido {shortOrderNumber(order.id)}</p>
        <p className="order-card-date">Realizado el {formatOrderDate(order.createdAt)}</p>
      </div>
      <dl className="order-card-facts">
        <div><dt>Pedido</dt><dd><span className={`order-status order-status-${statusTone(order.status)}`}>{orderStatusLabel(order.status)}</span></dd></div>
        <div><dt>Pago</dt><dd>{paymentStatusLabel(order.paymentStatus)}</dd></div>
      </dl>
    </header>

    <section aria-labelledby="order-lines-title">
      <h4 id="order-lines-title">Productos</h4>
      <ul className="order-lines">
        {order.lines.map((line, index) => <li key={line.key ?? index}>
          <div>
            <p className="order-line-name">{line.productName}</p>
            <p>{line.variantName} · {unitsLabel(line.quantity)}</p>
            {line.customization && <p>Nombre a grabar: {line.customization.text}</p>}
          </div>
          <p className="order-line-total">{money(line.lineTotalPen)}</p>
        </li>)}
      </ul>
      <dl className="order-totals">
        <div><dt>Subtotal de artículos</dt><dd>{money(order.subtotalPen)}</dd></div>
        <div><dt>Envío</dt><dd>{money(order.deliveryPen)}</dd></div>
        <div className="order-totals-total"><dt>Total</dt><dd>{money(order.totalPen)}</dd></div>
      </dl>
    </section>

    <section aria-labelledby="order-address-title">
      <h4 id="order-address-title">Entrega</h4>
      <p>{address.line}{address.detail ? `, ${address.detail}` : ""}</p>
      <p>{address.district}, {address.province}, {address.department}</p>
      <p>Contacto: {order.contact.name} · {order.contact.phone}</p>
    </section>

    <section aria-labelledby="order-timeline-title">
      <h4 id="order-timeline-title">Seguimiento</h4>
      {order.history.length === 0
        ? <p>Todavía no hay cambios de estado registrados.</p>
        : <ol className="order-timeline">
          {order.history.map((entry, index) => <li key={`${entry.createdAt}-${index}`}>
            <p className="order-timeline-status">{orderStatusLabel(entry.toStatus)}</p>
            <time dateTime={entry.createdAt}>{formatOrderDate(entry.createdAt)}</time>
          </li>)}
        </ol>}
    </section>
  </div>;
}
