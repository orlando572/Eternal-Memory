import "server-only";

import { requireAdmin } from "@/features/auth/services/accessService";
import { CheckoutError, readObject } from "@/features/checkout/lib/validation";
import { createPrivilegedClient } from "@/lib/supabase/privileged";

export type AdminEngravingSettings = { pricePen: string; maxCharacters: number; active: boolean; categoryId: string };

function readPrice(value: unknown, field: string): string {
  const text = typeof value === "string" ? value.trim().replace(",", ".") : "";
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(text)) {
    throw new CheckoutError("INVALID_PRICE", "Introduce un precio desde S/ 0.00, con un máximo de dos decimales.", 422, field);
  }
  // numeric(12,2): integer cents are still safely representable in JavaScript.
  return (Math.round(Number(text) * 100) / 100).toFixed(2);
}

function settings(row: { unit_surcharge_pen: number; max_characters: number; is_active: boolean; categories: unknown }): AdminEngravingSettings {
  const category = (Array.isArray(row.categories) ? row.categories[0] : row.categories) as { id: string } | null;
  if (!category?.id) throw new CheckoutError("SETTINGS_UNAVAILABLE", "No se pudo identificar la categoría del grabado.", 503);
  return { pricePen: Number(row.unit_surcharge_pen).toFixed(2), maxCharacters: row.max_characters, active: row.is_active, categoryId: category.id };
}

export async function getAdminEngravingSettings(): Promise<AdminEngravingSettings> {
  await requireAdmin();
  const { data, error } = await createPrivilegedClient().from("checkout_customization_rules")
    .select("unit_surcharge_pen,max_characters,is_active,categories(id)").eq("mode", "urn_name").eq("category_slug", "urnas").maybeSingle();
  if (error) throw new CheckoutError("SETTINGS_UNAVAILABLE", "No se pudo cargar el precio del grabado. Inténtalo de nuevo.", 503);
  if (!data) throw new CheckoutError("SETTINGS_NOT_FOUND", "No hay una configuración de grabado de urnas disponible.", 404);
  return settings(data);
}

export async function updateAdminEngravingSettings(body: unknown): Promise<AdminEngravingSettings> {
  await requireAdmin();
  const input = readObject(body, ["pricePen", "expectedPricePen"]);
  const pricePen = readPrice(input.pricePen, "pricePen");
  const expectedPricePen = readPrice(input.expectedPricePen, "expectedPricePen");
  // Only this field and rule can be edited. The browser never receives the server key.
  // Comparing the old price in the UPDATE avoids silently overwriting another admin.
  const { data, error } = await createPrivilegedClient().from("checkout_customization_rules")
    .update({ unit_surcharge_pen: pricePen }).eq("mode", "urn_name").eq("category_slug", "urnas")
    .eq("unit_surcharge_pen", expectedPricePen).select("unit_surcharge_pen,max_characters,is_active,categories(id)").maybeSingle();
  if (error) throw new CheckoutError("SETTINGS_UNAVAILABLE", "No se pudo confirmar el guardado. Vuelve a cargar el precio antes de reintentar.", 503);
  if (!data) throw new CheckoutError("SETTINGS_CHANGED", "El precio cambió o la configuración ya no está disponible. Carga el precio actual y revisa tu cambio antes de guardar.", 409);
  return settings(data);
}
