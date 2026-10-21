import "server-only";

import type { User } from "@supabase/supabase-js";
import type { AccountRole } from "@/features/auth/types/access";
import { createClient } from "@/lib/supabase/server";

export type CurrentAccess = {
  user: User;
  role: AccountRole;
};

export class AccountAccessError extends Error {
  constructor(message: string, public readonly status: 401 | 403 | 503) {
    super(message);
    this.name = "AccountAccessError";
  }
}

export async function getCurrentAccess(): Promise<CurrentAccess | null> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  // Uses the verified identity and the same table as the product RLS policies.
  // Never derive permissions from user_metadata or a role supplied by the client.
  const { data, error } = await supabase
    .from("staff_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || (data && data.role !== "admin")) {
    throw new AccountAccessError("No se pudieron verificar los permisos de la cuenta. Inténtalo de nuevo.", 503);
  }

  return { user, role: data?.role === "admin" ? "admin" : "user" };
}

export async function requireUser(): Promise<CurrentAccess> {
  const access = await getCurrentAccess();
  if (!access) {
    throw new AccountAccessError("Inicia sesión para continuar.", 401);
  }
  return access;
}

export async function requireAdmin(): Promise<CurrentAccess> {
  const access = await requireUser();
  if (access.role !== "admin") {
    throw new AccountAccessError("No tienes permisos de administrador para realizar esta acción.", 403);
  }
  return access;
}
