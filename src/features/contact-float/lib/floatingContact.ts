// Botón flotante de contacto (TSK-35). Lógica sin dependencias de React para probarla con `node --test`.

/** Rutas donde el botón estorba o no corresponde: administración y todo el recorrido de pago. */
const HIDDEN_ROOTS = ["/admin", "/checkout"];

export function isFloatingContactHidden(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return HIDDEN_ROOTS.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}

/** Mensaje que aparece escrito al abrir WhatsApp. */
export const FLOATING_MESSAGE = "Hola, vengo de la página de Eternal Memory, tengo una consulta:";

/** Enlace de WhatsApp con el mensaje prellenado. Solo acepta enlaces `https://wa.me/<número>`. */
export function buildFloatingUrl(baseUrl: string): string {
  if (!/^https:\/\/wa\.me\/\d{8,15}$/.test(baseUrl)) throw new Error("INVALID_WHATSAPP_URL");
  return `${baseUrl}?text=${encodeURIComponent(FLOATING_MESSAGE)}`;
}
