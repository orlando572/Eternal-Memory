"use client";

import type { AccountRole } from "@/features/auth/types/access";

export type AccountAccess = { role: AccountRole };

export async function readCurrentAccess(signal?: AbortSignal): Promise<AccountAccess | null> {
  const message = "No se pudieron verificar los permisos de tu cuenta. Inténtalo de nuevo.";
  try {
    const response = await fetch("/api/auth/role", {
      cache: "no-store",
      credentials: "same-origin",
      signal,
    });
    if (response.status === 401) return null;
    if (!response.ok) throw new Error(message);

    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("role" in data) || (data.role !== "user" && data.role !== "admin")) {
      throw new Error(message);
    }
    return { role: data.role };
  } catch {
    throw new Error(message);
  }
}
