import type { AccountOrderDetail, AccountOrderSummary } from "@/features/account-orders/types/accountOrders";

// Parámetros y transformaciones sin dependencias de servidor, para probarlos con `node --test`.

export const ORDERS_DEFAULT_PAGE_SIZE = 10;
export const ORDERS_MAX_PAGE_SIZE = 50;
export const ORDERS_MAX_PAGE = 100_000;

function readInteger(value: string | null, fallback: number, min: number, max: number): number {
  if (value === null || !/^\d{1,6}$/.test(value)) return fallback;
  const number = Number(value);
  return number >= min && number <= max ? number : fallback;
}

/** Los valores inválidos o fuera de rango vuelven al valor por defecto. */
export function readOrderListParams(params: URLSearchParams): { page: number; pageSize: number } {
  return {
    page: readInteger(params.get("pagina"), 1, 1, ORDERS_MAX_PAGE),
    pageSize: readInteger(params.get("porPagina"), ORDERS_DEFAULT_PAGE_SIZE, 1, ORDERS_MAX_PAGE_SIZE),
  };
}

export type OrderSummaryRow = {
  id: string; status: string; payment_status: string; created_at: string; total_pen: number | string;
  order_items?: { quantity: number }[] | null;
};

export function toAccountOrderSummary(row: OrderSummaryRow): AccountOrderSummary {
  return {
    id: row.id, createdAt: row.created_at, status: row.status, paymentStatus: row.payment_status,
    totalPen: Number(row.total_pen),
    itemCount: (row.order_items ?? []).reduce((sum, item) => sum + item.quantity, 0),
  };
}

export type OrderDetailRow = {
  id: string; status: string; payment_status: string; created_at: string; reservation_expires_at: string;
  contact_name: string; contact_email: string; contact_phone: string;
  address_line: string; address_detail: string | null; delivery_ubigeo: string | null;
  department: string; province: string; district: string;
  subtotal_pen: number | string; delivery_pen: number | string; total_pen: number | string;
  order_items: {
    line_key: string | null; product_name: string; variant_name: string; quantity: number;
    customization: { mode: "urn_name"; text: string } | null;
    base_unit_price_pen: number | string | null; customization_unit_pen: number | string | null;
    unit_price_pen: number | string; line_total_pen: number | string;
  }[];
  order_status_history: { id: number; from_status: string | null; to_status: string; created_at: string }[];
};

export function toAccountOrderDetail(row: OrderDetailRow): AccountOrderDetail {
  return {
    id: row.id, createdAt: row.created_at, status: row.status, paymentStatus: row.payment_status,
    reservationExpiresAt: row.reservation_expires_at,
    contact: { name: row.contact_name, email: row.contact_email, phone: row.contact_phone },
    address: {
      line: row.address_line, detail: row.address_detail, ubigeo: row.delivery_ubigeo,
      department: row.department, province: row.province, district: row.district,
    },
    subtotalPen: Number(row.subtotal_pen), deliveryPen: Number(row.delivery_pen), totalPen: Number(row.total_pen),
    lines: row.order_items.map((line) => ({
      key: line.line_key, productName: line.product_name, variantName: line.variant_name, quantity: line.quantity,
      customization: line.customization,
      baseUnitPricePen: Number(line.base_unit_price_pen ?? line.unit_price_pen),
      customizationUnitPen: Number(line.customization_unit_pen ?? 0),
      unitPricePen: Number(line.unit_price_pen), lineTotalPen: Number(line.line_total_pen),
    })).sort((a, b) => (a.key ?? "").localeCompare(b.key ?? "")),
    // Solo estados y fechas: el motivo y el autor de cada cambio son de uso interno.
    history: [...row.order_status_history]
      .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id)
      .map((entry) => ({ fromStatus: entry.from_status, toStatus: entry.to_status, createdAt: entry.created_at })),
  };
}
