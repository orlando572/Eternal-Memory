export type ProductStatus = "draft" | "published" | "archived";

export interface AdminCategory {
  id: string;
  name: string;
  isActive: boolean;
}

export interface AdminVariantDraft {
  id: string;
  updatedAt?: string;
  name: string;
  sku: string;
  pricePen: string;
  stockOnHand: string;
  stockReserved: number;
  isActive: boolean;
}

export interface AdminProductDraft {
  id: string;
  updatedAt?: string;
  slug: string;
  name: string;
  categoryId: string;
  category: string;
  description: string;
  status: ProductStatus;
  variants: AdminVariantDraft[];
}

export function createEmptyProduct(): AdminProductDraft {
  return { id: "", slug: "", name: "", categoryId: "", category: "", description: "", status: "draft", variants: [] };
}
