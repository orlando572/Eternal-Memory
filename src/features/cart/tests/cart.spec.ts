import { test, expect } from "@playwright/test";

const productId = "11111111-1111-4111-8111-111111111111";
const firstVariantId = "22222222-2222-4222-8222-222222222222";
const secondVariantId = "33333333-3333-4333-8333-333333333333";

test.beforeEach(async ({ request }) => {
  await request.put("http://127.0.0.1:3101/fixture", { data: { reset: true } });
});

test("el servidor calcula subtotales y total con el catálogo persistido", async ({ request }) => {
  const response = await request.post("/api/carrito/validar", { data: { lines: [
    { key: "a", productId, variantId: firstVariantId, quantity: 2 },
    { key: "b", productId, variantId: secondVariantId, quantity: 3 },
  ] } });
  expect(response.status()).toBe(200);
  const result = await response.json();
  expect(result.totalPen).toBe(30.75);
  expect(result.lines.map((line: { subtotalPen: number }) => line.subtotalPen)).toEqual([21, 9.75]);
  expect(response.headers()["cache-control"]).toContain("no-store");
});

test("el cliente agrega variantes, cambia cantidades y conserva su selección al recargar", async ({ page }) => {
  await page.goto("/catalogo/urna-prueba");
  await page.getByRole("button", { name: "Añadir al carrito", exact: true }).first().click();
  const drawer = page.getByRole("dialog", { name: "Tu selección" });
  await expect(drawer.getByText("Subtotal: S/ 10.50", { exact: true })).toBeVisible();
  await drawer.getByRole("button", { name: "Aumentar cantidad de Urna de prueba" }).click();
  await expect(drawer.getByText("Subtotal: S/ 21.00", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /Abrir carrito/ }).click();
  await expect(drawer.getByRole("spinbutton", { name: "Cantidad de Urna de prueba" })).toHaveValue("2");
  await expect(drawer.getByText("Subtotal: S/ 21.00", { exact: true })).toBeVisible();
  await drawer.getByRole("link", { name: "Urna de prueba", exact: true }).click();
  await expect(drawer).not.toBeVisible();
  await expect(page).toHaveURL(/\/catalogo\/urna-prueba$/);
});

test("las líneas antiguas no identificables quedan pendientes sin inventar un producto", async ({ request }) => {
  const response = await request.post("/api/carrito/validar", { data: { lines: [{ key: "old", legacyId: "antiguo-desconocido", selectedOption: "Roble", quantity: 1 }] } });
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ totalPen: 0, lines: [{ status: "pending" }] });
});

test("el servidor rechaza precios suministrados, cuerpos inválidos y más de 50 líneas", async ({ request }) => {
  const line = { key: "a", productId, variantId: firstVariantId, quantity: 1 };
  for (const data of [null, [], {}, { lines: [null] }, { lines: [{ ...line, unitPricePen: 0.01 }] }, { lines: [line], totalPen: 0.01 }, { lines: [line, line] }, { lines: Array.from({ length: 51 }, (_, index) => ({ ...line, key: String(index) })) }]) {
    const response = await request.post("/api/carrito/validar", { data });
    expect(response.status()).toBe(400);
  }
  const oversized = await request.post("/api/carrito/validar", { data: { lines: [{ ...line, selectedOption: "x".repeat(33_000) }] } });
  expect(oversized.status()).toBe(400);
});

test("las cantidades inválidas no contribuyen al total", async ({ request }) => {
  for (const quantity of [0, -1, 1.5, "2", null, 51]) {
    const response = await request.post("/api/carrito/validar", { data: { lines: [{ key: "a", productId, variantId: firstVariantId, quantity }] } });
    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result).toMatchObject({ totalPen: 0, lines: [{ status: "invalid" }] });
    expect(result.lines[0].subtotalPen).toBeUndefined();
  }
});

