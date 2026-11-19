import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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

const footer = loadSource("../footer/footerContent.ts");
const home = loadSource("./homeContent.ts", { "@/features/footer/footerContent": footer });
const { homeHowItWorks, homeSupport, homeFeaturedCategories, homeFaq, homeContact, homeBanner } = home;

function collectText(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectText);
  if (value && typeof value === "object") return Object.values(value).flatMap(collectText);
  return [];
}

const sectionTexts = collectText([homeHowItWorks, homeSupport, homeFeaturedCategories, homeFaq, homeContact, homeBanner]);

test("las secciones no prometen plazos, atención continua, stock ni garantías", () => {
  const forbidden = [
    /24\s*\/\s*7/i, /24 horas/i, /\ben \d+ (?:horas|días|dias)\b/i, /mismo día/i, /entrega inmediata/i,
    /garantiz/i, /garantía/i, /stock asegurado/i, /siempre disponible/i, /devoluci/i, /reembols/i,
    /envío gratis/i, /gratuit/i, /tarjeta/i, /yape|plin/i,
  ];
  for (const text of sectionTexts) {
    for (const pattern of forbidden) assert.doesNotMatch(text, pattern, `«${text}» contiene ${pattern}`);
  }
});

test("toda mención del pago en línea aclara que no está habilitado", () => {
  const mentions = sectionTexts.filter((text) => /pago en línea/i.test(text));
  assert.ok(mentions.length > 0);
  for (const text of mentions) assert.match(text, /pago en línea (?:aún |todavía )?no está habilitado/i);
});

test("la reserva descrita coincide con los 30 minutos del checkout", () => {
  const reservations = sectionTexts.filter((text) => /reserva/i.test(text) && /minutos/i.test(text));
  assert.ok(reservations.length > 0);
  for (const text of reservations) assert.match(text, /30 minutos/);
});

test("el contacto usa solo los datos del pie de página", () => {
  assert.equal(homeContact.contact, footer.footerContact);
  const contactAnswer = homeFaq.items.find((item) => item.id === "contacto").answer;
  assert.ok(contactAnswer.includes(footer.footerContact.email));
  assert.ok(contactAnswer.includes(footer.footerContact.phone));
  assert.match(contactAnswer, /lunes a sábado, de 9:00 a 19:00/);
  const emails = sectionTexts.flatMap((text) => text.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) ?? []);
  const phones = sectionTexts.flatMap((text) => text.match(/\+\d[\d ]{6,}\d/g) ?? []);
  assert.ok(emails.every((email) => email === footer.footerContact.email));
  assert.ok(phones.every((phone) => phone === footer.footerContact.phone));
});

test("las preguntas frecuentes tienen identificadores únicos y respuesta", () => {
  const ids = homeFaq.items.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const item of homeFaq.items) {
    assert.ok(item.question.trim().endsWith("?"));
    assert.ok(item.answer.trim().length > 0);
  }
});

test("el banner es una sola franja completa, con enlace interno e imagen existente", () => {
  assert.equal(Array.isArray(homeBanner), false);
  for (const text of [homeBanner.kicker, homeBanner.title, homeBanner.text, homeBanner.action.label]) {
    assert.ok(text.trim().length > 0);
  }
  assert.match(homeBanner.action.href, /^\/(?!\/)/);
  assert.ok(existsSync(new URL(`../../../public${homeBanner.image.src}`, import.meta.url)), homeBanner.image.src);
  assert.ok(homeBanner.image.width > 0 && homeBanner.image.height > 0);
  if (homeBanner.image.isReference) assert.match(homeBanner.referenceNote, /referencial/i);
});

test("el banner no usa mensajes de presión comercial", () => {
  const pressure = [
    /oferta/i, /descuento/i, /solo hoy/i, /últimas unidades/i, /aprovecha/i,
    /por tiempo limitado/i, /no te lo pierdas/i, /urgente/i, /\d+\s*%/,
  ];
  for (const text of collectText(homeBanner)) {
    for (const pattern of pressure) assert.doesNotMatch(text, pattern, `«${text}» contiene ${pattern}`);
  }
});
