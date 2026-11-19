import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

function loadSource(path, mocks = {}) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", outputText)((name) => (Object.hasOwn(mocks, name) ? mocks[name] : require(name)), loaded, loaded.exports);
  return loaded.exports;
}

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const lib = loadSource("./lib/floatingContact.ts");
let currentPath = "/";
const { WhatsAppFloat } = loadSource("./components/WhatsAppFloat.tsx", {
  "next/navigation": { usePathname: () => currentPath },
  "@/features/contact-float/lib/floatingContact": lib,
  "@/features/contact-float/contact-float.css": {},
});

const WA = "https://wa.me/51931422236";
const PHONE = "+51 931 422 236";
const render = (path) => { currentPath = path; return renderToStaticMarkup(React.createElement(WhatsAppFloat, { whatsappUrl: WA, phone: PHONE })); };

test("se oculta en /admin y en todo /checkout, y se muestra en el resto de la tienda", () => {
  for (const path of ["/admin", "/admin/productos", "/admin/pedidos/abc", "/checkout", "/checkout/resultado"]) {
    assert.equal(lib.isFloatingContactHidden(path), true, path);
    assert.equal(render(path), "", path);
  }
  for (const path of ["/", "/catalogo", "/catalogo/urna-roble", "/perfil/historial", "/contacto", "/administracion", "/checkout-info", "/login"]) {
    assert.equal(lib.isFloatingContactHidden(path), false, path);
    assert.match(render(path), /whatsapp-float/, path);
  }
  assert.equal(lib.isFloatingContactHidden(null), false);
});

test("es un enlace accesible por teclado con nombre accesible y que se abre de forma segura", () => {
  const html = render("/catalogo");
  assert.match(html, /^<a /);
  assert.match(html, /aria-label="Escribir por WhatsApp al \+51 931 422 236, abre una pestaña nueva"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /aria-hidden="true"/);
  assert.doesNotMatch(html, /tabindex="-1"/);
});

const MESSAGE = "Hola, vengo de la página de Eternal Memory, tengo una consulta:";

test("el enlace va al número con el mensaje indicado, igual en todas las páginas", () => {
  assert.equal(lib.FLOATING_MESSAGE, MESSAGE);
  for (const path of ["/", "/catalogo", "/catalogo/urna-roble"]) {
    const href = render(path).match(/href="([^"]+)"/)[1].replaceAll("&amp;", "&");
    assert.ok(href.startsWith(`${WA}?text=`), path);
    assert.equal(decodeURIComponent(href.split("?text=")[1]), MESSAGE, path);
    assert.ok(!/\s/.test(href), path);
  }
});

test("el mensaje no incluye direcciones del sitio ni datos de la persona", () => {
  assert.doesNotMatch(lib.FLOATING_MESSAGE, /https?:|localhost|@/);
});

test("solo se construye sobre enlaces wa.me", () => {
  for (const base of ["https://evil.test/51931422236", "http://wa.me/51931422236", "https://wa.me/abc", "javascript:alert(1)", "https://wa.me/51931422236?x=1"]) {
    assert.throws(() => lib.buildFloatingUrl(base), /INVALID_WHATSAPP_URL/);
  }
});

const globals = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");
const css = readFileSync(new URL("./contact-float.css", import.meta.url), "utf8");

test("el botón queda sobre la barra «Añadir» y bajo el carrito lateral, y se sube en móvil si esa barra existe", () => {
  const zOf = (source, selector) => Number(source.match(new RegExp(`${selector.replace(".", "\\.")}[^}]*z-index:\\s*(\\d+)`))[1]);
  const float = zOf(css, ".whatsapp-float");
  assert.ok(float > zOf(globals, ".detail-mobile-sticky-add"), "por encima de la barra «Añadir»");
  assert.ok(float < zOf(globals, ".cart-overlay"), "por debajo del carrito lateral");
  assert.match(css, /@media \(max-width: 740px\)[\s\S]*body:has\(\.detail-mobile-sticky-add\) \.whatsapp-float \{ bottom: calc\(84px/);
  assert.match(css, /right: max\(16px, env\(safe-area-inset-right\)\)/);
  assert.match(css, /:focus-visible/);
});
