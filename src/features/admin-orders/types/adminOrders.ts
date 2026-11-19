import type { AccountOrderDetail, AccountOrderSummary } from "@/features/account-orders/types/accountOrders";

export type OrderStatus = "pending_payment" | "paid" | "processing" | "shipped" | "completed" | "canceled" | "review_required";

export type AdminOrderFilters = {
  status: OrderStatus | null;
  /** Fechas `YYYY-MM-DD` en horario de Perú. */
  from: string | null;
  to: string | null;
  query: string;
  page: number;
};

export type AdminOrderSummary = AccountOrderSummary & {
  customerName: string;
  customerEmail: string;
  deliveryZone: string;
};

export type AdminOrderList = {
  orders: AdminOrderSummary[];
  filters: AdminOrderFilters;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminOrderHistoryEntry = {
  fromStatus: string | null;
  toStatus: string;
  createdAt: string;
  /** `system` cuando el cambio lo hizo el pago o la base de datos, sin autor. */
  actor: "admin" | "system";
  reason: string | null;
};

export type AdminOrderDetail = Omit<AccountOrderDetail, "history"> & {
  deliveryZone: string;
  history: AdminOrderHistoryEntry[];
};
