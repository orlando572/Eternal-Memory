// Isolated PostgREST boundary fixture. Never connects to a Supabase project.
import { createServer } from "node:http";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const directory = mkdtempSync(join(tmpdir(), "eternal-cart-"));
const database = join(directory, "catalog.json");
export const productId = "11111111-1111-4111-8111-111111111111";
export const firstVariantId = "22222222-2222-4222-8222-222222222222";
export const secondVariantId = "33333333-3333-4333-8333-333333333333";
const initial = {
  unavailable: false,
  products: [{
    id: productId, slug: "urna-prueba", name: "Urna de prueba", description: "Catálogo de prueba aislado", status: "published",
    categories: { id: "44444444-4444-4444-8444-444444444444", slug: "urnas", name: "Urnas", is_active: true },
    product_variants: [
      { id: firstVariantId, name: "Bronce", price_pen: 10.50, stock_on_hand: 60, stock_reserved: 2, sort_order: 0, is_active: true },
      { id: secondVariantId, name: "Blanco", price_pen: 3.25, stock_on_hand: 60, stock_reserved: 1, sort_order: 1, is_active: true },
    ],
    product_images: [{ id: "image-test", external_url: "/assets/plates/product-marble-photo.png", storage_path: null, alt_text: "Imagen referencial", is_reference: true, sort_order: 0 }],
  }],
};
writeFileSync(database, JSON.stringify(initial));

type FixtureProduct = (typeof initial.products)[number];
type FixturePatch = { reset?: boolean; unavailable?: boolean; product?: Partial<FixtureProduct>; category?: Partial<FixtureProduct["categories"]>; variant?: Partial<FixtureProduct["product_variants"][number]>; variantId?: string; extraVariants?: FixtureProduct["product_variants"] };

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1:3101");
  response.setHeader("Content-Type", "application/json");
  const send = (status: number, data: unknown) => { response.statusCode = status; response.end(JSON.stringify(data)); };
  if (url.pathname === "/health") return send(200, {});
  if (url.pathname === "/fixture" && request.method === "PUT") {
    let body = "";
    for await (const chunk of request) body += chunk;
    const patch: FixturePatch = JSON.parse(body);
    const data: typeof initial = patch.reset ? structuredClone(initial) : JSON.parse(readFileSync(database, "utf8"));
    if (patch.unavailable !== undefined) data.unavailable = patch.unavailable;
    if (patch.product) Object.assign(data.products[0], patch.product);
    if (patch.category) Object.assign(data.products[0].categories, patch.category);
    if (patch.variant) {
      const variant = data.products[0].product_variants.find((item) => item.id === (patch.variantId ?? firstVariantId));
      if (variant) Object.assign(variant, patch.variant);
    }
    if (patch.extraVariants) data.products[0].product_variants.push(...patch.extraVariants);
    writeFileSync(database, JSON.stringify(data));
    return send(200, {});
  }
  const data: typeof initial = JSON.parse(readFileSync(database, "utf8"));
  if (data.unavailable) return send(503, { message: "Fixture unavailable" });
  // Read-only boundary: any attempted reservation, RPC, or mutation fails.
  if (request.method !== "GET" && request.method !== "HEAD") return send(405, { message: "Read-only fixture" });
  if (url.pathname.startsWith("/auth/")) return send(401, { message: "No session" });
  if (url.pathname !== "/rest/v1/products" && url.pathname !== "/rest/v1/categories") return send(404, {});
  if (url.pathname.endsWith("/categories")) return send(200, [data.products[0].categories].filter((item) => item.is_active));
  let products = data.products.filter((item) => item.status === "published" && item.categories.is_active);
  for (const field of ["slug", "id"] as const) {
    const filter = url.searchParams.get(field);
    if (filter?.startsWith("eq.")) products = products.filter((item) => item[field] === filter.slice(3));
    if (filter?.startsWith("in.(")) {
      const values = filter.slice(4, -1).split(",").map((value) => value.replaceAll('"', ""));
      products = products.filter((item) => values.includes(item[field]));
    }
  }
  products = products.map((item) => ({ ...item, product_variants: item.product_variants.filter((variant) => variant.is_active) }));
  response.setHeader("Content-Range", `0-${Math.max(0, products.length - 1)}/${products.length}`);
  if (request.headers.accept?.includes("vnd.pgrst.object")) return products[0] ? send(200, products[0]) : send(406, { code: "PGRST116", details: "0 rows", message: "No rows" });
  return send(200, products);
});
server.listen(3101, "127.0.0.1");
process.on("SIGTERM", () => { server.close(); rmSync(directory, { recursive: true, force: true }); process.exit(0); });
