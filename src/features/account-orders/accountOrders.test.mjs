import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadSource(path, mocks = {}) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name), loaded, loaded.exports,
  );
  return loaded.exports;
}

const validation = loadSource("../checkout/lib/validation.ts");
const lib = loadSource("./lib/accountOrders.ts");

const A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ADMIN = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const row = (n, customer, createdAt, extra = {}) => ({
  id: id(n), customer_id: customer, status: "paid", payment_status: "paid", created_at: createdAt,
  reservation_expires_at: "2026-11-19T13:00:00Z", total_pen: "135.00", subtotal_pen: "125.00", delivery_pen: "10.00",
  contact_name: "Cliente", contact_email: "cliente@example.com", contact_phone: "+51900000000",
  address_line: "Calle 1", address_detail: null, delivery_ubigeo: "040101",
  department: "Arequipa", province: "Arequipa", district: "Arequipa",
  order_items: [
    { line_key: "b", product_name: "Urna", variant_name: "Roble", quantity: 2, customization: null, base_unit_price_pen: "50.00", customization_unit_pen: "0", unit_price_pen: "50.00", line_total_pen: "100.00" },
    { line_key: "a", product_name: "Flores", variant_name: "Blancas", quantity: 1, customization: null, base_unit_price_pen: null, customization_unit_pen: null, unit_price_pen: "25.00", line_total_pen: "25.00" },
  ],
  order_status_history: [
    { id: 2, from_status: "pending_payment", to_status: "paid", created_at: "2026-11-19T12:05:00Z", reason: "interno", actor_id: ADMIN },
    { id: 1, from_status: null, to_status: "pending_payment", created_at: "2026-11-19T12:00:00Z", reason: null, actor_id: null },
  ],
  ...extra,
});

const rows = [
  row(1, A, "2026-11-01T10:00:00Z"),
  row(2, A, "2026-11-03T10:00:00Z"),
  row(3, B, "2026-11-02T10:00:00Z"),
  ...Array.from({ length: 12 }, (_, i) => row(10 + i, A, `2026-10-${String(10 + i).padStart(2, "0")}T10:00:00Z`)),
];

// Emula la política RLS de `orders`: cada persona ve las suyas y un administrador ve todas.
// Aplica además los filtros `eq`, `order` y `range` que pide el servicio.
function fakeClient({ userId, admin = false, fail = false }) {
  const calls = [];
  return {
    calls,
    from(table) {
      assert.equal(table, "orders");
      const state = { filters: [], sort: [], range: null };
      const run = () => {
        if (fail) return { data: null, error: { message: "boom" }, count: null };
        let visible = rows.filter((r) => admin || r.customer_id === userId);
        for (const [column, value] of state.filters) visible = visible.filter((r) => r[column] === value);
        for (const [column, ascending] of [...state.sort].reverse()) {
          visible = [...visible].sort((x, y) => (x[column] < y[column] ? -1 : x[column] > y[column] ? 1 : 0) * (ascending ? 1 : -1));
        }
        const count = visible.length;
        if (state.range) visible = visible.slice(state.range[0], state.range[1] + 1);
        return { data: visible, error: null, count };
      };
      const builder = {
        select(columns, options) { calls.push({ columns, options }); return builder; },
        eq(column, value) { state.filters.push([column, value]); return builder; },
        order(column, { ascending }) { state.sort.push([column, ascending]); return builder; },
        range(from, to) { state.range = [from, to]; calls.push({ range: [from, to] }); return builder; },
        maybeSingle() { const result = run(); return Promise.resolve({ ...result, data: result.data?.[0] ?? null }); },
        then(resolve, reject) { return Promise.resolve(run()).then(resolve, reject); },
      };
      return builder;
    },
  };
}

function serviceFor(session) {
  const client = fakeClient(session);
  const requireUser = async () => {
    if (!session.userId) { const error = new Error("Inicia sesión para continuar."); error.status = 401; throw error; }
    return { user: { id: session.userId }, role: session.admin ? "admin" : "user" };
  };
  const service = loadSource("./services/accountOrdersService.ts", {
    "server-only": {},
    "@/features/auth/services/accessService": { requireUser },
    "@/features/checkout/lib/validation": validation,
    "@/features/account-orders/lib/accountOrders": lib,
    "@/lib/supabase/server": { createClient: async () => client },
  });
  return { service, client };
}

