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
const lib = loadSource("./lib/adminOrders.ts", { "@/features/account-orders/lib/accountOrders": accountOrders });
const transitions = loadSource("./lib/orderTransitions.ts");

const params = (query) => new URLSearchParams(query);
const ADMIN = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

test("los filtros válidos se leen de la URL", () => {
  assert.deepEqual(lib.readAdminOrderFilters(params("estado=paid&desde=2026-11-01&hasta=2026-11-18&q=%20Ana%20%20Ruiz%20&pagina=3")), {
    status: "paid", from: "2026-11-01", to: "2026-11-18", query: "Ana Ruiz", page: 3,
  });
});

test("los filtros inválidos se ignoran en lugar de fallar", () => {
  const empty = { status: null, from: null, to: null, query: "", page: 1 };
  assert.deepEqual(lib.readAdminOrderFilters(params("")), empty);
  assert.deepEqual(lib.readAdminOrderFilters(params("estado=enviado&desde=2026-02-31&hasta=18/11/2026&pagina=0")), empty);
  assert.deepEqual(lib.readAdminOrderFilters(params("estado=PAID&desde=1999-12-31&pagina=-2&q=")), empty);
  assert.equal(lib.readAdminOrderFilters(params("pagina=1e3")).page, 1);
  assert.equal(lib.readAdminOrderFilters(params("pagina=999999")).page, 1);
});

test("un rango de fechas invertido se ordena", () => {
  const filters = lib.readAdminOrderFilters(params("desde=2026-11-18&hasta=2026-11-01"));
  assert.equal(filters.from, "2026-11-01");
  assert.equal(filters.to, "2026-11-18");
});

test("la búsqueda se limpia y se acota", () => {
  assert.equal(lib.normalizeSearch("  ana\u0000​  ruiz "), "ana ruiz");
  assert.equal([...lib.normalizeSearch("x".repeat(200))].length, lib.ADMIN_SEARCH_MAX_LENGTH);
  assert.equal(lib.normalizeSearch(null), "");
});

test("las fechas se interpretan en horario de Perú e incluyen el día final completo", () => {
  assert.deepEqual(lib.limaDayRange("2026-11-01", "2026-11-30"), { gte: "2026-11-01T00:00:00-05:00", lt: "2026-12-01T00:00:00-05:00" });
  assert.deepEqual(lib.limaDayRange(null, "2026-12-31"), { lt: "2027-01-01T00:00:00-05:00" });
  assert.deepEqual(lib.limaDayRange("2028-02-28", "2028-02-28"), { gte: "2028-02-28T00:00:00-05:00", lt: "2028-02-29T00:00:00-05:00" });
  assert.deepEqual(lib.limaDayRange(null, null), {});
});

test("el número del pedido se busca como un rango de identificadores", () => {
  assert.equal(lib.buildOrderSearchFilter("#1A2B3C4D"), "and(id.gte.1a2b3c4d-0000-0000-0000-000000000000,id.lte.1a2b3c4d-ffff-ffff-ffff-ffffffffffff)");
  assert.equal(lib.buildOrderSearchFilter("#1a2"), "and(id.gte.1a200000-0000-0000-0000-000000000000,id.lte.1a2fffff-ffff-ffff-ffff-ffffffffffff)");
  // Sin «#», un texto hexadecimal puede ser un número o parte de un nombre: se buscan ambos.
  assert.equal(lib.buildOrderSearchFilter("bea"), 'contact_name.ilike."*bea*",contact_email.ilike."*bea*",and(id.gte.bea00000-0000-0000-0000-000000000000,id.lte.beafffff-ffff-ffff-ffff-ffffffffffff)');
});

test("el texto de búsqueda no puede inyectar comodines ni romper el filtro", () => {
  assert.equal(lib.buildOrderSearchFilter("ana@correo.pe"), 'contact_name.ilike."*ana@correo.pe*",contact_email.ilike."*ana@correo.pe*"');
  assert.equal(lib.buildOrderSearchFilter('a*b%c"d\\e,f(g)h'), 'contact_name.ilike."*a b c d e f g h*",contact_email.ilike."*a b c d e f g h*"');
  assert.equal(lib.buildOrderSearchFilter('*%"'), null);
  assert.equal(lib.buildOrderSearchFilter(""), null);
  assert.equal(lib.buildOrderSearchFilter("#xyz"), 'contact_name.ilike."*#xyz*",contact_email.ilike."*#xyz*"');
});

