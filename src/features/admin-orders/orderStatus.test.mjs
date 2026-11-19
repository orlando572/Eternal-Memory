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
const transitions = loadSource("./lib/orderTransitions.ts");
const migration = readFileSync(new URL("../../../supabase/migrations/20261119040000_admin_change_order_status.sql", import.meta.url), "utf8");

const STATUSES = ["pending_payment", "paid", "processing", "shipped", "completed", "canceled", "review_required"];
const allowed = (from, to) => transitions.findTransition(from, to) !== undefined;

test("el flujo normal avanza de a un paso y sin saltos", () => {
  assert.ok(allowed("paid", "processing") && allowed("processing", "shipped") && allowed("shipped", "completed"));
  assert.ok(!allowed("paid", "shipped") && !allowed("paid", "completed") && !allowed("processing", "completed"));
  assert.ok(!allowed("shipped", "processing") && !allowed("completed", "shipped"));
});

test("«pagado» nunca lo asigna un administrador", () => {
  for (const from of STATUSES) assert.ok(!allowed(from, "paid"), `${from} -> paid`);
  assert.ok(!transitions.isAdminTargetStatus("paid"));
  assert.ok(!transitions.isAdminTargetStatus("pending_payment"));
  assert.ok(!allowed("pending_payment", "processing"));
});

test("cualquier estado puede cancelarse con motivo, salvo el ya cancelado", () => {
  for (const from of STATUSES.filter((status) => status !== "canceled")) {
    assert.equal(transitions.findTransition(from, "canceled")?.reasonRequired, true, `${from} -> canceled`);
  }
  assert.ok(!allowed("canceled", "canceled"));
  for (const to of STATUSES) assert.ok(!allowed("canceled", to), `canceled -> ${to}`);
});

test("review_required y processing se alternan con motivo obligatorio", () => {
  assert.equal(transitions.findTransition("processing", "review_required")?.reasonRequired, true);
  assert.equal(transitions.findTransition("review_required", "processing")?.reasonRequired, true);
  assert.ok(!allowed("paid", "review_required") && !allowed("review_required", "shipped"));
});

test("los pasos normales no exigen motivo", () => {
  for (const [from, to] of [["paid", "processing"], ["processing", "shipped"], ["shipped", "completed"]]) {
    assert.equal(transitions.findTransition(from, to).reasonRequired, false);
  }
  assert.deepEqual(transitions.allowedTransitions("paid").map((t) => t.to).sort(), ["canceled", "processing"]);
  assert.deepEqual(transitions.allowedTransitions("canceled"), []);
});

test("el motivo se limpia y se rechaza si es demasiado largo o tiene caracteres de control", () => {
  assert.equal(transitions.normalizeReason("  Cliente desistió  "), "Cliente desistió");
  assert.equal(transitions.normalizeReason("   "), null);
  assert.equal(transitions.normalizeReason(undefined), null);
  assert.equal(transitions.normalizeReason(5), undefined);
  assert.equal(transitions.normalizeReason("a".repeat(501)), undefined);
  assert.equal(transitions.normalizeReason("a".repeat(500)), "a".repeat(500));
  assert.equal(transitions.normalizeReason("hola\u0000"), undefined);
});

function sqlTransitions() {
  const rows = [...migration.matchAll(/\('([a-z_]+)',\s*'([a-z_]+)',\s*(true|false)\)/g)];
  return rows.map(([, from, to, required]) => `${from}>${to}:${required}`).sort();
}

test("la migración y la lista de TypeScript permiten exactamente las mismas transiciones", () => {
  const code = transitions.ORDER_TRANSITIONS.map((t) => `${t.from}>${t.to}:${t.reasonRequired}`).sort();
  assert.ok(code.length > 0);
  assert.deepEqual(sqlTransitions(), code);
  assert.ok(!sqlTransitions().some((row) => row.includes(">paid:")));
});

test("la migración registra autor y motivo y solo la ejecuta el servidor", () => {
  assert.match(migration, /insert into public\.order_status_history \(order_id, from_status, to_status, actor_id, reason\)/);
  assert.match(migration, /Administrator role required/);
  assert.match(migration, /revoke all on function public\.admin_change_order_status\(uuid,uuid,text,text\)\s+from public, anon, authenticated;/);
  assert.match(migration, /grant execute on function public\.admin_change_order_status\(uuid,uuid,text,text\) to service_role;/);
});

// --- Servicio ---------------------------------------------------------------------------------

const ADMIN = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const ORDER = "00000000-0000-4000-8000-000000000001";

function serviceFor({ admin = true, rpcError = null, pendingSessions = [], expireFails = false, readRow = { id: ORDER, status: "processing", payment_status: "paid" } } = {}) {
  const log = { rpc: [], expired: [], clients: 0 };
  const client = {
    rpc: async (name, args) => { log.rpc.push({ name, args }); return { error: rpcError }; },
    from(table) {
      const builder = {
        select() { return builder; },
        eq() { return builder; },
        maybeSingle: async () => ({ data: table === "orders" ? readRow : null, error: null }),
        then(resolve, reject) { return Promise.resolve({ data: table === "payment_attempts" ? pendingSessions : [], error: null }).then(resolve, reject); },
      };
      return builder;
    },
  };
  const service = loadSource("./services/adminOrderStatusService.ts", {
    "server-only": {},
    "@/features/auth/services/accessService": { requireAdmin: async () => {
      if (!admin) { const error = new Error("No tienes permisos de administrador para realizar esta acción."); error.status = 403; throw error; }
      return { user: { id: ADMIN }, role: "admin" };
    } },
    "@/features/checkout/lib/validation": validation,
    "@/features/admin-orders/lib/orderTransitions": transitions,
    "@/lib/stripe/server": { createStripeClient: () => ({ checkout: { sessions: { expire: async (id) => { log.expired.push(id); if (expireFails) throw new Error("ya vencida"); } } } }) },
    "@/lib/supabase/privileged": { createPrivilegedClient: () => { log.clients += 1; return client; } },
  });
  return { service, log };
}

