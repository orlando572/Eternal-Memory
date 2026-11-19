import { listCatalogCategories } from "@/features/catalogo/services/catalogService";
import { catalogErrorResponse, catalogResponse } from "@/features/catalogo/services/catalogResponse";

export async function GET() {
  try {
    return catalogResponse({ categories: await listCatalogCategories() });
  } catch {
    return catalogErrorResponse();
  }
}
