import { test, expect, type Page } from "@playwright/test";

const key = "eternal_memory_cart";
const productId = "11111111-1111-4111-8111-111111111111";
const variantId = "22222222-2222-4222-8222-222222222222";
const drawer = (page: Page) => page.getByRole("dialog", { name: "Tu selección" });
const quantity = (page: Page) => drawer(page).getByRole("spinbutton", { name: "Cantidad de Urna de prueba" });
async function open(page: Page) {
  await page.getByRole("button", { name: /Abrir carrito/ }).click();
  await expect(drawer(page)).toBeVisible();
}
async function add(page: Page) {
  await page.getByRole("button", { name: "Añadir al carrito", exact: true }).first().click();
  await expect(drawer(page).getByText("Subtotal: S/ 10.50", { exact: true })).toBeVisible();
}

test.beforeEach(async ({ request }) => {
  await request.put("http://127.0.0.1:3101/fixture", { data: { reset: true } });
});

test("TSK-26 vaciar en A no recupera productos al enfocar B y recargar ambas", async ({ page: a, context }) => {
  await a.goto("/catalogo/urna-prueba");
  await add(a);
  const b = await context.newPage();
  await b.goto("/catalogo/urna-prueba");
  await open(b);
  await expect(quantity(b)).toHaveValue("1");
  await drawer(a).getByRole("button", { name: "Vaciar carrito", exact: true }).click();
  await b.bringToFront();
  await b.evaluate(() => window.dispatchEvent(new Event("focus")));
  // Give the stale tab time to finish validation before checking persistence.
  await b.waitForTimeout(500);
  for (const page of [a, b]) {
    await page.reload();
    await open(page);
    await expect(drawer(page).getByText("Aún no elegiste productos")).toBeVisible();
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "[]"), key)).toEqual([]);
  }
});

test("TSK-26 descarta una respuesta antigua aunque se pierda el aviso storage", async ({ page: a, context }) => {
  await a.goto("/catalogo/urna-prueba");
  await add(a);
  const b = await context.newPage();
  await b.addInitScript(() => window.addEventListener("storage", (event) => event.stopImmediatePropagation()));
  let release!: () => void;
  let captured!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  const pending = new Promise<void>((resolve) => { captured = resolve; });
  await b.route("**/api/carrito/validar", async (route) => {
    const response = await route.fetch();
    captured();
    await held;
    await route.fulfill({ response }).catch(() => {});
  });
  await b.goto("/catalogo/urna-prueba");
  await pending;
  try {
    await drawer(a).getByRole("button", { name: "Vaciar carrito", exact: true }).click();
    await expect.poll(() => a.evaluate((key) => localStorage.getItem(key), key)).toBe("[]");
  } finally { release(); }
  await b.unrouteAll({ behavior: "wait" });
  await open(b);
  await expect(drawer(b).getByText("Aún no elegiste productos")).toBeVisible();
  expect(await a.evaluate((key) => localStorage.getItem(key), key)).toBe("[]");
});

test("TSK-26 ignora otras claves y sessionStorage sin invalidar el carrito", async ({ page: a, context }) => {
  await a.goto("/catalogo/urna-prueba");
  await add(a);
  const b = await context.newPage();
  await b.goto("/catalogo/urna-prueba");
  await open(b);
  await expect(drawer(b).getByText("Subtotal: S/ 10.50", { exact: true })).toBeVisible();
  let validations = 0;
  b.on("request", (request) => { if (request.url().endsWith("/api/carrito/validar")) validations += 1; });
  await a.evaluate(() => localStorage.setItem("unrelated-test-key", "value"));
  await b.evaluate((key) => window.dispatchEvent(new StorageEvent("storage", { key, storageArea: sessionStorage, newValue: "[]" })), key);
  await b.waitForTimeout(300);
  expect(validations).toBe(0);
  await expect(quantity(b)).toHaveValue("1");
});

test("TSK-26 sincroniza altas, cantidades y eliminación individual en ambas direcciones", async ({ page: a, context }) => {
  await a.goto("/catalogo/urna-prueba");
  const b = await context.newPage();
  await b.goto("/catalogo/urna-prueba");
  await open(b);
  await add(a);
  await expect(quantity(b)).toHaveValue("1");
  await drawer(a).getByRole("button", { name: "Aumentar cantidad de Urna de prueba" }).click();
  await expect(quantity(b)).toHaveValue("2");
  await drawer(b).getByRole("button", { name: "Aumentar cantidad de Urna de prueba" }).click();
  await expect(quantity(a)).toHaveValue("3");
  await drawer(b).getByRole("button", { name: "Cerrar carrito", exact: true }).click();
  await b.getByRole("button", { name: "Blanco", exact: true }).click();
  await b.getByRole("button", { name: "Añadir al carrito", exact: true }).first().click();
  await expect(drawer(a).getByRole("article")).toHaveCount(2);
  await drawer(a).getByRole("button", { name: "Quitar Urna de prueba del carrito" }).first().click();
  await expect(drawer(b).getByRole("article")).toHaveCount(1);
  await expect(drawer(b).getByText("Subtotal: S/ 3.25", { exact: true })).toBeVisible();
});

