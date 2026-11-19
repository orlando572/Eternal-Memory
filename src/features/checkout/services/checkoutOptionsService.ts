import "server-only";

import { requireUser } from "@/features/auth/services/accessService";
import { getCatalogProductsByIds } from "@/features/catalogo/services/catalogService";
import { CheckoutError, isUuid, readObject } from "@/features/checkout/lib/validation";
import type { CheckoutOptions } from "@/features/checkout/types/checkout";
import { createPrivilegedClient } from "@/lib/supabase/privileged";

export async function getCheckoutOptions(body: unknown): Promise<CheckoutOptions> {
  await requireUser();
  const { productIds } = readObject(body, ["productIds"]);
  if (!Array.isArray(productIds) || productIds.length < 1 || productIds.length > 50 || !productIds.every(isUuid)) {
    throw new CheckoutError("INVALID_CART", "Revisa los productos de tu selección.", 422, "lines");
  }
  const client = createPrivilegedClient();
  const locations: CheckoutOptions["locations"] = [];
  // PostgREST defaults to 1000 rows; fetch every page, including new districts.
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client.from("checkout_locations").select("ubigeo,department,province,district,is_covered").order("ubigeo").range(offset, offset + 999);
    if (error || !data) throw new CheckoutError("CHECKOUT_UNAVAILABLE", "No se pudieron cargar las zonas de entrega.", 503);
    locations.push(...data);
    if (data.length < 1000) break;
  }
  const [{ data: rules, error }, products] = await Promise.all([
    client.from("checkout_customization_rules").select("mode,category_slug,unit_surcharge_pen,max_characters").eq("is_active", true).eq("mode", "urn_name"),
    getCatalogProductsByIds([...new Set(productIds)]),
  ]);
  if (error || !rules || !locations.length) throw new CheckoutError("CHECKOUT_UNAVAILABLE", "No se pudieron cargar las opciones del pedido.", 503);
  return {
    locations,
    products: products.map((product) => {
      const rule = rules.find((item) => item.category_slug === product.category.slug);
      return { id: product.id, name: product.name, customization: rule ? { mode: "urn_name", unitSurchargePen: Number(rule.unit_surcharge_pen), maxCharacters: Math.min(rule.max_characters, 80) } : null };
    }),
  };
}
