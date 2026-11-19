import "server-only";

import { listRelatedCatalogProducts } from "@/features/catalogo/services/catalogService";
import type { CatalogProduct } from "@/features/catalogo/types/catalog";
import { createCatalogClient } from "@/lib/supabase/catalog";
import { createPrivilegedClient } from "@/lib/supabase/privileged";
import {
  RELATED_PRODUCTS_LIMIT,
  readEngravingOption,
  readShippingRates,
  selectRelatedProducts,
  type EngravingOption,
  type ShippingRate,
} from "@/features/products/lib/productDetail";

// Supplementary sections must never prevent the product itself from rendering.

export async function getRelatedProducts(product: CatalogProduct): Promise<CatalogProduct[]> {
  try {
    return selectRelatedProducts(await listRelatedCatalogProducts(product, RELATED_PRODUCTS_LIMIT), product.id);
  } catch {
    return [];
  }
}

// `delivery_rates` is public through RLS only for active zones with a price:
// the same rows `calculate_checkout` charges once per order.
export async function getShippingRates(): Promise<ShippingRate[]> {
  try {
    const { data, error } = await createCatalogClient().from("delivery_rates").select("zone,price_pen");
    return error ? [] : readShippingRates(data);
  } catch {
    return [];
  }
}

// Engraving rules are only readable server-side, as in the checkout options.
// Read-only: the active rule for the product's category, without user data.
// Returns `undefined` when the rule could not be checked.
export async function getEngravingOption(categorySlug: string): Promise<EngravingOption | null | undefined> {
  try {
    const { data, error } = await createPrivilegedClient().from("checkout_customization_rules")
      .select("unit_surcharge_pen,max_characters").eq("mode", "urn_name").eq("category_slug", categorySlug).eq("is_active", true).maybeSingle();
    if (error) return undefined;
    return data ? readEngravingOption(data) ?? undefined : null;
  } catch {
    return undefined;
  }
}
