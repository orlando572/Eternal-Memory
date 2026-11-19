// Información de envíos que se muestra en `/envios`. Las tarifas salen de la tabla
// `delivery_rates` (no se repiten aquí); las zonas sin cobertura reflejan `checkout_locations`.

export type DeliveryZone = "arequipa_province" | "rest_of_peru";
export type DeliveryRate = { zone: DeliveryZone; pricePen: number };
export type DeliveryRateRow = { zone: string; price_pen: number | string | null; is_active: boolean };

export const DELIVERY_ZONES: Record<DeliveryZone, { label: string; description: string }> = {
  arequipa_province: { label: "Provincia de Arequipa", description: "Entregas dentro de la provincia de Arequipa, departamento de Arequipa." },
  rest_of_peru: { label: "Resto del Perú", description: "Entregas en las demás provincias cubiertas del país." },
};

/** Zonas donde no se entrega. Una prueba comprueba que coinciden con la migración de checkout. */
export const UNCOVERED_AREAS = [
  { label: "Distrito de Megantoni (provincia de La Convención, Cusco)", ubigeoPrefix: "080914" },
  { label: "Provincia de Putumayo (Loreto)", ubigeoPrefix: "1608" },
  { label: "Provincia de Purús (Ucayali)", ubigeoPrefix: "2504" },
] as const;

const order: DeliveryZone[] = ["arequipa_province", "rest_of_peru"];

/** Solo tarifas activas y con precio, con la provincia de Arequipa primero. */
export function toDeliveryRates(rows: DeliveryRateRow[]): DeliveryRate[] {
  return rows
    .filter((row): row is DeliveryRateRow & { zone: DeliveryZone } => row.is_active && row.price_pen !== null && order.includes(row.zone as DeliveryZone))
    .map((row) => ({ zone: row.zone, pricePen: Number(row.price_pen) }))
    .filter((rate) => Number.isFinite(rate.pricePen) && rate.pricePen >= 0)
    .sort((a, b) => order.indexOf(a.zone) - order.indexOf(b.zone));
}

export const formatPen = (amount: number) => `S/ ${amount.toFixed(2)}`;
