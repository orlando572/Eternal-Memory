import { InvalidCartError, validateCart } from "@/features/cart/services/validateCart";

const headers = { "Cache-Control": "no-store" };
const MAX_BODY_BYTES = 32_768;

async function readBody(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new InvalidCartError();
  const reader = request.body?.getReader();
  if (!reader) throw new InvalidCartError();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) { await reader.cancel(); throw new InvalidCartError("El carrito excede el tamaño permitido."); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (error) {
    if (error instanceof InvalidCartError) throw error;
    throw new InvalidCartError();
  } finally { reader.releaseLock(); }
}

export async function POST(request: Request) {
  try {
    return Response.json(await validateCart(await readBody(request)), { headers });
  } catch (error) {
    const invalid = error instanceof InvalidCartError;
    return Response.json({ error: invalid ? error.message : "No se pudo validar el carrito. Reintenta en un momento." }, { status: invalid ? 400 : 503, headers });
  }
}
