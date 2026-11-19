// Presentación del historial de pedidos sin dependencias de React ni del servidor.

/** Número corto para mostrar y citar un pedido: los 8 primeros caracteres de su identificador. */
export const shortOrderNumber = (id: string) => `#${id.replaceAll("-", "").slice(0, 8).toUpperCase()}`;

const dateFormatter = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" });

/** Fecha y hora en horario de Perú; una fecha inválida no rompe la pantalla. */
export function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "Fecha no disponible" : dateFormatter.format(date);
}

export const orderDetailHref = (id: string) => `/perfil/historial/${id}`;
export const historyPageHref = (page: number) => page <= 1 ? "/perfil/historial" : `/perfil/historial?pagina=${page}`;

export type StatusTone = "ok" | "pending" | "canceled" | "review";

/** Agrupa los estados del pedido para darles el mismo estilo visual. */
export function statusTone(status: string): StatusTone {
  if (["paid", "processing", "shipped", "completed"].includes(status)) return "ok";
  if (status === "pending_payment") return "pending";
  if (status === "canceled") return "canceled";
  return "review";
}

export const unitsLabel = (count: number) => `${count} ${count === 1 ? "unidad" : "unidades"}`;
