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
const accountOrders = loadSource("../account-orders/lib/accountOrders.ts");
const adminOrders = loadSource("../admin-orders/lib/adminOrders.ts", { "@/features/account-orders/lib/accountOrders": accountOrders });
const lib = loadSource("./lib/adminSummary.ts", { "@/features/admin-orders/lib/adminOrders": adminOrders });

const variant = (overrides = {}) => ({
  id: "v1", name: "Mediana", stock_on_hand: 3, stock_reserved: 0, is_active: true,
  products: { id: "p1", name: "Urna Alba", status: "published" }, ...overrides,
});

test("el día de hoy se calcula en horario de Perú", () => {
  assert.equal(lib.limaToday(new Date("2026-11-19T04:59:59Z")), "2026-11-18", "las 23:59 en Lima siguen siendo el 18");
  assert.equal(lib.limaToday(new Date("2026-11-19T05:00:00Z")), "2026-11-19");
  assert.equal(lib.limaToday(new Date("2027-01-01T03:00:00Z")), "2026-12-31");
  assert.equal(lib.formatSummaryDay("2026-11-18"), "miércoles, 18 de noviembre");
});

test("una opción sin unidades libres está sin stock; las inactivas y archivadas no cuentan", () => {
  assert.equal(lib.isOutOfStock(variant()), false);
  assert.equal(lib.isOutOfStock(variant({ stock_on_hand: 0 })), true);
  assert.equal(lib.isOutOfStock(variant({ stock_on_hand: 2, stock_reserved: 2 })), true, "todo reservado por pedidos pendientes");
  assert.equal(lib.isOutOfStock(variant({ stock_on_hand: 0, is_active: false })), false);
  assert.equal(lib.isOutOfStock(variant({ stock_on_hand: 0, products: { id: "p1", name: "Urna", status: "archived" } })), false);
  assert.equal(lib.isOutOfStock(variant({ stock_on_hand: 0, products: null })), false);
});

test("el resumen de stock cuenta todas las opciones y muestra las primeras por orden", () => {
  const rows = [
    variant({ id: "a", name: "Grande", stock_on_hand: 0, products: { id: "p2", name: "Relicario Sol", status: "draft" } }),
    variant({ id: "b", name: "Pequeña", stock_on_hand: 0 }),
    variant({ id: "c", name: "Grande", stock_on_hand: 0 }),
    variant({ id: "d", name: "Mediana" }),
  ];
  const summary = lib.summarizeOutOfStock(rows, 2);
  assert.equal(summary.total, 3);
  assert.deepEqual(summary.variants, [
    { id: "a", name: "Grande", productId: "p2", productName: "Relicario Sol", productStatus: "draft" },
    { id: "c", name: "Grande", productId: "p1", productName: "Urna Alba", productStatus: "published" },
  ]);
  assert.deepEqual(lib.summarizeOutOfStock([]), { total: 0, variants: [] });
});

test("cada cifra enlaza al panel de pedidos con su filtro", () => {
  assert.deepEqual(lib.adminSummaryLinks("2026-11-18"), {
    paid: "/admin/pedidos?estado=paid",
    processing: "/admin/pedidos?estado=processing",
    today: "/admin/pedidos?desde=2026-11-18&hasta=2026-11-18",
  });
  assert.equal(lib.adminProductEditHref("p1"), "/admin/productos/p1/editar");
  assert.equal(lib.countLabel(1, "opción más", "opciones más"), "1 opción más");
  assert.equal(lib.countLabel(1200, "opción más", "opciones más"), "1,200 opciones más");
});

// Base de datos simulada: aplica los filtros que usa el servicio y registra cada consulta.
const tables = {
  orders: [
    { id: "11111111-1111-4111-8111-111111111111", status: "paid", payment_status: "paid", created_at: "2026-11-18T15:00:00Z", total_pen: "120.00", contact_name: "Ana Ruiz", contact_email: "ana@correo.pe", delivery_zone: "arequipa_province", order_items: [{ quantity: 2 }] },
    { id: "22222222-2222-4222-8222-222222222222", status: "processing", payment_status: "paid", created_at: "2026-11-17T20:00:00Z", total_pen: "80.00", contact_name: "Bruno Paz", contact_email: "bruno@correo.pe", delivery_zone: "rest_of_peru", order_items: [{ quantity: 1 }] },
    { id: "33333333-3333-4333-8333-333333333333", status: "pending_payment", payment_status: "pending", created_at: "2026-11-18T05:00:00Z", total_pen: "45.50", contact_name: "Carla Soto", contact_email: "carla@correo.pe", delivery_zone: "arequipa_province", order_items: [] },
    { id: "44444444-4444-4444-8444-444444444444", status: "paid", payment_status: "paid", created_at: "2026-11-18T04:59:00Z", total_pen: "60.00", contact_name: "Diego Rojas", contact_email: "diego@correo.pe", delivery_zone: "arequipa_province", order_items: [{ quantity: 1 }] },
  ],
  products: [{ id: "p1", status: "published" }, { id: "p2", status: "published" }, { id: "p3", status: "draft" }, { id: "p4", status: "archived" }],
  product_variants: [
    variant({ id: "v1", stock_on_hand: 0 }),
    variant({ id: "v2", name: "Grande", stock_on_hand: 4, stock_reserved: 4 }),
    variant({ id: "v3", name: "Única", stock_on_hand: 0, products: { id: "p4", name: "Urna antigua", status: "archived" } }),
    variant({ id: "v4", name: "Oculta", stock_on_hand: 0, is_active: false }),
    variant({ id: "v5", name: "Pequeña", stock_on_hand: 5 }),
  ],
};

