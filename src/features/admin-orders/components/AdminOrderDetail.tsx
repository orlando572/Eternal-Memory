import Link from "next/link";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { money, orderStatusLabel, paymentStatusLabel } from "@/features/checkout/lib/checkoutClient";
import { formatOrderDate, shortOrderNumber, unitsLabel } from "@/features/account-orders/lib/orderPresentation";
import { ADMIN_ORDERS_PATH, deliveryZoneLabel } from "@/features/admin-orders/lib/adminOrders";
import type { AdminOrderDetail as Detail } from "@/features/admin-orders/types/adminOrders";
import { OrderStatusBadge } from "./AdminOrderTable";
import { OrderStatusActions } from "./OrderStatusActions";

export function AdminOrderDetail({ order }: { order: Detail }) {
  const { address, contact } = order;
  const number = shortOrderNumber(order.id);
  return <section className="admin-content admin-order-detail" aria-labelledby="admin-page-title">
    <div className="admin-form-topline">
      <Link href={ADMIN_ORDERS_PATH}><ArrowLeft size={15} aria-hidden="true" /> Volver a pedidos</Link>
      <span>Operación / Pedidos / {number}</span>
    </div>
    <header className="admin-page-heading admin-form-heading">
      <div>
        <h1 id="admin-page-title">Pedido {number}</h1>
        <p>Realizado el {formatOrderDate(order.createdAt)} · Pago: {paymentStatusLabel(order.paymentStatus)}</p>
      </div>
      <OrderStatusBadge status={order.status} />
    </header>

    <div className="admin-order-columns">
      <div className="admin-order-main">
        <section className="admin-order-panel" aria-labelledby="order-lines-title">
          <h2 id="order-lines-title">Productos</h2>
          <ul className="admin-order-lines">
            {order.lines.map((line, index) => <li key={line.key ?? index}>
              <div>
                <p className="admin-order-line-name">{line.productName}</p>
                <p>{line.variantName} · {unitsLabel(line.quantity)} · {money(line.unitPricePen)} c/u</p>
                {line.customization && <p className="admin-order-engraving">Grabado: <strong>{line.customization.text}</strong>
                  {line.customizationUnitPen > 0 && <> (+{money(line.customizationUnitPen)} c/u)</>}</p>}
              </div>
              <p className="admin-order-line-total">{money(line.lineTotalPen)}</p>
            </li>)}
          </ul>
          <dl className="admin-order-totals">
            <div><dt>Subtotal de artículos</dt><dd>{money(order.subtotalPen)}</dd></div>
            <div><dt>Envío</dt><dd>{money(order.deliveryPen)}</dd></div>
            <div className="admin-order-totals-total"><dt>Total</dt><dd>{money(order.totalPen)}</dd></div>
          </dl>
        </section>

        <div className="admin-order-pair">
          <section className="admin-order-panel" aria-labelledby="order-contact-title">
            <h2 id="order-contact-title">Contacto</h2>
            <p className="admin-order-strong">{contact.name}</p>
            <p><Mail size={14} aria-hidden="true" /> <a href={`mailto:${contact.email}`}>{contact.email}</a></p>
            <p><Phone size={14} aria-hidden="true" /> <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>{contact.phone}</a></p>
          </section>
          <section className="admin-order-panel" aria-labelledby="order-address-title">
            <h2 id="order-address-title">Entrega</h2>
            <p className="admin-order-strong">{deliveryZoneLabel(order.deliveryZone)}</p>
            <p>{address.line}{address.detail ? `, ${address.detail}` : ""}</p>
            <p>{address.district}, {address.province}, {address.department}</p>
          </section>
        </div>
      </div>

      <aside className="admin-order-side" aria-label="Estado e historial">
        <OrderStatusActions orderId={order.id} status={order.status} />
        <section className="admin-order-panel" aria-labelledby="order-history-title">
          <h2 id="order-history-title">Historial</h2>
          {order.history.length === 0
            ? <p className="admin-order-muted">Todavía no hay cambios de estado registrados.</p>
            : <ol className="admin-order-timeline">
              {[...order.history].reverse().map((entry, index) => <li key={`${entry.createdAt}-${index}`}>
                <p className="admin-order-timeline-status">
                  {entry.fromStatus ? <>{orderStatusLabel(entry.fromStatus)} → </> : null}{orderStatusLabel(entry.toStatus)}
                </p>
                <p><time dateTime={entry.createdAt}>{formatOrderDate(entry.createdAt)}</time> · {entry.actor === "admin" ? "Administración" : "Sistema"}</p>
                {entry.reason && <p className="admin-order-reason">Motivo: {entry.reason}</p>}
              </li>)}
            </ol>}
        </section>
      </aside>
    </div>
  </section>;
}