test("quien no es administrador no llega a la base de datos", async () => {
  const { service, log } = serviceFor({ admin: false });
  await assert.rejects(service.changeOrderStatus(ORDER, { status: "processing" }), { status: 403 });
  assert.equal(log.clients, 0);
});

test("el administrador sale de la sesión: el cuerpo no puede indicar otro autor", async () => {
  const { service, log } = serviceFor();
  await assert.rejects(service.changeOrderStatus(ORDER, { status: "processing", adminId: "otro", actor_id: "otro" }), { code: "INVALID_INPUT" });
  assert.equal(log.rpc.length, 0);
  await service.changeOrderStatus(ORDER, { status: "processing" });
  assert.equal(log.rpc[0].args.p_admin_id, ADMIN);
});

test("«paid», un estado desconocido y un identificador inválido se rechazan sin consultar la transición", async () => {
  const { service, log } = serviceFor();
  await assert.rejects(service.changeOrderStatus(ORDER, { status: "paid" }), { code: "INVALID_STATUS", status: 422 });
  await assert.rejects(service.changeOrderStatus(ORDER, { status: "pending_payment" }), { code: "INVALID_STATUS" });
  await assert.rejects(service.changeOrderStatus(ORDER, { status: "enviado" }), { code: "INVALID_STATUS" });
  await assert.rejects(service.changeOrderStatus("no-es-uuid", { status: "processing" }), { code: "ORDER_NOT_FOUND", status: 404 });
  assert.equal(log.rpc.length, 0);
});

test("cancelar o mandar a revisión exige motivo", async () => {
  const { service, log } = serviceFor();
  for (const status of ["canceled", "review_required"]) {
    await assert.rejects(service.changeOrderStatus(ORDER, { status }), { code: "REASON_REQUIRED", status: 422, field: "reason" });
    await assert.rejects(service.changeOrderStatus(ORDER, { status, reason: "   " }), { code: "REASON_REQUIRED" });
  }
  await assert.rejects(service.changeOrderStatus(ORDER, { status: "processing", reason: "x".repeat(501) }), { code: "INVALID_REASON" });
  assert.equal(log.rpc.length, 0);
});

test("un cambio válido llama a la función con el motivo limpio y devuelve el estado guardado", async () => {
  const { service, log } = serviceFor({ readRow: { id: ORDER, status: "canceled", payment_status: "failed" } });
  const result = await service.changeOrderStatus(ORDER, { status: "canceled", reason: "  Cliente desistió  " });
  assert.deepEqual(log.rpc[0], { name: "admin_change_order_status", args: { p_order_id: ORDER, p_admin_id: ADMIN, p_to_status: "canceled", p_reason: "Cliente desistió" } });
  assert.deepEqual(result, { id: ORDER, status: "canceled", paymentStatus: "failed" });
});

test("una transición inválida para el estado actual responde 409 y falta de motivo 422", async () => {
  const invalid = serviceFor({ rpcError: { message: "Invalid order status transition" } });
  await assert.rejects(invalid.service.changeOrderStatus(ORDER, { status: "shipped" }), { code: "INVALID_TRANSITION", status: 409 });
  // review_required -> processing exige motivo aunque «processing» no lo exija desde «paid».
  const noReason = serviceFor({ rpcError: { message: "Reason required" } });
  await assert.rejects(noReason.service.changeOrderStatus(ORDER, { status: "processing" }), { code: "REASON_REQUIRED", status: 422 });
});

test("un error interno no expone detalles", async () => {
  const { service } = serviceFor({ rpcError: { message: "connection to server at 10.0.0.1 failed" } });
  await assert.rejects(service.changeOrderStatus(ORDER, { status: "processing" }), (error) => error.code === "ORDER_STATUS_UNAVAILABLE" && error.status === 503 && !/10\.0\.0\.1/.test(error.message));
});

test("al cancelar se cierran los pagos abiertos y un fallo de Stripe no deshace la cancelación", async () => {
  const { service, log } = serviceFor({ pendingSessions: [{ stripe_session_id: "cs_test_1" }, { stripe_session_id: "cs_test_2" }], readRow: { id: ORDER, status: "canceled", payment_status: "failed" } });
  await service.changeOrderStatus(ORDER, { status: "canceled", reason: "Sin stock" });
  assert.deepEqual(log.expired, ["cs_test_1", "cs_test_2"]);
  const failing = serviceFor({ pendingSessions: [{ stripe_session_id: "cs_test_1" }], expireFails: true, readRow: { id: ORDER, status: "canceled", payment_status: "failed" } });
  const result = await failing.service.changeOrderStatus(ORDER, { status: "canceled", reason: "Sin stock" });
  assert.equal(result.status, "canceled");
  const forward = serviceFor({ pendingSessions: [{ stripe_session_id: "cs_test_1" }] });
  await forward.service.changeOrderStatus(ORDER, { status: "processing" });
  assert.deepEqual(forward.log.expired, []);
});
