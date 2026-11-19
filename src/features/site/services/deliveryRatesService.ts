import "server-only";

import { toDeliveryRates, type DeliveryRate, type DeliveryRateRow } from "@/features/site/lib/deliveryInfo";
import { createClient } from "@/lib/supabase/server";

/** Tarifas públicas: la política RLS de `delivery_rates` solo deja leer las activas y con precio. */
export async function listDeliveryRates(): Promise<DeliveryRate[]> {
  const client = await createClient();
  const { data, error } = await client.from("delivery_rates").select("zone,price_pen,is_active");
  if (error) throw new Error("DELIVERY_RATES_UNAVAILABLE");
  return toDeliveryRates(data as DeliveryRateRow[]);
}
