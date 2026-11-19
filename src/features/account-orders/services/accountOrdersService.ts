import "server-only";

import { requireUser } from "@/features/auth/services/accessService";
import { CheckoutError, isUuid } from "@/features/checkout/lib/validation";
import { readOrderListParams, toAccountOrderDetail, toAccountOrderSummary, type OrderDetailRow, type OrderSummaryRow } from "@/features/account-orders/lib/accountOrders";
import type { AccountOrderDetail, AccountOrderList } from "@/features/account-orders/types/accountOrders";
import { createClient } from "@/lib/supabase/server";

const unavailable = () => new CheckoutError("ORDERS_UNAVAILABLE", "No se pudieron consultar tus pedidos. Inténtalo más tarde.", 503);

// Se usa la sesión de la persona (RLS activa), no la clave privilegiada: aunque falle el filtro,
// la base de datos impide leer pedidos ajenos. La política también permite leerlos a un
// administrador, así que el filtro por `customer_id` es el que limita «mis pedidos» a los propios.

export async function listAccountOrders(params: URLSearchParams): Promise<AccountOrderList> {
  const { user } = await requireUser();
  const { page, pageSize } = readOrderListParams(params);
  const from = (page - 1) * pageSize;
  const client = await createClient();
  const { data, error, count } = await client.from("orders")
    .select("id,status,payment_status,created_at,total_pen,order_items(quantity)", { count: "exact" })
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + pageSize - 1);
  if (error) throw unavailable();
  const total = count ?? 0;
  return {
    orders: (data as OrderSummaryRow[]).map(toAccountOrderSummary),
    page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getAccountOrder(id: string): Promise<AccountOrderDetail> {
  const { user } = await requireUser();
  // Un identificador inválido y el pedido de otra cuenta responden igual: no se revela su existencia.
  if (!isUuid(id)) throw new CheckoutError("ORDER_NOT_FOUND", "No se encontró el pedido.", 404);
  const client = await createClient();
  const { data, error } = await client.from("orders")
    .select("id,status,payment_status,created_at,reservation_expires_at,contact_name,contact_email,contact_phone,address_line,address_detail,delivery_ubigeo,department,province,district,subtotal_pen,delivery_pen,total_pen,order_items(line_key,product_name,variant_name,quantity,customization,base_unit_price_pen,customization_unit_pen,unit_price_pen,line_total_pen),order_status_history(id,from_status,to_status,created_at)")
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();
  if (error) throw unavailable();
  if (!data) throw new CheckoutError("ORDER_NOT_FOUND", "No se encontró el pedido.", 404);
  return toAccountOrderDetail(data as unknown as OrderDetailRow);
}