test("los enlaces conservan los filtros y omiten la primera página", () => {
  assert.equal(lib.adminOrdersHref(), "/admin/pedidos");
  assert.equal(lib.adminOrdersHref({ status: "paid", query: "ana ruiz", from: "2026-11-01", to: null, page: 1 }), "/admin/pedidos?q=ana+ruiz&estado=paid&desde=2026-11-01");
  assert.equal(lib.adminOrdersHref({ page: 2, to: "2026-11-30" }), "/admin/pedidos?hasta=2026-11-30&pagina=2");
  assert.equal(lib.adminOrderHref(ADMIN), `/admin/pedidos/${ADMIN}`);
  assert.equal(lib.toSearchParams({ q: ["uno", "dos"], estado: "paid", vacio: undefined }).toString(), "q=uno&estado=paid");
});

test("las zonas de entrega tienen una etiqueta legible", () => {
  assert.equal(lib.deliveryZoneLabel("arequipa_province"), "Provincia de Arequipa");
  assert.equal(lib.deliveryZoneLabel("rest_of_peru"), "Resto del Perú");
  assert.equal(lib.deliveryZoneLabel("otra"), "Zona no disponible");
});

test("el panel ofrece solo las transiciones de TSK-15 para cada estado", () => {
  const targets = (from) => transitions.allowedTransitions(from).map((t) => t.to).sort();
  assert.deepEqual(targets("pending_payment"), ["canceled"]);
  assert.deepEqual(targets("paid"), ["canceled", "processing"]);
  assert.deepEqual(targets("processing"), ["canceled", "review_required", "shipped"]);
  assert.deepEqual(targets("review_required"), ["canceled", "processing"]);
  assert.deepEqual(targets("canceled"), []);
});

// Pedidos de prueba. El administrador los ve todos por la política RLS `orders_owner_or_admin_select`.
const id = (prefix, n) => `${prefix}-0000-4000-8000-${String(n).padStart(12, "0")}`;
const row = (orderId, extra = {}) => ({
  id: orderId, customer_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", status: "paid", payment_status: "paid",
  created_at: "2026-11-10T15:00:00Z", reservation_expires_at: "2026-11-10T15:30:00Z",
  total_pen: "135.00", subtotal_pen: "125.00", delivery_pen: "10.00", delivery_zone: "arequipa_province",
  contact_name: "Ana Ruiz", contact_email: "ana@correo.pe", contact_phone: "+51 900 000 000",
  address_line: "Calle 1", address_detail: null, delivery_ubigeo: "040101",
  department: "Arequipa", province: "Arequipa", district: "Arequipa",
  order_items: [
    { line_key: "b", product_name: "Urna", variant_name: "Roble", quantity: 2, customization: { mode: "urn_name", text: "María" }, base_unit_price_pen: "45.00", customization_unit_pen: "5.00", unit_price_pen: "50.00", line_total_pen: "100.00" },
    { line_key: "a", product_name: "Flores", variant_name: "Blancas", quantity: 1, customization: null, base_unit_price_pen: null, customization_unit_pen: null, unit_price_pen: "25.00", line_total_pen: "25.00" },
  ],
  order_status_history: [
    { id: 3, from_status: "paid", to_status: "processing", created_at: "2026-11-10T16:00:00Z", actor_id: ADMIN, reason: "Grabado revisado" },
    { id: 2, from_status: "pending_payment", to_status: "paid", created_at: "2026-11-10T15:05:00Z", actor_id: null, reason: null },
  ],
  ...extra,
});

