import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function loadSource(path) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const loaded = { exports: {} };
  new Function("module", "exports", outputText)(loaded, loaded.exports);
  return loaded.exports;
}

const gallery = loadSource("./data/productGallery.ts");
const saved = (id, storagePath, extra = {}) => ({ id, storagePath, externalUrl: null, altText: "", isReference: true, ...extra });

test("acepta solo JPG, PNG o WebP de hasta 5 MB", () => {
  assert.equal(gallery.isAcceptedImageFile({ type: "image/png", size: 1024 }), true);
  assert.equal(gallery.isAcceptedImageFile({ type: "image/webp", size: 5 * 1024 * 1024 }), true);
  assert.equal(gallery.isAcceptedImageFile({ type: "image/jpeg", size: 5 * 1024 * 1024 + 1 }), false);
  assert.equal(gallery.isAcceptedImageFile({ type: "image/gif", size: 1024 }), false);
  assert.equal(gallery.isAcceptedImageFile({ type: "image/png", size: 0 }), false);
});

test("mover una imagen respeta el orden y elegir portada la lleva al inicio", () => {
  assert.deepEqual(gallery.moveGalleryItem(["a", "b", "c"], 2, 0), ["c", "a", "b"]);
  assert.deepEqual(gallery.moveGalleryItem(["a", "b", "c"], 0, 1), ["b", "a", "c"]);
  const same = ["a", "b"];
  assert.equal(gallery.moveGalleryItem(same, 0, 5), same);
});

test("el payload referencia imágenes guardadas por id y nuevas por ruta, en orden", () => {
  const payload = gallery.buildGalleryPayload(["id-1", "id-2"], [
    saved("", "admin/nueva.png", { altText: "Nueva", isReference: false }),
    saved("id-2", "admin/dos.png", { altText: "Dos" }),
  ]);
  assert.deepEqual(payload, {
    original_ids: ["id-1", "id-2"],
    items: [
      { storage_path: "admin/nueva.png", alt_text: "Nueva", is_reference: false },
      { id: "id-2", alt_text: "Dos", is_reference: true },
    ],
  });
});

test("una imagen nueva sin subir no se envía", () => {
  assert.throws(() => gallery.buildGalleryPayload([], [saved("", null)]), /IMAGE_UPLOAD_MISSING/);
});

test("detecta los archivos de imágenes quitadas o reemplazadas", () => {
  const before = [saved("1", "admin/a.png"), saved("2", "admin/b.png"), saved("3", null, { externalUrl: "https://x/c.png" })];
  const after = [saved("2", "admin/b.png"), saved("", "admin/nueva.png")];
  assert.deepEqual(gallery.removedStoragePaths(before, after), ["admin/a.png"]);
  assert.deepEqual(gallery.removedStoragePaths(before, before), []);
});

test("toGalleryItems copia las imágenes sin compartir referencias", () => {
  const images = [saved("1", "admin/a.png")];
  const [item] = gallery.toGalleryItems(images);
  assert.equal(item.key, "1");
  assert.equal(item.file, null);
  assert.notEqual(item.image, images[0]);
});
