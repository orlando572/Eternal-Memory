import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);

function loadSource(relativePath, mocks) {
  const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  const loadedModule = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name), loadedModule, loadedModule.exports,
  );
  return loadedModule.exports;
}

const { getAdminReturnPath, getPostLoginPath } = loadSource("./lib/roleNavigation.ts", {});
const { readCurrentAccess } = loadSource("./services/accountAccessClient.ts", {});

test("el administrador llega al panel y el usuario al catálogo", () => {
  assert.equal(getPostLoginPath("admin"), "/admin/productos");
  assert.equal(getPostLoginPath("user"), "/catalogo");
  assert.equal(getPostLoginPath("user", "/admin/productos/nuevo"), "/catalogo");
  assert.equal(getPostLoginPath("admin", "/admin/productos/abc/editar?origen=lista"), "/admin/productos/abc/editar?origen=lista");
});

for (const value of [undefined, ["/admin/productos"], "https://example.com/admin/productos", "//example.com/admin/productos", "/admin/productos-malicioso", "/admin/productos/../../perfil", "/\\example.com/admin/productos", "javascript:alert(1)"]) {
  test(`se rechaza un destino inválido: ${JSON.stringify(value)}`, () => {
    assert.equal(getAdminReturnPath(value), undefined);
    assert.equal(getPostLoginPath("admin", value), "/admin/productos");
  });
}

for (const role of ["admin", "user"]) {
  test(`el navegador acepta el rol ${role} verificado por el endpoint`, async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "/api/auth/role");
      assert.equal(options.cache, "no-store");
      assert.equal(options.credentials, "same-origin");
      return Response.json({ role });
    };
    try { assert.deepEqual(await readCurrentAccess(), { role }); }
    finally { globalThis.fetch = originalFetch; }
  });
}

test("una respuesta sin sesión no concede un rol", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ error: "Sesión requerida" }, { status: 401 });
  try { assert.equal(await readCurrentAccess(), null); }
  finally { globalThis.fetch = originalFetch; }
});

for (const response of [{ status: 503, body: {} }, { status: 200, body: { role: "owner" } }, { status: 200, body: {} }]) {
  test(`un fallo o rol desconocido no concede acceso: ${JSON.stringify(response)}`, async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => Response.json(response.body, { status: response.status });
    try { await assert.rejects(readCurrentAccess, /No se pudieron verificar/); }
    finally { globalThis.fetch = originalFetch; }
  });
}

function accessFixture({ user = { id: "verified-user", user_metadata: { role: "admin" } }, data = null, error = null } = {}) {
  const filters = [];
  let tableReads = 0;
  const client = {
    auth: { getUser: async () => ({ data: { user }, error: null }) },
    from(table) {
      ++tableReads;
      assert.equal(table, "staff_roles");
      return { select: () => ({ eq: (column, value) => {
        filters.push([column, value]);
        return { maybeSingle: async () => ({ data, error }) };
      } }) };
    },
  };
  const service = loadSource("./services/accessService.ts", {
    "server-only": {}, "@/lib/supabase/server": { createClient: async () => client },
  });
  return { service, filters, get tableReads() { return tableReads; } };
}

test("el servidor comprueba el ID autenticado y no confía en user_metadata", async () => {
  const { service, filters } = accessFixture();
  const access = await service.getCurrentAccess();
  assert.equal(access.role, "user");
  assert.deepEqual(filters, [["user_id", "verified-user"]]);
  await assert.rejects(service.requireAdmin, (error) => error.status === 403);
});

test("la asignación admin de staff_roles permite requireAdmin", async () => {
  const { service } = accessFixture({ data: { role: "admin" } });
  assert.equal((await service.requireAdmin()).role, "admin");
});

test("sin identidad verificada no se consulta staff_roles", async () => {
  const fixture = accessFixture({ user: null });
  await assert.rejects(fixture.service.requireAdmin, (error) => error.status === 401);
  assert.equal(fixture.tableReads, 0);
});

test("un fallo de permisos en el servidor bloquea la autorización", async () => {
  const { service } = accessFixture({ error: { code: "42501" } });
  await assert.rejects(service.requireAdmin, (error) => error.status === 503);
});