test("las variantes duplicadas no eluden límites ni existencias reservadas", async ({ request }) => {
  await request.put("http://127.0.0.1:3101/fixture", { data: { variant: { stock_on_hand: 5, stock_reserved: 2 } } });
  const validate = async (quantities: number[]) => {
    const response = await request.post("/api/carrito/validar", { data: { lines: quantities.map((quantity, index) => ({ key: String(index), productId, variantId: firstVariantId, quantity })) } });
    return response.json();
  };
  expect(await validate([3])).toMatchObject({ totalPen: 31.5, lines: [{ status: "valid", availableQuantity: 3 }] });
  expect(await validate([2, 2])).toMatchObject({ totalPen: 0, lines: [{ status: "invalid" }, { status: "invalid" }] });
  await request.put("http://127.0.0.1:3101/fixture", { data: { variant: { stock_on_hand: 100, stock_reserved: 0 } } });
  expect(await validate([50])).toMatchObject({ totalPen: 525 });
  expect(await validate([30, 30])).toMatchObject({ totalPen: 0, lines: [{ status: "invalid" }, { status: "invalid" }] });
  // A validation is read-only; repeating it leaves availability unchanged.
  expect(await validate([50])).toMatchObject({ lines: [{ availableQuantity: 100 }] });
});

test("el servidor admite 50 líneas distintas y rechaza la número 51", async ({ request }) => {
  const variants = Array.from({ length: 49 }, (_, index) => ({ id: `55555555-5555-4555-8555-${String(index).padStart(12, "0")}`, name: `Variante ${index}`, price_pen: 1, stock_on_hand: 1, stock_reserved: 0, sort_order: index + 2, is_active: true }));
  await request.put("http://127.0.0.1:3101/fixture", { data: { extraVariants: variants } });
  const lines = [firstVariantId, ...variants.map((variant) => variant.id)].map((variantId, index) => ({ key: String(index), productId, variantId, quantity: 1 }));
  const response = await request.post("/api/carrito/validar", { data: { lines } });
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ totalPen: 59.5 });
  const tooMany = await request.post("/api/carrito/validar", { data: { lines: [...lines, { key: "51", productId, variantId: secondVariantId, quantity: 1 }] } });
  expect(tooMany.status()).toBe(400);
});

test("productos no publicados y variantes inexistentes o inactivas quedan excluidos", async ({ request }) => {
  const validate = async (patch = {}) => {
    const response = await request.post("/api/carrito/validar", { data: { lines: [{ key: "a", productId, variantId: firstVariantId, quantity: 1, ...patch }, { key: "b", productId, variantId: secondVariantId, quantity: 3 }] } });
    return response.json();
  };
  expect(await validate({ productId: "99999999-9999-4999-8999-999999999999" })).toMatchObject({ totalPen: 9.75, lines: [{ status: "invalid" }, { status: "valid" }] });
  expect(await validate({ variantId: "99999999-9999-4999-8999-999999999999" })).toMatchObject({ totalPen: 9.75, lines: [{ status: "invalid" }, { status: "valid" }] });
  await request.put("http://127.0.0.1:3101/fixture", { data: { variant: { is_active: false } } });
  expect(await validate()).toMatchObject({ totalPen: 9.75, lines: [{ status: "invalid" }, { status: "valid" }] });
  await request.put("http://127.0.0.1:3101/fixture", { data: { product: { status: "draft" } } });
  expect(await validate()).toMatchObject({ totalPen: 0, lines: [{ status: "invalid" }, { status: "invalid" }] });
  await request.put("http://127.0.0.1:3101/fixture", { data: { product: { status: "published" }, category: { is_active: false } } });
  expect(await validate()).toMatchObject({ totalPen: 0 });
});

test("las líneas antiguas solo se recuperan cuando la variante es inequívoca", async ({ request }) => {
  const validate = async () => {
    const response = await request.post("/api/carrito/validar", { data: { lines: [{ key: "old", legacyId: "urna-prueba", selectedOption: "Bronce", quantity: 2 }] } });
    return response.json();
  };
  expect(await validate()).toMatchObject({ totalPen: 21, lines: [{ status: "valid", productId, variantId: firstVariantId, productSlug: "urna-prueba" }] });
  await request.put("http://127.0.0.1:3101/fixture", { data: { extraVariants: [{ id: "55555555-5555-4555-8555-555555555555", name: "Bronce", price_pen: 10, stock_on_hand: 1, stock_reserved: 0, sort_order: 2, is_active: true }] } });
  const result = await validate();
  expect(result).toMatchObject({ totalPen: 0, lines: [{ status: "pending", productSlug: "urna-prueba" }] });
  expect(result.lines[0].variantId).toBeUndefined();
});

const savedLine = (variantId = firstVariantId, quantity = 2) => ({
  id: variantId, productId, variantId, productSlug: "urna-prueba", nombre: "Urna de prueba", categoria: "Urnas", selectedOption: variantId === firstVariantId ? "Bronce" : "Blanco", quantity, precio: "S/ 0.01", unitPricePen: 0.01,
});

