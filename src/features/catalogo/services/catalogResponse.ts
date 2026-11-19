import "server-only";

import { CatalogUnavailableError } from "@/features/catalogo/services/catalogService";

export function catalogResponse(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function catalogErrorResponse(): Response {
  return catalogResponse({ error: { code: "CATALOG_UNAVAILABLE", message: new CatalogUnavailableError().message } }, 503);
}