test("la página de login redirige una sesión existente según su rol", async () => {
  for (const role of ["user", "admin"]) {
    const page = loadSource("../../app/login/page.tsx", {
      "@/features/auth/components/LoginForm": { LoginForm: () => null },
      "@/features/auth/lib/roleNavigation": { getAdminReturnPath, getPostLoginPath },
      "@/features/auth/services/accessService": { getCurrentAccess: async () => ({ role }) },
      "next/navigation": { redirect: (path) => { throw new Error(`REDIRECT ${path}`); } },
    });
    await assert.rejects(page.default({ searchParams: Promise.resolve({ next: "/admin/productos/nuevo" }) }), {
      message: `REDIRECT ${role === "admin" ? "/admin/productos/nuevo" : "/catalogo"}`,
    });
  }
});

test("la navegación solo muestra Administración al administrador", () => {
  const { AccountLinks } = loadSource("./components/AccountLinks.tsx", {
    "next/link": ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children),
    "@/features/loading/Loading": { Spinner: () => null },
  });
  for (const role of ["admin", "user"]) {
    const markup = renderToStaticMarkup(React.createElement(AccountLinks, { role, signingOut: false, onSignOut() {} }));
    assert.equal(markup.includes('href="/admin/productos"'), role === "admin");
    assert.match(markup, /Mi perfil/);
    assert.match(markup, /Cerrar sesión/);
  }
});

for (const role of ["admin", "user", null]) {
  test(`el formulario completa el login sin saltarse la comprobación de rol: ${role}`, async () => {
    const calls = [];
    const form = loadSource("./components/LoginForm.tsx", {
      react: { useState: (value) => [value, () => {}], useTransition: () => [false, (navigate) => navigate()] },
      "next/link": () => null,
      "next/navigation": { useRouter: () => ({ replace: (path) => calls.push(path), refresh() {} }) },
      "@/features/loading/LoadingButton": { LoadingButton: () => null },
      "@/features/auth/components/AuthLayout": { AuthLayout: () => null },
      "@/services/authService": { signInUser: async () => calls.push("authenticated") },
      "@/features/auth/services/accountAccessClient": { readCurrentAccess: async () => {
        calls.push("role-verified");
        return role ? { role } : null;
      } },
      "@/features/auth/lib/roleNavigation": { getPostLoginPath },
    });
    const tree = form.LoginForm({ callbackError: false, returnTo: "/admin/productos/nuevo" });
    const submittedForm = tree.props.children.find((child) => child?.type === "form");
    await submittedForm.props.onSubmit({ preventDefault() {} });
    assert.deepEqual(calls, role
      ? ["authenticated", "role-verified", role === "admin" ? "/admin/productos/nuevo" : "/catalogo"]
      : ["authenticated", "role-verified"]);
  });
}

test("Historial solo aparece en el perfil del usuario", () => {
  const { ProfileTabs } = loadSource("./components/ProfileTabs.tsx", {
    "next/link": ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children),
  });
  for (const role of ["admin", "user"]) {
    const markup = renderToStaticMarkup(React.createElement(ProfileTabs, { active: "profile", role }));
    assert.equal(markup.includes('href="/perfil/historial"'), role === "user");
    assert.match(markup, /Mi perfil/);
  }
});

test("la URL de Historial devuelve al administrador a su perfil y permanece disponible para el usuario", async () => {
  for (const role of ["admin", "user"]) {
    let profileReads = 0;
    const page = loadSource("../../app/perfil/historial/page.tsx", {
      "next/link": () => null,
      "next/navigation": { redirect: (path) => { throw new Error(`REDIRECT ${path}`); } },
      "@/features/auth/components/ProfileLayout": { ProfileLayout: () => null },
      "@/features/auth/services/accessService": { getCurrentAccess: async () => ({ role, user: { email: "cuenta@ejemplo.com" } }) },
      "@/features/auth/services/profileService": { getCurrentProfile: async () => {
        ++profileReads;
        return { full_name: "Cuenta de ejemplo" };
      } },
    });
    if (role === "admin") {
      await assert.rejects(page.default, { message: "REDIRECT /perfil" });
      assert.equal(profileReads, 0);
    } else {
      assert.equal((await page.default()).props.active, "history");
      assert.equal(profileReads, 1);
    }
  }
});