async function loadCart(page: import("@playwright/test").Page, entries: unknown) {
  await page.goto("/");
  await page.evaluate((value) => localStorage.setItem("eternal_memory_cart", JSON.stringify(value)), entries);
  await page.reload();
  await page.getByRole("button", { name: /Abrir carrito/ }).click();
  return page.getByRole("dialog", { name: "Tu selección" });
}

test("el navegador ignora precios manipulados y avisa de cambios vigentes", async ({ page, request }, testInfo) => {
  const drawer = await loadCart(page, [savedLine()]);
  await expect(drawer.getByText("Subtotal: S/ 21.00", { exact: true })).toBeVisible();
  await expect(drawer.getByText("El precio cambió. Se muestra el precio vigente.")).toBeVisible();
  await drawer.getByRole("button", { name: "Cerrar carrito", exact: true }).click();
  await request.put("http://127.0.0.1:3101/fixture", { data: { variant: { price_pen: 12.25 } } });
  await page.getByRole("button", { name: /Abrir carrito/ }).click();
  await expect(drawer.getByText("Subtotal: S/ 24.50", { exact: true })).toBeVisible();
  await expect(drawer.getByText("S/ 21.00", { exact: true })).not.toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("carrito-desktop.png"), fullPage: true });
});

test("el stock insuficiente conserva cantidad y permite corregirla", async ({ page, request }) => {
  const drawer = await loadCart(page, [savedLine()]);
  await expect(drawer.getByText("Subtotal: S/ 21.00", { exact: true })).toBeVisible();
  await request.put("http://127.0.0.1:3101/fixture", { data: { variant: { stock_on_hand: 3, stock_reserved: 2 } } });
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(drawer.getByText(/Disponibles: 1/)).toBeVisible();
  await expect(drawer.getByRole("spinbutton", { name: "Cantidad de Urna de prueba" })).toHaveValue("2");
  await expect(drawer.getByText("Total de artículos válidos", { exact: true })).toBeVisible();
  await expect(drawer.getByText("S/ 0.00", { exact: true })).toBeVisible();
  await drawer.getByRole("button", { name: "Reducir cantidad de Urna de prueba" }).click();
  await expect(drawer.getByText("Subtotal: S/ 10.50", { exact: true })).toBeVisible();
});

