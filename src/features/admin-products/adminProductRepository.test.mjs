import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function loadSource(path, modules = {}) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const loaded = { exports: {} };
  const require = (name) => {
    if (!Object.hasOwn(modules, name)) throw new Error(`Módulo no previsto en la prueba: ${name}`);
    return modules[name];
  };
  new Function("module", "exports", "require", outputText)(loaded, loaded.exports, require);
  return loaded.exports;
}

const gallery = loadSource("./data/productGallery.ts");
const { createEmptyProduct } = loadSource("./data/adminProducts.ts");
const repository = loadSource("./data/adminProductRepository.ts", { "./productGallery": gallery });

const row = (extra = {}) => ({
  id: "p1", slug: "urna-serenidad", name: "Urna Serenidad", description: null,
  status: "published", is_featured: true, updated_at: "2026-11-18T00:00:00Z", category_id: "c1",
  categories: { id: "c1", name: "Urnas", is_active: true }, product_images: [], product_variants: [],
  ...extra,
});

function readClient(data) {
  const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data, error: null }) };
  return { from: () => query };
}

test("un producto nuevo empieza sin destacar", () => {
  assert.equal(createEmptyProduct().isFeatured, false);
});

test("recupera la marca de destacado guardada", async () => {
  assert.equal((await repository.getAdminProduct(readClient(row()), "p1")).isFeatured, true);
  assert.equal((await repository.getAdminProduct(readClient(row({ is_featured: false })), "p1")).isFeatured, false);
});

test("envía la marca de destacado al guardar", async () => {
  const calls = [];
  const client = { rpc: async (name, args) => { calls.push({ name, args }); return { data: "p1", error: null }; } };
  const product = { ...createEmptyProduct(), name: "Urna Serenidad", slug: "urna-serenidad", categoryId: "c1", isFeatured: true };
  assert.equal(await repository.saveAdminProduct(client, product), "p1");
  assert.equal(calls[0].name, "save_admin_product_with_images");
  assert.equal(calls[0].args.payload.is_featured, true);

  await repository.saveAdminProduct(client, { ...product, isFeatured: false });
  assert.equal(calls[1].args.payload.is_featured, false);
});
