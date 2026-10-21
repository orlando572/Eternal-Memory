import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminCategory, AdminProductDraft, ProductStatus, AdminProductImage } from "./adminProducts";

type ProductRow = {
  id: string; slug: string; name: string; description: string | null;
  status: ProductStatus; updated_at: string; category_id: string;
  categories: { id: string; name: string; is_active: boolean } | null;
  product_images: Array<{ id: string; storage_path: string | null; external_url: string | null; alt_text: string | null; is_reference: boolean; sort_order: number }>;
  product_variants: Array<{
    id: string; name: string; sku: string | null; price_pen: number; stock_on_hand: number;
    stock_reserved: number; is_active: boolean; sort_order: number; updated_at: string;
  }>;
};

const SELECT = "id,slug,name,description,status,updated_at,category_id,categories(id,name,is_active),product_images(id,storage_path,external_url,alt_text,is_reference,sort_order),product_variants(id,name,sku,price_pen,stock_on_hand,stock_reserved,is_active,sort_order,updated_at)";

function mapProduct(row: ProductRow): AdminProductDraft {
  return {
    id: row.id, updatedAt: row.updated_at, slug: row.slug, name: row.name,
    categoryId: row.category_id, category: row.categories?.name ?? "Sin categoría",
    description: row.description ?? "", status: row.status,
    images: [...row.product_images].sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id)).map((image) => ({
      id: image.id, storagePath: image.storage_path, externalUrl: image.external_url,
      altText: image.alt_text ?? "", isReference: image.is_reference,
    })),
    variants: [...row.product_variants].sort((a, b) => a.sort_order - b.sort_order).map((variant) => ({
      id: variant.id, updatedAt: variant.updated_at, name: variant.name, sku: variant.sku ?? "",
      pricePen: String(variant.price_pen), stockOnHand: String(variant.stock_on_hand),
      stockReserved: variant.stock_reserved, isActive: variant.is_active,
    })),
  };
}

export async function listAdminProducts(client: SupabaseClient): Promise<AdminProductDraft[]> {
  const { data, error } = await client.from("products").select(SELECT).order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as ProductRow[]).map(mapProduct);
}

export async function getAdminProduct(client: SupabaseClient, id: string): Promise<AdminProductDraft | null> {
  const { data, error } = await client.from("products").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data as unknown as ProductRow) : null;
}

export async function listAdminCategories(client: SupabaseClient): Promise<AdminCategory[]> {
  const { data, error } = await client.from("categories").select("id,name,is_active").order("sort_order");
  if (error) throw error;
  return (data ?? []).map((row) => ({ id: row.id, name: row.name, isActive: row.is_active }));
}

export async function saveAdminProduct(client: SupabaseClient, product: AdminProductDraft, cover?: { originalId: string | null; image: AdminProductImage | null }): Promise<string> {
  const { data, error } = await client.rpc("save_admin_product_with_image", {
    payload: {
      ...(cover ? { cover: { original_id: cover.originalId, image: cover.image ? { storage_path: cover.image.storagePath, external_url: cover.image.externalUrl, alt_text: cover.image.altText, is_reference: cover.image.isReference } : null } } : {}),
      id: product.id || null,
      updated_at: product.updatedAt,
      slug: product.slug,
      name: product.name,
      category_id: product.categoryId,
      description: product.description,
      status: product.status,
      variants: product.variants.filter((variant) =>
        variant.id && (!variant.id.startsWith("new-") || [variant.name, variant.sku, variant.pricePen, variant.stockOnHand].some((value) => value.trim()))
      ).map((variant) => ({
        id: variant.id.startsWith("new-") ? null : variant.id,
        updated_at: variant.updatedAt,
        name: variant.name,
        sku: variant.sku,
        price_pen: variant.pricePen.trim().replace(",", "."),
        stock_on_hand: variant.stockOnHand.trim(),
        is_active: variant.isActive,
      })),
    },
  });
  if (error) throw error;
  return data as string;
}
