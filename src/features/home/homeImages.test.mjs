import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import ts from "typescript";

function loadSource(path, mocks = {}) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", outputText)((name) => mocks[name], loaded, loaded.exports);
  return loaded.exports;
}

const footer = loadSource("../footer/footerContent.ts");
const home = loadSource("./homeContent.ts", { "@/features/footer/footerContent": footer });
const backgrounds = loadSource("../catalogo/lib/catalogBackground.ts");

const dir = new URL("../../../public/assets/banners/", import.meta.url);
const doc = readFileSync(new URL("../../../docs/recursos/imagenes-publicitarias.md", import.meta.url), "utf8");
const LIMIT = 250 * 1024;

// Medidas que pide TSK-40 para cada pieza.
const expected = {
  "banner-escritorio.webp": [1600, 600],
  "categoria-urnas.webp": [1600, 500],
  "categoria-ataudes.webp": [1600, 500],
  "categoria-relicarios.webp": [1600, 500],
  "categoria-arreglos-florales.webp": [1600, 500],
  "como-funciona.webp": [800, 800],
};

// Lee la medida de un WebP (con pérdida, sin pérdida o extendido) sin depender de librerías de imágenes.
function webpSize(buffer) {
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
  assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8 ") return [buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff];
  if (chunk === "VP8L") { const bits = buffer.readUInt32LE(21); return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1]; }
  if (chunk === "VP8X") return [buffer.readUIntLE(24, 3) + 1, buffer.readUIntLE(27, 3) + 1];
  throw new Error(`Formato WebP desconocido: ${chunk}`);
}

test("la carpeta de banners contiene exactamente las piezas esperadas", () => {
  assert.deepEqual(readdirSync(dir).sort(), Object.keys(expected).sort());
});

test("cada pieza tiene la medida pedida y pesa menos de 250 KB", () => {
  for (const [file, [width, height]] of Object.entries(expected)) {
    const path = new URL(file, dir);
    assert.deepEqual(webpSize(readFileSync(path)), [width, height], file);
    assert.ok(statSync(path).size < LIMIT, `${file} pesa ${Math.round(statSync(path).size / 1024)} KB`);
  }
});

test("el documento de origen y licencias nombra todas las piezas", () => {
  for (const file of Object.keys(expected)) assert.ok(doc.includes(`\`${file}\``), file);
  assert.match(doc, /Decisión sobre el origen/);
  assert.match(doc, /Pendiente de confirmar/);
});

test("las cabeceras del catálogo usan las imágenes nuevas y «todos» conserva la suya", () => {
  for (const slug of ["urnas", "ataudes", "relicarios", "arreglos-florales"]) {
    const src = backgrounds.getCatalogBackground(slug);
    assert.equal(src, `/assets/banners/categoria-${slug}.webp`);
    assert.ok(existsSync(new URL(`../../../public${src}`, import.meta.url)), src);
  }
  assert.equal(backgrounds.getCatalogBackground(null), "/assets/catalogo/backgrounds/todos.webp");
  assert.equal(backgrounds.getCatalogBackground("desconocida"), "/assets/catalogo/backgrounds/todos.webp");
});

test("la franja de la portada ya no carga la foto pesada del patio", () => {
  const sources = home.homeBanner.slides.map((slide) => slide.image.src);
  assert.ok(!sources.includes("/assets/plates/patio-view.png"));
  const slide = home.homeBanner.slides.find((item) => item.id === "orientacion");
  assert.deepEqual([slide.image.src, slide.image.width, slide.image.height], ["/assets/banners/banner-escritorio.webp", 1600, 600]);
});

test("«Cómo funciona» muestra su imagen como referencial", () => {
  const { image, referenceNote } = home.homeHowItWorks;
  assert.equal(image.src, "/assets/banners/como-funciona.webp");
  assert.deepEqual([image.width, image.height], [800, 800]);
  assert.equal(image.isReference, true);
  assert.equal(referenceNote, "Imagen referencial");
  assert.ok(existsSync(new URL(`../../../public${image.src}`, import.meta.url)));
});
