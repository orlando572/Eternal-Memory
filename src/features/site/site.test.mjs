import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import ts from "typescript";

function loadSource(path, mocks = {}) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", outputText)((name) => mocks[name], loaded, loaded.exports);
  return loaded.exports;
}

const { footerContact } = loadSource("../footer/footerContent.ts");
const whatsapp = loadSource("./lib/whatsapp.ts");
const delivery = loadSource("./lib/deliveryInfo.ts");
const content = loadSource("./content/siteContent.ts", { "@/features/footer/footerContent": { footerContact } });
const migration = readFileSync(new URL("../../../supabase/migrations/20261021175829_checkout_orders.sql", import.meta.url), "utf8");

test("los canales son los reales y no quedan datos provisionales", () => {
  assert.equal(footerContact.phone, "+51 931 422 236");
  assert.equal(footerContact.phoneHref, "tel:+51931422236");
  assert.equal(footerContact.whatsappUrl, "https://wa.me/51931422236");
  assert.equal("email" in footerContact, false);
  const all = JSON.stringify([footerContact, content]);
  for (const placeholder of ["900 000 000", "900000000", "contacto@eternalmemory.pe", "mailto:"]) assert.ok(!all.includes(placeholder), placeholder);
  assert.deepEqual(all.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) ?? [], []);
});

test("las páginas y sus textos no prometen plazos, atención 24/7 ni stock garantizado", () => {
  const text = [content.aboutPage, content.privacyPage, content.termsPage].map((page) => JSON.stringify(page)).join(" ").toLowerCase();
  for (const promise of ["24/7", "24 horas", "24h", "garantizamos", "entrega inmediata", "mismo día", "stock garantizado", "en línea todavía no"]) {
    assert.ok(!text.includes(promise), promise);
  }
  assert.ok(content.termsPage.sections.some((section) => /no garantiza una fecha de entrega/.test(section.text)));
});

test("la política de privacidad explica que el formulario no guarda el mensaje y los términos describen la reserva y el pago", () => {
  const privacy = JSON.stringify(content.privacyPage);
  assert.match(privacy, /no guarda lo que escribes/);
  assert.match(privacy, /Stripe/);
  assert.match(JSON.stringify(content.termsPage), /30 minutos/);
});

test("cada página comercial tiene ruta, título y descripción", () => {
  for (const page of [content.aboutPage, content.privacyPage, content.termsPage]) {
    assert.match(page.path, /^\/[a-z]+$/);
    assert.ok(page.title && page.description && page.sections.length >= 3);
    assert.ok(existsSync(new URL(`../../app${page.path}/page.tsx`, import.meta.url)), page.path);
  }
  for (const path of ["/contacto", "/envios"]) assert.ok(existsSync(new URL(`../../app${path}/page.tsx`, import.meta.url)), path);
});

test("el formulario valida el nombre y la consulta", () => {
  const ok = whatsapp.readContactInput("  Evelyn   Pérez ", "Quisiera consultar por una urna de roble.");
  assert.deepEqual(ok, { ok: true, value: { name: "Evelyn Pérez", message: "Quisiera consultar por una urna de roble." } });
  const bad = whatsapp.readContactInput("E", "corto");
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.name && bad.errors.message);
  assert.equal(whatsapp.readContactInput("Evelyn", "x".repeat(501)).ok, false);
  assert.equal(whatsapp.readContactInput("x".repeat(81), "Una consulta válida").ok, false);
});

test("el mensaje se limpia de caracteres de control y conserva los saltos de línea", () => {
  const cleaned = whatsapp.cleanMessage("Hola\u0000   mundo\r\n\r\n\r\n\r\nSegunda\tlínea​");
  assert.equal(cleaned, "Hola mundo\n\nSegunda línea");
  assert.equal(whatsapp.cleanName("Ana\u0007\n María"), "Ana María");
});

test("el enlace abre WhatsApp con el texto escrito hacia el número real", () => {
  const url = whatsapp.buildWhatsAppUrl(footerContact.whatsappUrl, { name: "Evelyn", message: "¿Tienen urnas de roble?\nGracias" });
  assert.ok(url.startsWith("https://wa.me/51931422236?text="));
  const text = decodeURIComponent(url.split("?text=")[1]);
  assert.equal(text, "Hola, soy Evelyn. Escribo desde la web de Eternal Memory.\n\n¿Tienen urnas de roble?\nGracias");
  assert.ok(!url.includes(" ") && !url.includes("\n"));
});

test("el enlace de WhatsApp solo se construye sobre wa.me", () => {
  for (const base of ["https://evil.test/51931422236", "http://wa.me/51931422236", "https://wa.me/abc", "javascript:alert(1)", "https://wa.me/51931422236?x=1"]) {
    assert.throws(() => whatsapp.buildWhatsAppUrl(base, { name: "A", message: "B" }), /INVALID_WHATSAPP_URL/);
  }
});

test("las tarifas mostradas son solo las activas y con precio, con Arequipa primero", () => {
  const rates = delivery.toDeliveryRates([
    { zone: "rest_of_peru", price_pen: "25.00", is_active: true },
    { zone: "arequipa_province", price_pen: 10, is_active: true },
  ]);
  assert.deepEqual(rates.map((rate) => [rate.zone, rate.pricePen]), [["arequipa_province", 10], ["rest_of_peru", 25]]);
  assert.deepEqual(delivery.toDeliveryRates([
    { zone: "arequipa_province", price_pen: null, is_active: true },
    { zone: "rest_of_peru", price_pen: "25.00", is_active: false },
    { zone: "otra_zona", price_pen: "5.00", is_active: true },
  ]), []);
  assert.equal(delivery.formatPen(10), "S/ 10.00");
});

test("las zonas sin cobertura coinciden con las de la migración de checkout", () => {
  const uncovered = [...migration.matchAll(/\('(\d{6})','[^']*','[^']*','[^']*',false\)/g)].map((match) => match[1]);
  assert.ok(uncovered.length > 0);
  const listed = delivery.UNCOVERED_AREAS.map((area) => area.ubigeoPrefix);
  for (const ubigeo of uncovered) assert.ok(listed.some((prefix) => ubigeo.startsWith(prefix)), `${ubigeo} no está listado`);
  for (const prefix of listed) assert.ok(uncovered.some((ubigeo) => ubigeo.startsWith(prefix)), `${prefix} no existe en la migración`);
});