const read = (row, column) => column.split(".").reduce((value, key) => value?.[key], row);

function fakeClient({ failTable = null } = {}) {
  const calls = [];
  return {
    calls,
    from(table) {
      const state = { table, where: [], sort: [], limit: null, head: false };
      calls.push(state);
      const run = () => {
        if (table === failTable) return { data: null, error: { message: `relation "${table}" does not exist` }, count: null };
        let visible = tables[table].filter((row) => state.where.every((predicate) => predicate(row)));
        for (const [column, ascending] of [...state.sort].reverse()) {
          visible = [...visible].sort((x, y) => (x[column] < y[column] ? -1 : x[column] > y[column] ? 1 : 0) * (ascending ? 1 : -1));
        }
        const count = visible.length;
        if (state.limit !== null) visible = visible.slice(0, state.limit);
        return { data: state.head ? null : visible, error: null, count: state.count ? count : null };
      };
      const builder = {
        select(columns, options = {}) { state.columns = columns; state.count = options.count === "exact"; state.head = Boolean(options.head); return builder; },
        eq(column, value) { state.where.push((row) => read(row, column) === value); return builder; },
        neq(column, value) { state.where.push((row) => read(row, column) !== value); return builder; },
        gte(column, value) { state.where.push((row) => new Date(row[column]) >= new Date(value)); return builder; },
        lt(column, value) { state.where.push((row) => new Date(row[column]) < new Date(value)); return builder; },
        order(column, { ascending }) { state.sort.push([column, ascending]); return builder; },
        limit(count) { state.limit = count; return builder; },
        then(resolve, reject) { return Promise.resolve(run()).then(resolve, reject); },
      };
      return builder;
    },
  };
}

function serviceFor({ role = "admin", failTable = null } = {}) {
  const client = fakeClient({ failTable });
  const requireAdmin = async () => {
    if (role === null) { const error = new Error("Inicia sesión para continuar."); error.status = 401; throw error; }
    if (role !== "admin") { const error = new Error("No tienes permisos de administrador para realizar esta acción."); error.status = 403; throw error; }
    return { user: { id: "admin" }, role: "admin" };
  };
  const service = loadSource("./services/adminSummaryService.ts", {
    "server-only": {},
    "@/features/auth/services/accessService": { requireAdmin },
    "@/features/checkout/lib/validation": validation,
    "@/features/admin-orders/lib/adminOrders": adminOrders,
    "@/features/admin-summary/lib/adminSummary": lib,
    "@/lib/supabase/server": { createClient: async () => client },
  });
  return { service, client };
}

const NOW = new Date("2026-11-18T22:00:00Z"); // 17:00 del 18 de noviembre en Lima

test("solo un administrador puede ver el resumen", async () => {
  for (const role of [null, "user"]) {
    const { service, client } = serviceFor({ role });
    await assert.rejects(service.getAdminSummary(NOW), { status: role === null ? 401 : 403 });
    assert.equal(client.calls.length, 0, "no se consulta la base de datos sin permisos");
  }
});

test("el resumen cuenta pedidos por atender, del día, productos y opciones sin stock", async () => {
  const { service, client } = serviceFor();
  const summary = await service.getAdminSummary(NOW);
  assert.equal(summary.today, "2026-11-18");
  assert.deepEqual(summary.orders, { paid: 2, processing: 1, today: 2 }, "el pedido de las 23:59 del 17 en Lima no es de hoy");
  assert.deepEqual(summary.products, { published: 2, draft: 1 });
  assert.equal(summary.outOfStock.total, 2);
  assert.deepEqual(summary.outOfStock.variants.map((v) => v.id), ["v2", "v1"]);
  // Los conteos no descargan filas.
  for (const call of client.calls.filter((c) => c.table !== "product_variants" && c.limit === null)) assert.equal(call.head, true);
});

test("los últimos pedidos llegan del más reciente al más antiguo, con su cliente", async () => {
  const { service } = serviceFor();
  const { recentOrders } = await service.getAdminSummary(NOW);
  assert.deepEqual(recentOrders.map((order) => order.id.slice(0, 1)), ["1", "3", "4", "2"]);
  assert.deepEqual(recentOrders[0], {
    id: tables.orders[0].id, createdAt: "2026-11-18T15:00:00Z", status: "paid", paymentStatus: "paid", totalPen: 120, itemCount: 2,
    customerName: "Ana Ruiz", customerEmail: "ana@correo.pe", deliveryZone: "arequipa_province",
  });
});

test("un fallo de la base de datos no muestra el error interno", async () => {
  for (const failTable of ["orders", "products", "product_variants"]) {
    const { service } = serviceFor({ failTable });
    await assert.rejects(service.getAdminSummary(NOW), (error) => {
      assert.equal(error.code, "SUMMARY_UNAVAILABLE");
      assert.equal(error.status, 503);
      assert.ok(!error.message.includes("relation"));
      return true;
    });
  }
});
