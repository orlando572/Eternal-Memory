import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);

function loadSource(path, mocks = {}) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name), loaded, loaded.exports,
  );
  return loaded.exports;
}

const validation = loadSource("../checkout/lib/validation.ts");
const checkoutClient = loadSource("../checkout/lib/checkoutClient.ts", { "@/features/checkout/lib/validation": validation });
const presentation = loadSource("./lib/orderPresentation.ts");
const shared = {
  "next/link": { __esModule: true, default: ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children) },
  "@/components/ui/button": { Button: ({ asChild, children }) => (asChild ? children : React.createElement("button", null, children)) },
  "@/features/checkout/lib/checkoutClient": checkoutClient,
  "@/features/account-orders/lib/orderPresentation": presentation,
};
const { OrderHistoryList } = loadSource("./components/OrderHistoryList.tsx", shared);
const { OrderDetailView } = loadSource("./components/OrderDetailView.tsx", shared);
const html = (element) => renderToStaticMarkup(element);

const ID1 = "96436d50-a677-446c-88b9-98771ed7ef08";
const ID2 = "0db73544-9e9e-48c5-b512-ab9e78aedda2";
const summary = (id, status, paymentStatus, totalPen, itemCount) => ({ id, createdAt: "2026-11-19T01:23:33.259871+00:00", status, paymentStatus, totalPen, itemCount });
const list = (orders, extra = {}) => ({ orders, page: 1, pageSize: 10, total: orders.length, totalPages: 1, ...extra });

test("el número corto y la fecha se presentan en horario de Perú", () => {
  assert.equal(presentation.shortOrderNumber(ID1), "#96436D50");
  assert.match(presentation.formatOrderDate("2026-11-19T01:23:33.259871+00:00"), /18/);
  assert.match(presentation.formatOrderDate("2026-11-19T01:23:33+00:00"), /8:23/);
  assert.equal(presentation.formatOrderDate("no es una fecha"), "Fecha no disponible");
});

test("los enlaces del historial y los estados se agrupan", () => {
  assert.equal(presentation.orderDetailHref(ID1), `/perfil/historial/${ID1}`);
  assert.equal(presentation.historyPageHref(1), "/perfil/historial");
  assert.equal(presentation.historyPageHref(3), "/perfil/historial?pagina=3");
  assert.deepEqual(["paid", "processing", "pending_payment", "canceled", "review_required", "otro"].map(presentation.statusTone), ["ok", "ok", "pending", "canceled", "review", "review"]);
  assert.deepEqual([presentation.unitsLabel(1), presentation.unitsLabel(3)], ["1 unidad", "3 unidades"]);
});

test("una cuenta sin pedidos ve «Aún no tienes pedidos» y un enlace al catálogo", () => {
  const output = html(React.createElement(OrderHistoryList, { list: list([]) }));
  assert.match(output, /Aún no tienes pedidos/);
  assert.match(output, /href="\/catalogo"/);
  assert.doesNotMatch(output, /orders-list/);
});

test("cada tarjeta muestra número corto, fecha, total y estados con las etiquetas existentes", () => {
  const output = html(React.createElement(OrderHistoryList, { list: list([summary(ID1, "pending_payment", "pending", 790, 3), summary(ID2, "paid", "paid", 2680, 1)]) }));
  assert.match(output, /Pedido #96436D50/);
  assert.match(output, /Pedido #0DB73544/);
  assert.match(output, new RegExp(`href="/perfil/historial/${ID1}"`));
  assert.match(output, new RegExp(`href="/perfil/historial/${ID2}"`));
  assert.match(output, /S\/ 790\.00/);
  assert.match(output, /S\/ 2680\.00/);
  assert.match(output, /Pendiente de pago/);
  assert.match(output, /Pagado/);
  assert.match(output, /Confirmado/);
  assert.match(output, /3 unidades/);
  assert.match(output, /1 unidad</);
  assert.doesNotMatch(output, /Paginación/);
});

test("la paginación enlaza a la página anterior y a la siguiente", () => {
  const output = html(React.createElement(OrderHistoryList, { list: list([summary(ID1, "paid", "paid", 100, 1)], { page: 2, total: 25, totalPages: 3 }) }));
  assert.match(output, /Página 2 de 3/);
  assert.match(output, /href="\/perfil\/historial" rel="prev"/);
  assert.match(output, /href="\/perfil\/historial\?pagina=3" rel="next"/);
  const first = html(React.createElement(OrderHistoryList, { list: list([summary(ID1, "paid", "paid", 100, 1)], { page: 1, total: 25, totalPages: 3 }) }));
  assert.doesNotMatch(first, /rel="prev"/);
});

const detail = (overrides = {}) => ({
  id: ID1, createdAt: "2026-11-19T01:23:33+00:00", status: "paid", paymentStatus: "paid", reservationExpiresAt: "2026-11-19T01:53:33+00:00",
  contact: { name: "Evelyn", email: "e@example.com", phone: "+51900000000" },
  address: { line: "Calle 1 123", detail: "Frente al parque", ubigeo: "040101", department: "Arequipa", province: "Arequipa", district: "Cercado" },
  subtotalPen: 780, deliveryPen: 10, totalPen: 790,
  lines: [{ key: "a", productName: "Urna Roble", variantName: "Mediana", quantity: 2, customization: { mode: "urn_name", text: "María Pérez" }, baseUnitPricePen: 365, customizationUnitPen: 25, unitPricePen: 390, lineTotalPen: 780 }],
  history: [
    { fromStatus: null, toStatus: "pending_payment", createdAt: "2026-11-19T01:23:33+00:00" },
    { fromStatus: "pending_payment", toStatus: "paid", createdAt: "2026-11-19T01:25:00+00:00" },
  ],
  ...overrides,
});

test("el detalle muestra líneas, grabado, dirección, importes y la línea de tiempo en orden", () => {
  const output = html(React.createElement(OrderDetailView, { order: detail() }));
  assert.match(output, /Pedido #96436D50/);
  assert.match(output, /Urna Roble/);
  assert.match(output, /Mediana · 2 unidades/);
  assert.match(output, /Nombre a grabar: María Pérez/);
  assert.match(output, /S\/ 780\.00/);
  assert.match(output, /Envío/);
  assert.match(output, /S\/ 790\.00/);
  assert.match(output, /Calle 1 123, Frente al parque/);
  assert.match(output, /Cercado, Arequipa, Arequipa/);
  assert.ok(output.indexOf("Pendiente de pago</p><time") < output.indexOf("Pagado</p><time"), "la línea de tiempo va del más antiguo al más reciente");
});

test("sin cambios de estado el detalle lo indica y no muestra el correo ni datos internos", () => {
  const output = html(React.createElement(OrderDetailView, { order: detail({ history: [] }) }));
  assert.match(output, /Todavía no hay cambios de estado registrados/);
  assert.doesNotMatch(output, /e@example\.com/);
});
