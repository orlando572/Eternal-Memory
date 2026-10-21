import { readCatalogSearchParams } from "@/features/catalogo/lib/catalogParams";
import { listCatalogProducts } from "@/features/catalogo/services/catalogService";
import { catalogErrorResponse, catalogResponse } from "@/features/catalogo/services/catalogResponse";

export async function GET(request: Request) {
  try {
    const params = readCatalogSearchParams(new URL(request.url).searchParams);
    return catalogResponse(await listCatalogProducts(params));
  } catch {
    return catalogErrorResponse();
  }
}
