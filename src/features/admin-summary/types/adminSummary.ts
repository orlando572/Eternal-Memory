import type { AdminOrderSummary } from "@/features/admin-orders/types/adminOrders";

export type OutOfStockVariant = {
  id: string;
  name: string;
  productId: string;
  productName: string;
  productStatus: string;
};

export type AdminSummary = {
  /** Día actual `YYYY-MM-DD` en horario de Perú. */
  today: string;
  orders: { paid: number; processing: number; today: number };
  products: { published: number; draft: number };
  /** `total` cuenta todas las opciones sin unidades; `variants` muestra solo las primeras. */
  outOfStock: { total: number; variants: OutOfStockVariant[] };
  recentOrders: AdminOrderSummary[];
};
