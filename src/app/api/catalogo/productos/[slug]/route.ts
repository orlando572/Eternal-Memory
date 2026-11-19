import { getCatalogProduct } from "@/features/catalogo/services/catalogService";
import { catalogErrorResponse, catalogResponse } from "@/features/catalogo/services/catalogResponse";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await getCatalogProduct(slug);
    return product
      ? catalogResponse({ product })
      : catalogResponse({ error: { code: "PRODUCT_NOT_FOUND", message: "El producto no está disponible." } }, 404);
  } catch {
    return catalogErrorResponse();
  }
}
