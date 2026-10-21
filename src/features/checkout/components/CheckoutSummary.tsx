import { Button } from "@/components/ui/button";
import { money } from "@/features/checkout/lib/checkoutClient";
import type { CheckoutQuote, CheckoutOrder } from "@/features/checkout/types/checkout";

export function CheckoutSummary({ quote, order, now, valid, busy, onConfirm }: { quote: CheckoutQuote | null; order?: CheckoutOrder | null; now: number; valid: boolean; busy: boolean; onConfirm: () => void }) {
  const summary = order ?? quote?.summary;
  const expires = quote ? Math.max(0, Math.ceil((Date.parse(quote.expiresAt) - now) / 1000)) : 0;
  return <aside className="checkout-summary" aria-labelledby="checkout-summary-title" aria-busy={busy}>
    <p className="checkout-kicker">Antes de confirmar</p>
    <h2 id="checkout-summary-title" tabIndex={-1}>Resumen del pedido</h2>
    {!summary ? <p>Completa tus datos y selecciona «Revisar mi pedido» para conocer el envío y el total confirmado.</p> : <>
      <ul className="checkout-summary-lines">{summary.lines.map((line) => <li key={line.key}>
        <div><h3>{line.productName}</h3><p>{line.variantName} · {line.quantity} {line.quantity === 1 ? "unidad" : "unidades"}</p></div>
        <dl><div><dt>Precio base por unidad</dt><dd>{money(line.baseUnitPricePen)}</dd></div>
          {line.customization && <><div><dt>Grabado por unidad</dt><dd>{money(line.customizationUnitPen)}</dd></div><div className="checkout-engraving"><dt>Nombre a grabar</dt><dd>{line.customization.text}</dd></div></>}
          <div><dt>Total de esta línea</dt><dd>{money(line.lineTotalPen)}</dd></div></dl>
      </li>)}</ul>
      <p className="checkout-destination">Entrega en {summary.location.district}, {summary.location.province}, {summary.location.department}.</p>
      <dl className="checkout-totals">
        {quote && !order && <><div><dt>Artículos sin grabado</dt><dd>{money(quote.summary.baseSubtotalPen)}</dd></div><div><dt>Grabados</dt><dd>{money(quote.summary.customizationPen)}</dd></div></>}
        <div><dt>Subtotal de artículos</dt><dd>{money(summary.subtotalPen)}</dd></div><div><dt>Envío</dt><dd>{money(summary.deliveryPen)}</dd></div>
        <div className="checkout-total"><dt>Total</dt><dd>{money(summary.totalPen)}</dd></div>
      </dl>
      {!order && <>
        <p role="status" className="checkout-caption">{valid ? "Resumen listo para revisar y confirmar." : "El resumen requiere una nueva revisión antes de confirmar."}</p>
        <p className="checkout-caption">{!valid ? "Revisa un nuevo resumen si cambiaste datos o si este venció." : `Resumen válido durante ${Math.floor(expires / 60)}:${String(expires % 60).padStart(2, "0")}. Aún no hay reserva.`}</p>
        <Button type="button" className="checkout-primary" disabled={!valid || busy} onClick={onConfirm}>{busy ? "Creando pedido…" : "Confirmar pedido pendiente"}</Button>
        <p className="checkout-caption">Al confirmar se reservarán las unidades durante 30 minutos. El pago en línea todavía no está habilitado.</p>
      </>}
    </>}
  </aside>;
}
