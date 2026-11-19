import { adminOrdersHref } from "@/features/admin-orders/lib/adminOrders";
import type { OutOfStockVariant } from "@/features/admin-summary/types/adminSummary";

// Cálculos y enlaces del resumen del administrador (TSK-32), sin dependencias de servidor
// para probarlos con `node --test`.

export const ADMIN_HOME_PATH = "/admin";
export const ADMIN_SUMMARY_RECENT_LIMIT = 5;
export const ADMIN_SUMMARY_STOCK_LIMIT = 5;

const limaDate = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" });
const dayLabel = new Intl.DateTimeFormat("es-PE", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });

/** Fecha `YYYY-MM-DD` de `now` en horario de Perú (puede ser el día anterior al de UTC). */
export function limaToday(now: Date): string {
  const parts = Object.fromEntries(limaDate.formatToParts(now).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/** «miércoles, 18 de noviembre» para una fecha `YYYY-MM-DD`. */
export function formatSummaryDay(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? day : dayLabel.format(date);
}

export type StockVariantRow = {
  id: string;
  name: string;
  stock_on_hand: number;
  stock_reserved: number;
  is_active: boolean;
  products: { id: string; name: string; status: string } | null;
};

/**
 * Una opción está sin stock cuando no le quedan unidades libres: las reservadas por pedidos pendientes
 * de pago ya no se pueden vender. Las opciones inactivas y los productos archivados no cuentan.
 */
export function isOutOfStock(row: StockVariantRow): boolean {
  return row.is_active && row.products !== null && row.products.status !== "archived"
    && row.stock_on_hand - row.stock_reserved <= 0;
}

/** Total de opciones sin stock y las primeras, ordenadas por producto y opción. */
export function summarizeOutOfStock(rows: StockVariantRow[], limit = ADMIN_SUMMARY_STOCK_LIMIT): { total: number; variants: OutOfStockVariant[] } {
  const variants = rows.filter(isOutOfStock)
    .map((row) => ({ id: row.id, name: row.name, productId: row.products!.id, productName: row.products!.name, productStatus: row.products!.status }))
    .sort((a, b) => a.productName.localeCompare(b.productName, "es") || a.name.localeCompare(b.name, "es"));
  return { total: variants.length, variants: variants.slice(0, limit) };
}

/** Enlaces del resumen al panel de pedidos (TSK-16) con el filtro que corresponde a cada cifra. */
export function adminSummaryLinks(today: string) {
  return {
    paid: adminOrdersHref({ status: "paid" }),
    processing: adminOrdersHref({ status: "processing" }),
    today: adminOrdersHref({ from: today, to: today }),
  };
}

export const adminProductEditHref = (id: string) => `/admin/productos/${id}/editar`;

export const countLabel = (count: number, singular: string, plural: string) =>
  `${count.toLocaleString("es-PE")} ${count === 1 ? singular : plural}`;
