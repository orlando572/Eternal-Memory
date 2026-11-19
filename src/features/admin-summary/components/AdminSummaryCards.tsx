import Link from "next/link";
import { ArrowRight, CalendarDays, Inbox, PackageCheck, PackageX } from "lucide-react";
import { adminProductEditHref, adminSummaryLinks, countLabel } from "@/features/admin-summary/lib/adminSummary";
import type { AdminSummary } from "@/features/admin-summary/types/adminSummary";

const figure = (count: number) => count.toLocaleString("es-PE");

export function AdminSummaryCards({ summary }: { summary: AdminSummary }) {
  const links = adminSummaryLinks(summary.today);
  const pending = summary.orders.paid + summary.orders.processing;
  const { outOfStock } = summary;
  const hidden = outOfStock.total - outOfStock.variants.length;

  return <ul className="admin-summary-cards" aria-label="Cifras de la tienda">
    <li className="admin-summary-card" data-attention={pending > 0 || undefined}>
      <h3><Inbox size={17} aria-hidden="true" /> Pedidos por atender</h3>
      <p className="admin-summary-figure">{figure(pending)}</p>
      <ul className="admin-summary-breakdown">
        <li><Link href={links.paid}><span>Pagados, por preparar</span><strong>{figure(summary.orders.paid)}</strong><ArrowRight size={14} aria-hidden="true" /></Link></li>
        <li><Link href={links.processing}><span>En preparación</span><strong>{figure(summary.orders.processing)}</strong><ArrowRight size={14} aria-hidden="true" /></Link></li>
      </ul>
    </li>

    <li className="admin-summary-card">
      <h3><CalendarDays size={17} aria-hidden="true" /> Pedidos de hoy</h3>
      <p className="admin-summary-figure">{figure(summary.orders.today)}</p>
      <p className="admin-summary-note">Recibidos desde las 00:00, horario de Perú, en cualquier estado.</p>
      <Link className="admin-summary-link" href={links.today}>Ver los pedidos de hoy <ArrowRight size={14} aria-hidden="true" /></Link>
    </li>

    <li className="admin-summary-card">
      <h3><PackageCheck size={17} aria-hidden="true" /> Productos</h3>
      <dl className="admin-summary-pair">
        <div><dt>Publicados</dt><dd className="admin-summary-figure">{figure(summary.products.published)}</dd></div>
        <div><dt>En borrador</dt><dd className="admin-summary-figure">{figure(summary.products.draft)}</dd></div>
      </dl>
      <Link className="admin-summary-link" href="/admin/productos">Gestionar productos <ArrowRight size={14} aria-hidden="true" /></Link>
    </li>

    <li className="admin-summary-card" data-attention={outOfStock.total > 0 || undefined}>
      <h3><PackageX size={17} aria-hidden="true" /> Opciones sin stock</h3>
      <p className="admin-summary-figure">{figure(outOfStock.total)}</p>
      {outOfStock.total === 0
        ? <p className="admin-summary-note">Todas las opciones activas tienen unidades disponibles.</p>
        : <>
          <ul className="admin-summary-stock">
            {outOfStock.variants.map((variant) => <li key={variant.id}>
              <Link href={adminProductEditHref(variant.productId)}>
                <span>{variant.productName}</span>
                <span>{variant.name}{variant.productStatus === "draft" ? " · borrador" : ""}</span>
              </Link>
            </li>)}
          </ul>
          {hidden > 0 && <p className="admin-summary-note">y {countLabel(hidden, "opción más", "opciones más")}.</p>}
          <p className="admin-summary-note">Las unidades reservadas por pedidos pendientes de pago no cuentan como disponibles.</p>
        </>}
    </li>
  </ul>;
}
