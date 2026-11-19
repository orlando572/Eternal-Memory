import type { AccountRole } from "@/features/auth/types/access";

const navigationOrigin = "https://eternal-memory.local";
const adminSections = ["/admin/productos", "/admin/pedidos"];

export function getAdminReturnPath(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.startsWith("/")) return undefined;

  try {
    const destination = new URL(value, navigationOrigin);
    if (
      destination.origin === navigationOrigin &&
      adminSections.some((section) => destination.pathname === section || destination.pathname.startsWith(`${section}/`))
    ) {
      return `${destination.pathname}${destination.search}${destination.hash}`;
    }
  } catch {
    // Malformed or external destinations never become login redirects.
  }
  return undefined;
}

export function getPostLoginPath(role: AccountRole, returnTo?: string): string {
  if (returnTo === "/checkout") return "/checkout";
  if (role === "admin") return getAdminReturnPath(returnTo) ?? "/admin/productos";
  return "/catalogo";
}
