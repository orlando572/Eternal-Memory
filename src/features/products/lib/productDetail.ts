// Pure helpers for the product page. Keep this module free of runtime imports
// so it can be tested with `node --test` without the Next.js toolchain.

export const RELATED_PRODUCTS_LIMIT = 4;

// Same zones and order the checkout uses (`calculate_checkout`): the Arequipa
// province (ubigeo 0401xx) and every other covered district.
export const DELIVERY_ZONES = ["arequipa_province", "rest_of_peru"] as const;
export type DeliveryZone = (typeof DELIVERY_ZONES)[number];

const DELIVERY_ZONE_LABELS: Record<DeliveryZone, string> = {
  arequipa_province: "Provincia de Arequipa",
  rest_of_peru: "Resto del Perú",
};

// The checkout accepts at most 80 characters even if the rule allows more.
export const ENGRAVING_MAX_CHARACTERS = 80;

export type ShippingRate = { zone: DeliveryZone; label: string; pricePen: number };
export type EngravingOption = { unitSurchargePen: number; maxCharacters: number };

export function selectRelatedProducts<T extends { id: string }>(candidates: readonly T[], currentId: string, limit = RELATED_PRODUCTS_LIMIT): T[] {
  const seen = new Set<string>([currentId]);
  const related: T[] = [];
  for (const candidate of candidates) {
    if (related.length >= limit) break;
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    related.push(candidate);
  }
  return related;
}

function isDeliveryZone(value: unknown): value is DeliveryZone {
  return typeof value === "string" && (DELIVERY_ZONES as readonly string[]).includes(value);
}

function readAmount(value: unknown): number | null {
  const amount = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

// Accepts raw `delivery_rates` rows and keeps only known zones with a valid price.
export function readShippingRates(rows: readonly { zone?: unknown; price_pen?: unknown }[] | null | undefined): ShippingRate[] {
  if (!rows) return [];
  return DELIVERY_ZONES.flatMap((zone) => {
    const row = rows.find((item) => isDeliveryZone(item.zone) && item.zone === zone);
    const pricePen = row ? readAmount(row.price_pen) : null;
    return pricePen === null ? [] : [{ zone, label: DELIVERY_ZONE_LABELS[zone], pricePen }];
  });
}

export function readEngravingOption(row: { unit_surcharge_pen?: unknown; max_characters?: unknown } | null | undefined): EngravingOption | null {
  if (!row) return null;
  const unitSurchargePen = readAmount(row.unit_surcharge_pen);
  const maxCharacters = typeof row.max_characters === "number" && Number.isSafeInteger(row.max_characters) && row.max_characters > 0
    ? Math.min(row.max_characters, ENGRAVING_MAX_CHARACTERS)
    : null;
  return unitSurchargePen === null || maxCharacters === null ? null : { unitSurchargePen, maxCharacters };
}

export function shippingSummary(rates: readonly ShippingRate[], formatPrice: (value: number) => string): string {
  if (!rates.length) return "El costo de envío se calcula en el resumen del pedido según el distrito de entrega.";
  const prices = rates.map((rate) => `${rate.label}: ${formatPrice(rate.pricePen)}`).join(" · ");
  return `${prices}. Costo por pedido, confirmado en el resumen según el distrito de entrega; algunos distritos no tienen cobertura.`;
}

// `null` means the product has no engraving rule; `undefined` means it could not be checked.
export function engravingSummary(option: EngravingOption | null | undefined, formatPrice: (value: number) => string): string | null {
  if (option === undefined) return null;
  if (option === null) return "Este producto no admite grabado.";
  return `Disponible como opción al revisar tu pedido: ${formatPrice(option.unitSurchargePen)} por unidad, con un nombre de hasta ${option.maxCharacters} caracteres.`;
}
