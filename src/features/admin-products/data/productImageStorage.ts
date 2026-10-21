import type { SupabaseClient } from "@supabase/supabase-js";

const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function uploadProductImage(client: SupabaseClient, file: File): Promise<string> {
  const extension = EXTENSIONS[file.type];
  if (!extension || file.size === 0 || file.size > 5 * 1024 * 1024) throw new Error("IMAGE_INVALID");
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); }
  catch { throw new Error("IMAGE_INVALID"); }
  bitmap.close();
  const path = `admin/${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error("IMAGE_UPLOAD_FAILED");
  return path;
}

export async function removeUnusedProductImage(client: SupabaseClient, path: string): Promise<boolean> {
  // A previous request may have committed before its response was lost.
  // Never remove a file that is already referenced by a saved product.
  const { data, error } = await client.from("product_images").select("id").eq("storage_path", path).limit(1);
  if (error || !data || data.length) return false;
  const { error: removeError } = await client.storage.from("product-images").remove([path]);
  return !removeError;
}