test("el usuario A solo lista sus pedidos, del más reciente al más antiguo", async () => {
  const { service } = serviceFor({ userId: A });
  const list = await service.listAccountOrders(new URLSearchParams("porPagina=50"));
  assert.equal(list.total, 14);
  assert.ok(list.orders.every((order) => rows.find((r) => r.id === order.id).customer_id === A));
  assert.ok(!list.orders.some((order) => order.id === id(3)));
  assert.equal(list.orders[0].id, id(2));
  assert.equal(list.orders[1].id, id(1));
  assert.deepEqual(list.orders[0], { id: id(2), createdAt: "2026-11-03T10:00:00Z", status: "paid", paymentStatus: "paid", totalPen: 135, itemCount: 3 });
});

test("un administrador también recibe solo sus propios pedidos en «mis pedidos»", async () => {
  // La política RLS deja leer todos los pedidos a un administrador: el filtro por cuenta es el que lo evita.
  const { service } = serviceFor({ userId: ADMIN, admin: true });
  const list = await service.listAccountOrders(new URLSearchParams());
  assert.equal(list.total, 0);
  assert.deepEqual(list.orders, []);
});

test("el listado se pagina y los parámetros inválidos vuelven al valor por defecto", async () => {
  const { service, client } = serviceFor({ userId: A });
  const second = await service.listAccountOrders(new URLSearchParams("pagina=2&porPagina=5"));
  assert.deepEqual([second.page, second.pageSize, second.total, second.totalPages, second.orders.length], [2, 5, 14, 3, 5]);
  assert.deepEqual(client.calls.find((call) => call.range).range, [5, 9]);
  const bad = await service.listAccountOrders(new URLSearchParams("pagina=-1&porPagina=9999"));
  assert.deepEqual([bad.page, bad.pageSize, bad.orders.length], [1, 10, 10]);
  assert.deepEqual(lib.readOrderListParams(new URLSearchParams("pagina=abc&porPagina=0")), { page: 1, pageSize: 10 });
  assert.deepEqual(lib.readOrderListParams(new URLSearchParams("pagina=3&porPagina=50")), { page: 3, pageSize: 50 });
});

test("el usuario A no obtiene el pedido de B aunque conozca su identificador", async () => {
  const { service } = serviceFor({ userId: A });
  await assert.rejects(service.getAccountOrder(id(3)), { code: "ORDER_NOT_FOUND", status: 404 });
});

test("un pedido ajeno, uno inexistente y un identificador inválido responden igual", async () => {
  const { service } = serviceFor({ userId: A });
  const answers = [];
  for (const wanted of [id(3), id(999), "no-es-un-uuid"]) {
    await service.getAccountOrder(wanted).catch((error) => answers.push([error.code, error.status, error.message]));
  }
  assert.equal(answers.length, 3);
  assert.deepEqual(answers[1], answers[0]);
  assert.deepEqual(answers[2], answers[0]);
});

test("un administrador tampoco recibe el pedido de un cliente por esta ruta", async () => {
  const { service } = serviceFor({ userId: ADMIN, admin: true });
  await assert.rejects(service.getAccountOrder(id(1)), { code: "ORDER_NOT_FOUND", status: 404 });
});

test("el detalle del pedido propio incluye líneas, importes e historial ordenados", async () => {
  const { service } = serviceFor({ userId: A });
  const order = await service.getAccountOrder(id(1));
  assert.deepEqual([order.subtotalPen, order.deliveryPen, order.totalPen], [125, 10, 135]);
  assert.deepEqual(order.lines.map((line) => line.key), ["a", "b"]);
  assert.equal(order.lines[0].baseUnitPricePen, 25);
  assert.equal(order.lines[1].lineTotalPen, 100);
  assert.deepEqual(order.history.map((entry) => entry.toStatus), ["pending_payment", "paid"]);
  assert.deepEqual(Object.keys(order.history[0]).sort(), ["createdAt", "fromStatus", "toStatus"]);
  assert.equal(order.address.district, "Arequipa");
});

test("sin sesión no se consulta la base de datos", async () => {
  const { service, client } = serviceFor({ userId: null });
  await assert.rejects(service.listAccountOrders(new URLSearchParams()), { status: 401 });
  await assert.rejects(service.getAccountOrder(id(1)), { status: 401 });
  assert.equal(client.calls.length, 0);
});

test("un fallo de la base de datos no expone el error interno", async () => {
  const { service } = serviceFor({ userId: A, fail: true });
  for (const call of [() => service.listAccountOrders(new URLSearchParams()), () => service.getAccountOrder(id(1))]) {
    await assert.rejects(call(), (error) => error.code === "ORDERS_UNAVAILABLE" && error.status === 503 && !/boom/.test(error.message));
  }
});