test("TSK-26 una respuesta retrasada en B no sobrescribe el vaciado de A", async ({ page: a, context }) => {
  await a.goto("/catalogo/urna-prueba");
  await add(a);
  const b = await context.newPage();
  let release!: () => void;
  let captured!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  const pending = new Promise<void>((resolve) => { captured = resolve; });
  await b.route("**/api/carrito/validar", async (route) => {
    const response = await route.fetch();
    captured();
    await held;
    await route.fulfill({ response }).catch(() => {});
  });
  await b.goto("/catalogo/urna-prueba");
  await pending;
  try {
    await drawer(a).getByRole("button", { name: "Vaciar carrito", exact: true }).click();
    await open(b);
    await expect(drawer(b).getByText("Aún no elegiste productos")).toBeVisible();
  } finally { release(); }
  await b.unrouteAll({ behavior: "wait" });
  await a.reload();
  await open(a);
  await expect(drawer(a).getByText("Aún no elegiste productos")).toBeVisible();
});

for (const clearAll of [false, true]) {
  test(`TSK-26 detecta ${clearAll ? "localStorage.clear" : "la eliminación de la clave"}`, async ({ page: a, context }) => {
    await a.goto("/catalogo/urna-prueba");
    await add(a);
    const b = await context.newPage();
    await b.goto("/catalogo/urna-prueba");
    await open(b);
    await expect(quantity(b)).toHaveValue("1");
    await a.evaluate(({ key, clearAll }) => { if (clearAll) localStorage.clear(); else localStorage.removeItem(key); }, { key, clearAll });
    await expect(drawer(b).getByText("Aún no elegiste productos")).toBeVisible();
    expect(await b.evaluate((key) => localStorage.getItem(key), key)).toBeNull();
  });
}

test("TSK-26 recupera cambios al enfocar aunque no se reciba storage", async ({ page: a, context }) => {
  await a.goto("/catalogo/urna-prueba");
  await add(a);
  const b = await context.newPage();
  await b.addInitScript(() => window.addEventListener("storage", (event) => event.stopImmediatePropagation()));
  await b.goto("/catalogo/urna-prueba");
  await open(b);
  await expect(quantity(b)).toHaveValue("1");
  await drawer(a).getByRole("button", { name: "Vaciar carrito", exact: true }).click();
  await b.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(drawer(b).getByText("Aún no elegiste productos")).toBeVisible();
});

test("TSK-26 conserva avisos y selección cuando se bloquean lecturas o escrituras", async ({ page }) => {
  await page.goto("/catalogo/urna-prueba");
  await add(page);
  await page.evaluate(() => { Storage.prototype.getItem = () => { throw new DOMException("Blocked", "SecurityError"); }; });
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(drawer(page).getByText(/No se pudo recuperar el carrito guardado/)).toBeVisible();
  await expect(quantity(page)).toHaveValue("1");
  await page.reload();
  await open(page);
  await expect(quantity(page)).toHaveValue("1");
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException("Blocked", "QuotaExceededError"); }; });
  await drawer(page).getByRole("button", { name: "Aumentar cantidad de Urna de prueba" }).click();
  await expect(drawer(page).getByText(/No se pudo guardar la selección en este navegador/)).toBeVisible();
  await expect(quantity(page)).toHaveValue("2");
});

test("TSK-26 mantiene validación de precios y stock sin ciclos de escritura entre pestañas", async ({ page: a, context, request }) => {
  await a.goto("/catalogo/urna-prueba");
  await add(a);
  const b = await context.newPage();
  let validations = 0;
  b.on("request", (request) => { if (request.url().endsWith("/api/carrito/validar")) validations += 1; });
  await b.goto("/catalogo/urna-prueba");
  await open(b);
  await expect(drawer(b).getByText("Subtotal: S/ 10.50", { exact: true })).toBeVisible();
  await request.put("http://127.0.0.1:3101/fixture", { data: { variant: { price_pen: 15 } } });
  await a.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(drawer(a).getByText("Subtotal: S/ 15.00", { exact: true })).toBeVisible();
  await expect(drawer(b).getByText("Subtotal: S/ 15.00", { exact: true })).toBeVisible();
  const before = validations;
  // Allow enough time for an accidental cross-tab validation/write loop to surface.
  await b.waitForTimeout(1200);
  expect(validations).toBe(before);
  await request.put("http://127.0.0.1:3101/fixture", { data: { variant: { stock_on_hand: 2, stock_reserved: 2 } } });
  await b.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(drawer(b).getByText("Subtotal: S/ 15.00", { exact: true })).not.toBeVisible();
  expect(await b.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "[]")[0].quantity, key)).toBe(1);
});

test("TSK-26 conserva recibos de pedidos TSK-27 al sincronizar y recargar", async ({ page: a, context }) => {
  await a.goto("/catalogo/urna-prueba");
  const b = await context.newPage();
  await b.goto("/catalogo/urna-prueba");
  await open(b);
  const orderId = "66666666-6666-4666-8666-666666666666";
  await a.evaluate(({ key, productId, variantId, orderId }) => localStorage.setItem(key, JSON.stringify([{
    key: "remaining", id: variantId, productId, variantId, productSlug: "urna-prueba", nombre: "Urna de prueba", categoria: "Urnas",
    selectedOption: "Bronce", quantity: 1, consumedOrderIds: [orderId],
  }])), { key, productId, variantId, orderId });
  await expect(quantity(b)).toHaveValue("1");
  await expect(drawer(b).getByText("Subtotal: S/ 10.50", { exact: true })).toBeVisible();
  await b.reload();
  await open(b);
  await expect(quantity(b)).toHaveValue("1");
  expect(await b.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "[]")[0].consumedOrderIds, key)).toEqual([orderId]);
});
