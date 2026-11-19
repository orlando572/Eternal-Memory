import "server-only";

import { requireAdmin } from "@/features/auth/services/accessService";
import { CheckoutError } from "@/features/checkout/lib/validation";
import {
  ADMIN_ORDER_SUMMARY_COLUMNS, limaDayRange, toAdminOrderSummary, type AdminOrderSummaryRow,
} from "@/features/admin-orders/lib/adminOrders";
import { ADMIN_SUMMARY_RECENT_LIMIT, limaToday, summarizeOutOfStock, type StockVariantRow } from "@/features/admin-summary/lib/adminSummary";
import type { AdminSummary } from "@/features/admin-summary/types/adminSummary";
import { createClient } from "@/lib/supabase/server";

const unavailable = () => new CheckoutError("SUMMARY_UNAVAILABLE", "No se pudo cargar el resumen. Inténtalo más tarde.", 503);

/**
 * Cifras de la página de inicio del administrador. Igual que el panel de pedidos, usa la sesión del
 * administrador con RLS activa (no la clave privilegiada) y comprueba el rol antes de consultar.
 */
export async function getAdminSummary(now: Date = new Date()): Promise<AdminSummary> {
  await requireAdmin();
  const client = await createClient();
  const today = limaToday(now);
  const day = limaDayRange(today, today);
  const countOrders = () => client.from("orders").select("id", { count: "exact", head: true });
  const countProducts = (status: "published" | "draft") =>
    client.from("products").select("id", { count: "exact", head: true }).eq("status", status);

  const [paid, processing, todayOrders, published, draft, variants, recent] = await Promise.all([
    countOrders().eq("status", "paid"),
    countOrders().eq("status", "processing"),
    countOrders().gte("created_at", day.gte!).lt("created_at", day.lt!),
    countProducts("published"),
    countProducts("draft"),
    // PostgREST no compara dos columnas, así que el «sin stock» se calcula aquí sobre las opciones activas.
    client.from("product_variants")
      .select("id,name,stock_on_hand,stock_reserved,is_active,products!inner(id,name,status)")
      .eq("is_active", true)
      .neq("products.status", "archived"),
    client.from("orders")
      .select(ADMIN_ORDER_SUMMARY_COLUMNS)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(ADMIN_SUMMARY_RECENT_LIMIT),
  ]);
  if ([paid, processing, todayOrders, published, draft, variants, recent].some((result) => result.error)) throw unavailable();

  return {
    today,
    orders: { paid: paid.count ?? 0, processing: processing.count ?? 0, today: todayOrders.count ?? 0 },
    products: { published: published.count ?? 0, draft: draft.count ?? 0 },
    outOfStock: summarizeOutOfStock((variants.data ?? []) as unknown as StockVariantRow[]),
    recentOrders: ((recent.data ?? []) as unknown as AdminOrderSummaryRow[]).map(toAdminOrderSummary),
  };
}
