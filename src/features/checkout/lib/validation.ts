import type { CheckoutInput } from "@/features/checkout/types/checkout";

export class CheckoutError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 422,
    public readonly field?: string,
    public readonly lines?: unknown,
  ) { super(message); }
}

export const isUuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export function readObject(value: unknown, fields: string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some((key) => !fields.includes(key))) {
    throw new CheckoutError("INVALID_INPUT", "Revisa los datos enviados.");
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, field: string, min: number, max: number): string {
  if (typeof value !== "string") throw new CheckoutError("INVALID_INPUT", "Completa este campo.", 422, field);
  const result = value.normalize("NFC").trim();
  if ([...result].length < min || [...result].length > max || /[\p{Cc}\p{Cf}<>]/u.test(result)) {
    throw new CheckoutError("INVALID_INPUT", `Introduce entre ${min} y ${max} caracteres válidos.`, 422, field);
  }
  return result;
}

export function readCheckoutInput(body: unknown): CheckoutInput {
  const input = readObject(body, ["contactName", "contactEmail", "contactPhone", "addressLine", "addressDetail", "ubigeo", "lines"]);
  const contactName = text(input.contactName, "contactName", 2, 120);
  const contactEmail = text(input.contactEmail, "contactEmail", 3, 254).toLowerCase();
  const contactPhone = text(input.contactPhone, "contactPhone", 7, 20);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(contactEmail)) throw new CheckoutError("INVALID_INPUT", "Introduce un correo válido.", 422, "contactEmail");
  if (!/^\+?[0-9 ()-]{7,20}$/.test(contactPhone) || contactPhone.replace(/\D/g, "").length < 7) throw new CheckoutError("INVALID_INPUT", "Introduce un teléfono válido.", 422, "contactPhone");
  const addressLine = text(input.addressLine, "addressLine", 5, 240);
  const addressDetail = text(input.addressDetail ?? "", "addressDetail", 0, 300);
  if (typeof input.ubigeo !== "string" || !/^\d{6}$/.test(input.ubigeo)) throw new CheckoutError("INVALID_LOCATION", "Selecciona una ubicación válida.", 422, "ubigeo");
  if (!Array.isArray(input.lines) || input.lines.length < 1 || input.lines.length > 50) throw new CheckoutError("INVALID_CART", "El pedido debe tener entre 1 y 50 líneas.", 422, "lines");
  const keys = new Set<string>();
  const lines = input.lines.map((value, index) => {
    const field = `lines.${index}`;
    const line = readObject(value, ["key", "productId", "variantId", "quantity", "customization"]);
    const key = text(line.key, `${field}.key`, 1, 200);
    if (keys.has(key)) throw new CheckoutError("INVALID_CART", "Las líneas deben tener identificadores distintos.", 422, field);
    keys.add(key);
    if (!isUuid(line.productId) || !isUuid(line.variantId) || !Number.isInteger(line.quantity) || (line.quantity as number) < 1 || (line.quantity as number) > 50) {
      throw new CheckoutError("INVALID_CART", "Revisa el producto, la variante y su cantidad (1 a 50).", 422, field);
    }
    let customization = null;
    if (line.customization !== undefined && line.customization !== null) {
      const option = readObject(line.customization, ["mode", "text"]);
      if (option.mode !== "urn_name") throw new CheckoutError("INVALID_CUSTOMIZATION", "La personalización no está disponible.", 422, `${field}.customization`);
      customization = { mode: "urn_name" as const, text: text(option.text, `${field}.customization.text`, 1, 80) };
    }
    return { key, productId: line.productId, variantId: line.variantId, quantity: line.quantity as number, customization };
  }).sort((a, b) => a.key.localeCompare(b.key));
  return { contactName, contactEmail, contactPhone, addressLine, addressDetail, ubigeo: input.ubigeo, lines };
}
