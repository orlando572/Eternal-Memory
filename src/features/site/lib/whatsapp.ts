// Formulario de contacto que abre WhatsApp con el mensaje ya escrito. No guarda ni envía nada
// por sí mismo: el mensaje solo llega cuando la persona pulsa «Enviar» en WhatsApp.

export const CONTACT_NAME_MIN = 2;
export const CONTACT_NAME_MAX = 80;
export const CONTACT_MESSAGE_MIN = 10;
export const CONTACT_MESSAGE_MAX = 500;

export type ContactErrors = { name?: string; message?: string };
export type ContactInput = { name: string; message: string };

// Quita los caracteres de control y de formato, que no tienen sentido en un mensaje.
const controls = /[\p{Cc}\p{Cf}]/gu;

export function cleanName(value: string): string {
  return value.normalize("NFC").replace(controls, " ").replace(/\s+/g, " ").trim();
}

// Conserva los saltos de línea; quita el resto de caracteres de control y compacta los espacios.
export function cleanMessage(value: string): string {
  const text = value.normalize("NFC").replace(/\r\n?/g, "\n").replace(/\t/g, " ");
  return text.replace(controls, (char) => (char === "\n" ? char : ""))
    .replace(/[^\S\n]+/g, " ").replace(/ ?\n ?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function readContactInput(name: string, message: string): { ok: true; value: ContactInput } | { ok: false; errors: ContactErrors } {
  const cleanedName = cleanName(name);
  const cleanedMessage = cleanMessage(message);
  const errors: ContactErrors = {};
  const nameLength = [...cleanedName].length;
  const messageLength = [...cleanedMessage].length;
  if (nameLength < CONTACT_NAME_MIN || nameLength > CONTACT_NAME_MAX) {
    errors.name = `Escribe tu nombre (entre ${CONTACT_NAME_MIN} y ${CONTACT_NAME_MAX} caracteres).`;
  }
  if (messageLength < CONTACT_MESSAGE_MIN || messageLength > CONTACT_MESSAGE_MAX) {
    errors.message = `Cuéntanos tu consulta (entre ${CONTACT_MESSAGE_MIN} y ${CONTACT_MESSAGE_MAX} caracteres).`;
  }
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value: { name: cleanedName, message: cleanedMessage } };
}

/** Enlace de WhatsApp con el texto prellenado. Solo acepta enlaces `https://wa.me/<número>`. */
export function buildWhatsAppUrl(baseUrl: string, input: ContactInput): string {
  if (!/^https:\/\/wa\.me\/\d{8,15}$/.test(baseUrl)) throw new Error("INVALID_WHATSAPP_URL");
  const text = `Hola, soy ${input.name}. Escribo desde la web de Eternal Memory.\n\n${input.message}`;
  return `${baseUrl}?text=${encodeURIComponent(text)}`;
}
