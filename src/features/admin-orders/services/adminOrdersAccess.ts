import "server-only";

import { redirect } from "next/navigation";
import { getCurrentAccess } from "@/features/auth/services/accessService";

export type AdminOrdersAccess = "ready" | "denied" | "error";

/**
 * Comprueba la sesión antes de mostrar el panel. Sin sesión lleva a iniciar sesión y vuelve aquí;
 * con una cuenta sin rol de administrador, o si no se puede verificar, la página muestra un aviso.
 */
export async function checkAdminOrdersAccess(returnTo: string): Promise<AdminOrdersAccess> {
  let access;
  try {
    access = await getCurrentAccess();
  } catch {
    return "error";
  }
  // `redirect` interrumpe la ejecución, por eso va fuera del `try`.
  if (!access) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return access.role === "admin" ? "ready" : "denied";
}