const rows = [
  row(id("1a2b3c4d", 1), { created_at: "2026-11-01T05:00:00Z" }), // 1 de noviembre, 00:00 en Lima
  row(id("1a2b3c4e", 2), { created_at: "2026-11-01T04:59:59Z", contact_name: "Bruno Díaz", contact_email: "bruno@correo.pe" }), // 31 de octubre en Lima
  row(id("99999999", 3), { status: "shipped", created_at: "2026-11-18T12:00:00Z", contact_name: "Carla Soto", contact_email: "carla@correo.pe", delivery_zone: "rest_of_peru" }),
  ...Array.from({ length: 22 }, (_, i) => row(id("55555555", 10 + i), { status: "processing", created_at: `2026-11-${String(2 + (i % 15)).padStart(2, "0")}T12:00:00Z` })),
];

function matchesOr(r, filter) {
  const text = /contact_name\.ilike\."\*(.*?)\*"/.exec(filter)?.[1]?.toLowerCase();
  const range = /and\(id\.gte\.([^,]+),id\.lte\.([^)]+)\)/.exec(filter);
  return Boolean(text && (r.contact_name.toLowerCase().includes(text) || r.contact_email.toLowerCase().includes(text)))
    || Boolean(range && r.id >= range[1] && r.id <= range[2]);
}

function fakeClient({ fail = false } = {}) {
  const calls = [];
  return {
    calls,
    from(table) {
      assert.equal(table, "orders");
      const state = { where: [], sort: [], range: null };
      const run = () => {
        if (fail) return { data: null, error: { message: "relation \"orders\" does not exist" }, count: null };
        let visible = rows.filter((r) => state.where.every((predicate) => predicate(r)));
        for (const [column, ascending] of [...state.sort].reverse()) {
          visible = [...visible].sort((x, y) => (x[column] < y[column] ? -1 : x[column] > y[column] ? 1 : 0) * (ascending ? 1 : -1));
        }
        const count = visible.length;
        if (state.range) visible = visible.slice(state.range[0], state.range[1] + 1);
        return { data: visible, error: null, count };
      };
      const builder = {
        select(columns, options) { calls.push({ select: columns, options }); return builder; },
        eq(column, value) { calls.push({ eq: [column, value] }); state.where.push((r) => r[column] === value); return builder; },
        gte(column, value) { calls.push({ gte: [column, value] }); state.where.push((r) => new Date(r[column]) >= new Date(value)); return builder; },
        lt(column, value) { calls.push({ lt: [column, value] }); state.where.push((r) => new Date(r[column]) < new Date(value)); return builder; },
        or(filter) { calls.push({ or: filter }); state.where.push((r) => matchesOr(r, filter)); return builder; },
        order(column, { ascending }) { state.sort.push([column, ascending]); return builder; },
        range(from, to) { state.range = [from, to]; calls.push({ range: [from, to] }); return builder; },
        maybeSingle() { const result = run(); return Promise.resolve({ ...result, data: result.data?.[0] ?? null }); },
        then(resolve, reject) { return Promise.resolve(run()).then(resolve, reject); },
      };
      return builder;
    },
  };
}

function serviceFor({ role = "admin", fail = false } = {}) {
  const client = fakeClient({ fail });
  const requireAdmin = async () => {
    if (role === null) { const error = new Error("Inicia sesión para continuar."); error.status = 401; throw error; }
    if (role !== "admin") { const error = new Error("No tienes permisos de administrador para realizar esta acción."); error.status = 403; throw error; }
    return { user: { id: ADMIN }, role: "admin" };
  };
  const service = loadSource("./services/adminOrdersService.ts", {
    "server-only": {},
    "@/features/auth/services/accessService": { requireAdmin },
    "@/features/checkout/lib/validation": validation,
    "@/features/admin-orders/lib/adminOrders": lib,
    "@/lib/supabase/server": { createClient: async () => client },
  });
  return { service, client };
}

test("solo un administrador puede listar o abrir pedidos", async () => {
  for (const role of [null, "user"]) {
    const { service, client } = serviceFor({ role });
    await assert.rejects(service.listAdminOrders(params("")), { status: role === null ? 401 : 403 });
    await assert.rejects(service.getAdminOrder(rows[0].id), { status: role === null ? 401 : 403 });
    assert.equal(client.calls.length, 0, "no se consulta la base de datos sin permisos");
  }
});

