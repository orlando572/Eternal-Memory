import "server-only";

import { requireAdmin } from "@/features/auth/services/accessService";
import { CheckoutError, isUuid } from "@/features/checkout/lib/validation";
import {
  ADMIN_ORDER_SUMMARY_COLUMNS, ADMIN_ORDERS_PAGE_SIZE, buildOrderSearchFilter, limaDayRange, readAdminOrderFilters, toAdminOrderDetail, toAdminOrderSummary,
  type AdminOrderDetailRow, type AdminOrderSummaryRow,
} from "@/features/admin-orders/lib/adminOrders";
import type { AdminOrderDetail, AdminOrderList } from "@/features/admin-orders/types/adminOrders";
import { createClient } from "@/lib/supabase/server";

const unavailable = () => new CheckoutError("ORDERS_UNAVAILABLE", "No se pudieron consultar los pedidos. Inténtalo más tarde.", 503);

// Se usa la sesión del administrador con RLS activa (política `orders_owner_or_admin_select`),
// no la clave privilegiada: la base de datos vuelve a comprobar el rol en cada lectura.

export async function listAdminOrders(params: URLSearchParams): Promise<AdminOrderList> {
  await requireAdmin();
  const filters = readAdminOrderFilters(params);
  const from = (filters.page - 1) * ADMIN_ORDERS_PAGE_SIZE;
  const client = await createClient();
  let query = client.from("orders")
    .select(ADMIN_ORDER_SUMMARY_COLUMNS, { count: "exact" });
  if (filters.status) query = query.eq("status", filters.status);
  const range = limaDayRange(filters.from, filters.to);
  if (range.gte) query = query.gte("created_at", range.gte);
  if (range.lt) query = query.lt("created_at", range.lt);
  const search = buildOrderSearchFilter(filters.query);
  if (search) query = query.or(search);
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + ADMIN_ORDERS_PAGE_SIZE - 1);
  if (error) throw unavailable();
  const total = count ?? 0;
  return {
    orders: (data as unknown as AdminOrderSummaryRow[]).map(toAdminOrderSummary),
    filters, page: filters.page, pageSize: ADMIN_ORDERS_PAGE_SIZE,
    total, totalPages: Math.max(1, Math.ceil(total / ADMIN_ORDERS_PAGE_SIZE)),
  };
}

export async function getAdminOrder(id: string): Promise<AdminOrderDetail> {
  await requireAdmin();
  if (!isUuid(id)) throw new CheckoutError("ORDER_NOT_FOUND", "No se encontró el pedido.", 404);
  const client = await createClient();
  const { data, error } = await client.from("orders")
    .select("id,status,payment_status,created_at,reservation_expires_at,contact_name,contact_email,contact_phone,address_line,address_detail,delivery_ubigeo,department,province,district,delivery_zone,subtotal_pen,delivery_pen,total_pen,order_items(line_key,product_name,variant_name,quantity,customization,base_unit_price_pen,customization_unit_pen,unit_price_pen,line_total_pen),order_status_history(id,from_status,to_status,actor_id,reason,created_at)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw unavailable();
  if (!data) throw new CheckoutError("ORDER_NOT_FOUND", "No se encontró el pedido.", 404);
  return toAdminOrderDetail(data as unknown as AdminOrderDetailRow);
}
