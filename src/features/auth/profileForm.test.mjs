import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import React from "react";
import ts from "typescript";

const require = createRequire(import.meta.url);
const initial = {
  email: "perfil@example.test", fullName: "Nombre inicial", phone: "900000001",
  dni: "00000001", birthDate: "1990-01-01", gender: "prefer_not_to_say",
};
const fields = ["profile-name", "profile-phone", "profile-dni", "profile-birth-date", "profile-gender"];
const saved = { full_name: "Nombre enviado", phone: "900000002", dni: "00000002", birth_date: "1991-02-02", gender: "female" };

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

// Como en roleNavigation.test.mjs, se ejecuta el componente con dependencias
// controladas. Cada render conserva estado y refs y vuelve a recorrer los hooks.
function fixture() {
  const slots = [];
  let cursor = 0;
  let refreshes = 0;
  const calls = [];
  const emails = [];
  const requests = [];
  const mocks = {
    react: {
      useState(value) {
        const index = cursor++;
        if (!(index in slots)) slots[index] = typeof value === "function" ? value() : value;
        return [slots[index], (next) => { slots[index] = typeof next === "function" ? next(slots[index]) : next; }];
      },
      useRef(value) {
        const index = cursor++;
        if (!(index in slots)) slots[index] = { current: value };
        return slots[index];
      },
    },
    "next/navigation": { useRouter: () => ({ refresh: () => { refreshes += 1; } }) },
    "@/features/auth/actions/profileActions": { saveCurrentProfile: (input) => {
      calls.push(structuredClone(input));
      const request = deferred();
      requests.push(request);
      return request.promise;
    } },
    "@/services/authService": { requestEmailChange: async (email) => {
      emails.push(email);
      return { requiresConfirmation: true };
    } },
    "@/features/loading/LoadingButton": { LoadingButton: ({ busy, busyLabel, children, ...props }) => (
      React.createElement("button", { ...props, disabled: props.disabled || busy, "aria-busy": busy, "aria-label": busy ? busyLabel : undefined }, children)
    ) },
  };
  const { outputText } = ts.transpileModule(readFileSync(new URL("./components/ProfileForm.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
  });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name), loaded, loaded.exports,
  );

  function flatten(node) {
    if (node == null || typeof node === "boolean") return [];
    if (Array.isArray(node)) return node.flatMap(flatten);
    if (!React.isValidElement(node)) return [node];
    if (typeof node.type === "function") return flatten(node.type(node.props));
    return [node, ...flatten(node.props.children)];
  }
  function tree() {
    cursor = 0;
    return flatten(loaded.exports.ProfileForm(initial));
  }
  function find(predicate) {
    const found = tree().find((node) => React.isValidElement(node) && predicate(node));
    assert.ok(found, "Debe existir el control solicitado");
    return found;
  }
  const control = (id) => find((node) => node.props.id === id);
  const form = () => find((node) => node.props.className === "profile-details-form");
  return {
    calls, emails, requests, tree, control, form,
    get refreshes() { return refreshes; },
    edit(id, value) {
      const input = control(id);
      if (input.props.disabled) return false;
      input.props.onChange({ target: { value } });
      return true;
    },
    submit: () => form().props.onSubmit({ preventDefault() {} }),
    hasText: (text) => tree().includes(text),
    submitEmail: () => find((node) => node.props.className === "profile-email-form").props.onSubmit({ preventDefault() {} }),
    button: () => form().props.children.flatMap(flatten).find((node) => React.isValidElement(node) && node.type === "button"),
  };
}

for (const id of fields) {
  test(`${id} se bloquea durante una respuesta retardada y vuelve a habilitarse`, async () => {
    const app = fixture();
    assert.equal(!!app.control(id).props.disabled, false);
    const before = app.control(id).props.value;
    const pending = app.submit();
    try {
      assert.equal(app.control(id).props.disabled, true);
      assert.equal(app.edit(id, "Cambio durante guardado"), false);
      assert.equal(app.control(id).props.value, before);
      assert.equal(app.form().props["aria-busy"], true);
      assert.equal(app.button().props.disabled, true);
      assert.equal(app.hasText("Los cambios del perfil se guardaron."), false);
    } finally {
      app.requests[0].resolve(app.calls[0]);
      await pending;
    }
    assert.equal(!!app.control(id).props.disabled, false);
    assert.equal(app.form().props["aria-busy"], false);
  });
}

test("muestra éxito solo tras la respuesta y aplica los cinco valores guardados", async () => {
  const app = fixture();
  app.edit("profile-name", "  Nombre enviado  ");
  const pending = app.submit();
  assert.equal(app.calls[0].full_name, "  Nombre enviado  ");
  assert.equal(app.hasText("Los cambios del perfil se guardaron."), false);
  app.requests[0].resolve(saved);
  await pending;
  assert.deepEqual(fields.map((id) => app.control(id).props.value), [saved.full_name, saved.phone, saved.dni, saved.birth_date, saved.gender]);
  assert.equal(app.hasText("Los cambios del perfil se guardaron."), true);
  assert.equal(app.refreshes, 1);
});

test("un error conserva los datos, desbloquea los controles y permite reintentar", async () => {
  const app = fixture();
  app.edit("profile-name", "Nombre enviado");
  const before = fields.map((id) => app.control(id).props.value);
  const pending = app.submit();
  app.requests[0].reject(new Error("Error de prueba al guardar"));
  await pending;
  assert.deepEqual(fields.map((id) => app.control(id).props.value), before);
  assert.ok(fields.every((id) => !app.control(id).props.disabled));
  assert.equal(app.button().props.disabled, false);
  assert.equal(app.hasText("Error de prueba al guardar"), true);
  assert.equal(app.hasText("Los cambios del perfil se guardaron."), false);
  assert.equal(app.refreshes, 0);
  const retry = app.submit();
  assert.equal(app.hasText("Error de prueba al guardar"), false);
  app.requests[1].resolve(app.calls[1]);
  await retry;
  assert.equal(app.calls.length, 2);
  assert.equal(app.hasText("Los cambios del perfil se guardaron."), true);
});

test("cada nueva edición retira el éxito del guardado anterior", async () => {
  for (const id of fields) {
    const app = fixture();
    const pending = app.submit();
    app.requests[0].resolve(saved);
    await pending;
    assert.equal(app.hasText("Los cambios del perfil se guardaron."), true);
    app.edit(id, id === "profile-gender" ? "male" : "Nuevo valor");
    assert.equal(app.hasText("Los cambios del perfil se guardaron."), false);
  }
});

test("dos envíos antes del siguiente render realizan una sola solicitud", async () => {
  const app = fixture();
  const submit = app.form().props.onSubmit;
  const first = submit({ preventDefault() {} });
  const second = submit({ preventDefault() {} });
  try { assert.equal(app.calls.length, 1); }
  finally {
    for (const request of app.requests) request.resolve(saved);
    await Promise.all([first, second]);
  }
  assert.equal(app.refreshes, 1);
});

test("el formulario independiente de correo conserva su confirmación", async () => {
  const app = fixture();
  const pending = app.submit();
  assert.equal(!!app.control("profile-email").props.disabled, false);
  app.edit("profile-email", "otro@example.test");
  await app.submitEmail();
  assert.deepEqual(app.emails, ["otro@example.test"]);
  assert.equal(app.hasText("Te enviamos un enlace para confirmar el cambio. El correo actual seguirá activo hasta que lo confirmes."), true);
  assert.ok(fields.every((id) => app.control(id).props.disabled === true));
  app.requests[0].resolve(saved);
  await pending;
});