test("el listado muestra todos los pedidos, del más reciente al más antiguo, paginados de 20 en 20", async () => {
  const { service } = serviceFor();
  const first = await service.listAdminOrders(params(""));
  assert.equal(first.total, rows.length);
  assert.equal(first.orders.length, 20);
  assert.equal(first.totalPages, 2);
  assert.equal(first.orders[0].id, rows[2].id);
  assert.deepEqual(first.orders[0], {
    id: rows[2].id, createdAt: "2026-11-18T12:00:00Z", status: "shipped", paymentStatus: "paid", totalPen: 135, itemCount: 3,
    customerName: "Carla Soto", customerEmail: "carla@correo.pe", deliveryZone: "rest_of_peru",
  });
  const second = await service.listAdminOrders(params("pagina=2"));
  assert.equal(second.orders.length, rows.length - 20);
  assert.equal(second.page, 2);
});

test("el listado filtra por estado y por días completos de Perú", async () => {
  const { service, client } = serviceFor();
  const shipped = await service.listAdminOrders(params("estado=shipped"));
  assert.deepEqual(shipped.orders.map((o) => o.id), [rows[2].id]);
  assert.ok(client.calls.some((call) => call.eq?.[0] === "status" && call.eq[1] === "shipped"));

  const firstDay = await service.listAdminOrders(params("desde=2026-11-01&hasta=2026-11-01"));
  assert.deepEqual(firstDay.orders.map((o) => o.id), [rows[0].id], "las 23:59 del 31 de octubre en Lima quedan fuera");
});

test("el listado busca por número, nombre o correo", async () => {
  const { service } = serviceFor();
  const byNumber = await service.listAdminOrders(params("q=%231A2B3C4D"));
  assert.deepEqual(byNumber.orders.map((o) => o.id), [rows[0].id]);
  const byPrefix = await service.listAdminOrders(params("q=%231a2b3c4"));
  assert.equal(byPrefix.total, 2);
  const byName = await service.listAdminOrders(params("q=bruno"));
  assert.deepEqual(byName.orders.map((o) => o.id), [rows[1].id]);
  const byEmail = await service.listAdminOrders(params("q=CARLA%40correo"));
  assert.deepEqual(byEmail.orders.map((o) => o.id), [rows[2].id]);
  const none = await service.listAdminOrders(params("q=nadie"));
  assert.equal(none.total, 0);
  assert.equal(none.totalPages, 1);
});

test("el detalle incluye contacto, zona, grabados y el historial con autor y motivo", async () => {
  const { service } = serviceFor();
  const order = await service.getAdminOrder(rows[0].id);
  assert.deepEqual(order.contact, { name: "Ana Ruiz", email: "ana@correo.pe", phone: "+51 900 000 000" });
  assert.equal(order.deliveryZone, "arequipa_province");
  assert.deepEqual(order.lines.map((line) => line.key), ["a", "b"]);
  assert.deepEqual(order.lines[1].customization, { mode: "urn_name", text: "María" });
  assert.equal(order.lines[1].customizationUnitPen, 5);
  assert.deepEqual(order.history, [
    { fromStatus: "pending_payment", toStatus: "paid", createdAt: "2026-11-10T15:05:00Z", actor: "system", reason: null },
    { fromStatus: "paid", toStatus: "processing", createdAt: "2026-11-10T16:00:00Z", actor: "admin", reason: "Grabado revisado" },
  ]);
});

test("un identificador inválido o inexistente responde 404 sin consultar datos ajenos", async () => {
  const { service, client } = serviceFor();
  await assert.rejects(service.getAdminOrder("no-es-un-uuid"), { code: "ORDER_NOT_FOUND", status: 404 });
  assert.equal(client.calls.length, 0);
  await assert.rejects(service.getAdminOrder("eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee"), { code: "ORDER_NOT_FOUND", status: 404 });
});

test("un fallo de la base de datos no muestra el error interno", async () => {
  const { service } = serviceFor({ fail: true });
  for (const run of [() => service.listAdminOrders(params("")), () => service.getAdminOrder(rows[0].id)]) {
    await assert.rejects(run(), (error) => {
      assert.equal(error.code, "ORDERS_UNAVAILABLE");
      assert.equal(error.status, 503);
      assert.ok(!error.message.includes("relation"));
      return true;
    });
  }
});