test("un fallo oculta importes y conserva selección hasta reintentar o quitar", async ({ page }) => {
  const drawer = await loadCart(page, [savedLine(), savedLine(secondVariantId, 3)]);
  await expect(drawer.getByText("S/ 30.75", { exact: true })).toBeVisible();
  await page.route("**/api/carrito/validar", (route) => route.abort());
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(drawer.getByRole("button", { name: "Reintentar", exact: true })).toBeVisible();
  await expect(drawer.getByText(/S\//)).toHaveCount(0);
  await expect(drawer.getByRole("article")).toHaveCount(2);
  await drawer.getByRole("button", { name: "Quitar Urna de prueba del carrito" }).first().click();
  await expect(drawer.getByRole("article")).toHaveCount(1);
  await expect(drawer.getByRole("button", { name: "Reintentar", exact: true })).toBeVisible();
  await page.unroute("**/api/carrito/validar");
  await drawer.getByRole("button", { name: "Reintentar", exact: true }).click();
  await expect(drawer.getByText("Subtotal: S/ 9.75", { exact: true })).toBeVisible();
  await drawer.getByRole("button", { name: "Vaciar carrito", exact: true }).click();
  await expect(drawer.getByText("Aún no elegiste productos")).toBeVisible();
});

test("las respuestas atrasadas no restauran artículos eliminados", async ({ page }) => {
  const drawer = await loadCart(page, [savedLine(), savedLine(secondVariantId, 3)]);
  await expect(drawer.getByText("S/ 30.75", { exact: true })).toBeVisible();
  let release!: () => void;
  let captured!: () => void;
  const pending = new Promise<void>((resolve) => { captured = resolve; });
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/carrito/validar", async (route) => {
    const response = await route.fetch();
    if (route.request().postDataJSON().lines.length === 2) {
      captured();
      await held;
    }
    await route.fulfill({ response }).catch(() => {});
  });
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await pending;
  await expect(drawer.getByText(/S\//)).toHaveCount(0);
  await drawer.getByRole("button", { name: "Quitar Urna de prueba del carrito" }).first().click();
  await expect(drawer.getByText("S/ 9.75", { exact: true })).toBeVisible();
  release();
  await expect(drawer.getByRole("article")).toHaveCount(1);
  await expect(drawer.getByText("S/ 30.75", { exact: true })).not.toBeVisible();
});

test("selecciones antiguas recuperables se conservan y las ambiguas enlazan a la ficha", async ({ page }) => {
  const drawer = await loadCart(page, [
    { id: "urna-prueba", nombre: "Selección antigua", selectedOption: "Bronce", quantity: 2 },
    { id: "urna-prueba", nombre: "Variante antigua", selectedOption: "Roble", quantity: 1 },
  ]);
  await expect(drawer.getByText("Subtotal: S/ 21.00", { exact: true })).toBeVisible();
  await expect(drawer.getByText(/Vuelve a elegir la variante/)).toBeVisible();
  const pendingLine = drawer.getByRole("article").filter({ hasText: "Roble" });
  await pendingLine.getByRole("link", { name: "Urna de prueba", exact: true }).click();
  await expect(drawer).not.toBeVisible();
  await expect(page).toHaveURL(/\/catalogo\/urna-prueba$/);
});

test("el carrito soporta almacenamiento dañado y cantidades guardadas inválidas", async ({ page }) => {
  const drawer = await loadCart(page, [savedLine(firstVariantId, 0)]);
  await expect(drawer.getByText(/Introduce una cantidad entera entre 1 y 50/)).toBeVisible();
  const input = drawer.getByRole("spinbutton", { name: "Cantidad de Urna de prueba" });
  await input.fill("2");
  await input.press("Enter");
  await expect(drawer.getByText("Subtotal: S/ 21.00", { exact: true })).toBeVisible();
  await page.evaluate(() => localStorage.setItem("eternal_memory_cart", "{broken"));
  await page.reload();
  await page.getByRole("button", { name: /Abrir carrito/ }).click();
  await expect(drawer.getByText(/No se pudo recuperar el carrito guardado/)).toBeVisible();
  await expect(drawer.getByText("Aún no elegiste productos")).toBeVisible();
});

test("el cliente mantiene variantes separadas y acumula la variante repetida", async ({ page }) => {
  await page.goto("/catalogo/urna-prueba");
  const add = page.getByRole("button", { name: "Añadir al carrito", exact: true }).first();
  const drawer = page.getByRole("dialog", { name: "Tu selección" });
  await add.click();
  await expect(drawer.getByText("Subtotal: S/ 10.50", { exact: true })).toBeVisible();
  await drawer.getByRole("button", { name: "Cerrar carrito", exact: true }).click();
  await add.click();
  await expect(drawer.getByText("Subtotal: S/ 21.00", { exact: true })).toBeVisible();
  await drawer.getByRole("button", { name: "Cerrar carrito", exact: true }).click();
  await page.getByRole("button", { name: "Blanco", exact: true }).click();
  await add.click();
  await expect(drawer.getByRole("article")).toHaveCount(2);
  await expect(drawer.getByText("S/ 24.25", { exact: true })).toBeVisible();
});

test("el carrito móvil permite navegar por imagen y mantiene el foco dentro del panel", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const drawer = await loadCart(page, [savedLine()]);
  await expect(drawer.getByText("Subtotal: S/ 21.00", { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("carrito-mobile.png"), fullPage: true });
  await drawer.getByRole("link", { name: /Seguir explorando/ }).focus();
  await page.keyboard.press("Tab");
  await expect(drawer.getByRole("button", { name: "Cerrar carrito", exact: true })).toBeFocused();
  await drawer.getByRole("link", { name: "Ver imagen referencial de Urna de prueba", exact: true }).click();
  await expect(drawer).not.toBeVisible();
  await expect(page).toHaveURL(/\/catalogo\/urna-prueba$/);
});

test("el servidor falla sin publicar importes ni detalles internos y permite recuperar la selección", async ({ request }) => {
  await request.put("http://127.0.0.1:3101/fixture", { data: { unavailable: true } });
  const data = { lines: [{ key: "a", productId, variantId: firstVariantId, quantity: 2 }] };
  const response = await request.post("/api/carrito/validar", { data });
  expect(response.status()).toBe(503);
  expect(await response.json()).toEqual({ error: "No se pudo validar el carrito. Reintenta en un momento." });
  await request.put("http://127.0.0.1:3101/fixture", { data: { unavailable: false } });
  const retry = await request.post("/api/carrito/validar", { data });
  expect(await retry.json()).toMatchObject({ totalPen: 21 });
});

test("el cliente informa cuando no puede guardar el carrito sin impedir usarlo", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException("Storage blocked", "QuotaExceededError"); };
  });
  await page.goto("/catalogo/urna-prueba");
  await page.getByRole("button", { name: "Añadir al carrito", exact: true }).first().click();
  const drawer = page.getByRole("dialog", { name: "Tu selección" });
  await expect(drawer.getByText(/No se pudo guardar la selección en este navegador/)).toBeVisible();
  await expect(drawer.getByText("Subtotal: S/ 10.50", { exact: true })).toBeVisible();
});

