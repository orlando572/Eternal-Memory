import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/features/site/components/InfoPage";
import { DELIVERY_ZONES, UNCOVERED_AREAS, formatPen, type DeliveryRate } from "@/features/site/lib/deliveryInfo";
import { listDeliveryRates } from "@/features/site/services/deliveryRatesService";

export const metadata: Metadata = {
  title: "Envíos",
  description: "Zonas de entrega y tarifas de envío de Eternal Memory, en soles.",
  alternates: { canonical: "/envios" },
};

// Las tarifas se leen de la base de datos en cada visita: un cambio de precio se ve sin publicar de nuevo.
export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  let rates: DeliveryRate[] | null = null;
  try {
    rates = await listDeliveryRates();
  } catch {
    rates = null;
  }
  return <InfoPage kicker="Envíos" heading="Zonas y tarifas de envío" intro="El costo de envío depende de la zona de entrega. Lo verás en el resumen de tu pedido antes de confirmarlo.">
    <section className="info-section" aria-labelledby="shipping-rates-title">
      <h2 id="shipping-rates-title">Tarifas por zona</h2>
      {rates && rates.length > 0
        ? <ul className="shipping-rates">
          {rates.map((rate) => <li key={rate.zone}>
            <div><h3>{DELIVERY_ZONES[rate.zone].label}</h3><p>{DELIVERY_ZONES[rate.zone].description}</p></div>
            <p className="shipping-price">{formatPen(rate.pricePen)}</p>
          </li>)}
        </ul>
        : <p role="status">No pudimos mostrar las tarifas en este momento. Las verás en el resumen de tu pedido, o escríbenos desde <Link href="/contacto">contacto</Link>.</p>}
      <p>La tarifa se cobra una sola vez por pedido y se muestra en soles.</p>
    </section>
    <section className="info-section" aria-labelledby="shipping-uncovered-title">
      <h2 id="shipping-uncovered-title">Zonas sin cobertura</h2>
      <p>Por ahora no realizamos entregas en:</p>
      <ul className="shipping-uncovered">{UNCOVERED_AREAS.map((area) => <li key={area.ubigeoPrefix}>{area.label}</li>)}</ul>
    </section>
    <section className="info-section" aria-labelledby="shipping-dates-title">
      <h2 id="shipping-dates-title">Fechas de entrega</h2>
      <p>La tienda no indica una fecha de entrega. Si necesitas coordinar una, escríbenos desde <Link href="/contacto">contacto</Link>.</p>
    </section>
  </InfoPage>;
}
