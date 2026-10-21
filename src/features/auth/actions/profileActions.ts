"use server";

import { updateCurrentProfile } from "@/features/auth/services/profileService";

export async function saveCurrentProfile(input: unknown) {
  if (!input || typeof input !== "object" || !("full_name" in input)) {
    throw new Error("Los datos del perfil no son válidos.");
  }

  const profile = input as {
    full_name?: unknown;
    phone?: unknown;
    dni?: unknown;
    birth_date?: unknown;
    gender?: unknown;
  };
  if (
    typeof profile.full_name !== "string" ||
    (profile.phone !== undefined && profile.phone !== null && typeof profile.phone !== "string") ||
    (profile.dni !== undefined && profile.dni !== null && typeof profile.dni !== "string") ||
    (profile.birth_date !== undefined && profile.birth_date !== null && typeof profile.birth_date !== "string") ||
    (profile.gender !== undefined && profile.gender !== null && typeof profile.gender !== "string")
  ) {
    throw new Error("Los datos del perfil no son válidos.");
  }

  return updateCurrentProfile({
    full_name: profile.full_name,
    phone: profile.phone as string | null | undefined,
    dni: profile.dni as string | null | undefined,
    birth_date: profile.birth_date as string | null | undefined,
    gender: profile.gender as string | null | undefined,
  });
}