test("al corregir una cantidad rechazada no se pierde la línea ni se acepta una fracción", async ({ page }) => {
  const drawer = await loadCart(page, [savedLine()]);
  await expect(drawer.getByText("Subtotal: S/ 21.00", { exact: true })).toBeVisible();
  const input = drawer.getByRole("spinbutton", { name: "Cantidad de Urna de prueba" });
  await input.fill("1.5");
  await input.press("Enter");
  await expect(drawer.getByRole("alert")).toContainText("Introduce una cantidad entera entre 1 y 50.");
  await expect(input).toHaveValue("2");
  await input.fill("3");
  await input.press("Enter");
  await expect(drawer.getByText("Subtotal: S/ 31.50", { exact: true })).toBeVisible();
});

test("el selector y el carrito respetan 50 unidades sin duplicar la variante", async ({ page }) => {
  const drawer = await loadCart(page, [savedLine(firstVariantId, 50)]);
  await expect(drawer.getByText("Subtotal: S/ 525.00", { exact: true })).toBeVisible();
  await expect(drawer.getByRole("button", { name: "Aumentar cantidad de Urna de prueba" })).toBeDisabled();
  await drawer.getByRole("link", { name: "Urna de prueba", exact: true }).click();
  await expect(page.getByRole("button", { name: "Añadir al carrito", exact: true }).first()).toBeDisabled();
  await page.getByRole("button", { name: /Abrir carrito/ }).click();
  await drawer.getByRole("button", { name: "Reducir cantidad de Urna de prueba" }).click();
  await expect(drawer.getByText("Subtotal: S/ 514.50", { exact: true })).toBeVisible();
});

test("recuperar líneas con identidad o cantidad inválidas no altera una línea válida", async ({ page }) => {
  const drawer = await loadCart(page, [savedLine(firstVariantId, 5), { ...savedLine(firstVariantId, -4), productId: "99999999-9999-4999-8999-999999999999", nombre: "Artículo inválido" }]);
  await expect(drawer.getByRole("article")).toHaveCount(2);
  await expect(drawer.getByText("Subtotal: S/ 52.50", { exact: true })).toBeVisible();
  await expect(drawer.getByText(/El producto no está disponible o no puede identificarse/)).toBeVisible();
});

test("un identificador suministrado vacío nunca se recupera por nombre como selección antigua", async ({ request }) => {
  const response = await request.post("/api/carrito/validar", { data: { lines: [{ key: "bad", productId, variantId: "", selectedOption: "Bronce", quantity: 2 }] } });
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ totalPen: 0, lines: [{ status: "invalid" }] });
});

test("las claves duplicadas guardadas se recuperan sin perder líneas independientes", async ({ page }) => {
  const drawer = await loadCart(page, [{ ...savedLine(), key: "saved-1-1" }, { ...savedLine(secondVariantId, 3), key: "saved-1-1" }]);
  await expect(drawer.getByText("S/ 30.75", { exact: true })).toBeVisible();
  await expect(drawer.getByRole("article")).toHaveCount(2);
  await drawer.getByRole("button", { name: "Quitar Urna de prueba del carrito" }).first().click();
  await expect(drawer.getByRole("article")).toHaveCount(1);
  await expect(drawer.getByText("Subtotal: S/ 9.75", { exact: true })).toBeVisible();
});

test("la migración fusiona únicamente variantes verificadas y conserva su cantidad total", async ({ page }) => {
  const drawer = await loadCart(page, [savedLine(firstVariantId, 1), { id: "urna-prueba", nombre: "Selección antigua", selectedOption: "Bronce", quantity: 2 }]);
  await expect(drawer.getByRole("article")).toHaveCount(1);
  await expect(drawer.getByText("Subtotal: S/ 31.50", { exact: true })).toBeVisible();
  await expect(drawer.getByRole("spinbutton", { name: "Cantidad de Urna de prueba" })).toHaveValue("3");
});
