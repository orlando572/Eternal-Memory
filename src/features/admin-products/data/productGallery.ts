import type { AdminProductImage } from "./adminProducts";

export const MAX_PRODUCT_IMAGES = 10;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** One image in the editor: saved (has id) or pending upload (has file). */
export interface GalleryItem {
  key: string;
  image: AdminProductImage;
  file: File | null;
  preview: string | null;
}

export function toGalleryItems(images: AdminProductImage[] = []): GalleryItem[] {
  return images.map((image) => ({ key: image.id, image: { ...image }, file: null, preview: null }));
}

export function isAcceptedImageFile(file: { type: string; size: number }) {
  return ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size > 0 && file.size <= MAX_IMAGE_BYTES;
}

export function moveGalleryItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export interface GalleryPayloadItem {
  id?: string;
  storage_path?: string;
  alt_text: string;
  is_reference: boolean;
}

/** Saved images are referenced by id; new uploads by their storage path. */
export function buildGalleryPayload(originalIds: string[], images: AdminProductImage[]) {
  return {
    original_ids: originalIds,
    items: images.map((image): GalleryPayloadItem => {
      const base = { alt_text: image.altText, is_reference: image.isReference };
      if (image.id) return { id: image.id, ...base };
      if (!image.storagePath) throw new Error("IMAGE_UPLOAD_MISSING");
      return { storage_path: image.storagePath, ...base };
    }),
  };
}

/** Storage files that the saved gallery no longer references. */
export function removedStoragePaths(before: AdminProductImage[], after: AdminProductImage[]): string[] {
  const kept = new Set(after.flatMap((image) => image.storagePath ? [image.storagePath] : []));
  return before.flatMap((image) => image.storagePath && !kept.has(image.storagePath) ? [image.storagePath] : []);
}
