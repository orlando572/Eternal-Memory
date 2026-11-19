import { toAccountOrderDetail, toAccountOrderSummary, type OrderDetailRow, type OrderSummaryRow } from "@/features/account-orders/lib/accountOrders";
import type { AdminOrderDetail, AdminOrderFilters, AdminOrderSummary, OrderStatus } from "@/features/admin-orders/types/adminOrders";

// Filtros, búsqueda y transformaciones del panel de pedidos (TSK-16), sin dependencias de servidor
// para probarlos con `node --test`.

export const ORDER_STATUSES: readonly OrderStatus[] = ["pending_payment", "paid", "processing", "shipped", "completed", "canceled", "review_required"];
export const ADMIN_ORDERS_PAGE_SIZE = 20;
export const ADMIN_ORDERS_MAX_PAGE = 100_000;
export const ADMIN_SEARCH_MAX_LENGTH = 80;
export const ADMIN_ORDERS_PATH = "/admin/pedidos";

/** Perú no cambia de horario: el día local empieza siempre a las 00:00 de UTC−5. */
const LIMA_OFFSET = "-05:00";

const isOrderStatus = (value: unknown): value is OrderStatus =>
  typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);

/** Convierte los `searchParams` de una página (texto o lista) en `URLSearchParams`, con el primer valor de cada clave. */
export function toSearchParams(record: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === "string") params.set(key, first);
  }
  return params;
}

/** Fecha `YYYY-MM-DD` que existe en el calendario (rechaza, por ejemplo, el 31 de febrero). */
export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 2000 || year > 2100) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function readPage(value: string | null): number {
  if (value === null || !/^\d{1,6}$/.test(value)) return 1;
  const page = Number(value);
  return page >= 1 && page <= ADMIN_ORDERS_MAX_PAGE ? page : 1;
}

/** Texto de búsqueda limpio: sin símbolos de control, con espacios simples y longitud acotada. */
export function normalizeSearch(value: string | null): string {
  if (!value) return "";
  return [...value.normalize("NFC").replace(/[\p{Cc}\p{Cf}]/gu, " ").replace(/\s+/g, " ").trim()]
    .slice(0, ADMIN_SEARCH_MAX_LENGTH).join("").trim();
}

/** Parámetros `estado`, `desde`, `hasta`, `q` y `pagina`. Un valor inválido se ignora. */
export function readAdminOrderFilters(params: URLSearchParams): AdminOrderFilters {
  const status = params.get("estado");
  let from = isCalendarDate(params.get("desde")) ? params.get("desde") : null;
  let to = isCalendarDate(params.get("hasta")) ? params.get("hasta") : null;
  // Un rango invertido se ordena en lugar de devolver siempre una lista vacía.
  if (from && to && from > to) [from, to] = [to, from];
  return {
    status: isOrderStatus(status) ? status : null,
    from, to,
    query: normalizeSearch(params.get("q")),
    page: readPage(params.get("pagina")),
  };
}

function nextDay(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
}

/** Límites del rango de fechas en horario de Perú: `desde` incluido y el día `hasta` completo. */
export function limaDayRange(from: string | null, to: string | null): { gte?: string; lt?: string } {
  return {
    ...(from ? { gte: `${from}T00:00:00${LIMA_OFFSET}` } : {}),
    ...(to ? { lt: `${nextDay(to)}T00:00:00${LIMA_OFFSET}` } : {}),
  };
}

/**
 * Filtro `or` de PostgREST para la búsqueda. El número visible de un pedido son los 8 primeros
 * caracteres de su UUID, así que se busca como un rango de identificadores. Con `#` delante solo se
 * busca el número; un texto hexadecimal sin `#` busca también en nombre y correo.
 */
export function buildOrderSearchFilter(query: string): string | null {
  const number = /^(#)?([0-9a-f]{1,8})$/i.exec(query);
  const filters: string[] = [];
  if (number) {
    const prefix = number[2].toLowerCase();
    const low = `${prefix.padEnd(8, "0")}-0000-0000-0000-000000000000`;
    const high = `${prefix.padEnd(8, "f")}-ffff-ffff-ffff-ffffffffffff`;
    filters.push(`and(id.gte.${low},id.lte.${high})`);
    if (number[1]) return filters[0];
  }
  // Se quitan los comodines y los caracteres que delimitan el filtro; el resto va entre comillas.
  const text = query.replace(/[*%"\\(),]/g, " ").replace(/\s+/g, " ").trim();
  if (text) filters.unshift(`contact_name.ilike."*${text}*"`, `contact_email.ilike."*${text}*"`);
  return filters.length ? filters.join(",") : null;
}

/** URL del listado con los filtros indicados; omite los vacíos y la primera página. */
export function adminOrdersHref(filters: Partial<AdminOrderFilters> = {}): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.status) params.set("estado", filters.status);
  if (filters.from) params.set("desde", filters.from);
  if (filters.to) params.set("hasta", filters.to);
  if (filters.page && filters.page > 1) params.set("pagina", String(filters.page));
  const search = params.toString();
  return search ? `${ADMIN_ORDERS_PATH}?${search}` : ADMIN_ORDERS_PATH;
}

export const adminOrderHref = (id: string) => `${ADMIN_ORDERS_PATH}/${id}`;

export const hasActiveFilters = (filters: AdminOrderFilters) =>
  Boolean(filters.status || filters.from || filters.to || filters.query);

const zoneLabels: Record<string, string> = { arequipa_province: "Provincia de Arequipa", rest_of_peru: "Resto del Perú" };
export const deliveryZoneLabel = (zone: string) => zoneLabels[zone] ?? "Zona no disponible";

export type AdminOrderSummaryRow = OrderSummaryRow & { contact_name: string; contact_email: string; delivery_zone: string };

export function toAdminOrderSummary(row: AdminOrderSummaryRow): AdminOrderSummary {
  return {
    ...toAccountOrderSummary(row),
    customerName: row.contact_name, customerEmail: row.contact_email, deliveryZone: row.delivery_zone,
  };
}

export type AdminOrderDetailRow = Omit<OrderDetailRow, "order_status_history"> & {
  delivery_zone: string;
  order_status_history: {
    id: number; from_status: string | null; to_status: string; created_at: string;
    actor_id: string | null; reason: string | null;
  }[];
};

/** Igual que el detalle de la cuenta, más la zona y el autor y motivo de cada cambio (uso interno). */
export function toAdminOrderDetail(row: AdminOrderDetailRow): AdminOrderDetail {
  const base = toAccountOrderDetail({ ...row, order_status_history: [] });
  return {
    ...base,
    deliveryZone: row.delivery_zone,
    history: [...row.order_status_history]
      .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id)
      .map((entry) => ({
        fromStatus: entry.from_status, toStatus: entry.to_status, createdAt: entry.created_at,
        actor: entry.actor_id ? "admin" : "system", reason: entry.reason,
      })),
  };
}
