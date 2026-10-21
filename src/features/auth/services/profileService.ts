import "server-only";

import { createClient } from "@/lib/supabase/server";

export type UserProfile = {
  id: string;
  full_name: string;
  phone: string | null;
  dni: string | null;
  birth_date: string | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
};

const genderValues = ["female", "male", "non_binary", "prefer_not_to_say"] as const;

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, dni, birth_date, gender, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw new Error("No se pudo cargar el perfil.");
  return data;
}

export async function updateCurrentProfile(input: {
  full_name: string;
  phone?: string | null;
  dni?: string | null;
  birth_date?: string | null;
  gender?: string | null;
}) {
  const fullName = input.full_name.trim();
  const phone = input.phone?.trim() || null;
  const dni = input.dni?.trim() || null;
  const birthDate = input.birth_date?.trim() || null;
  const gender = input.gender || null;

  if (fullName.length < 2 || fullName.length > 120) {
    throw new Error("El nombre debe tener entre 2 y 120 caracteres.");
  }

  if (phone && phone.length > 30) {
    throw new Error("El teléfono no puede superar los 30 caracteres.");
  }

  if (dni && !/^\d{8}$/.test(dni)) {
    throw new Error("El DNI debe tener 8 dígitos.");
  }

  if (birthDate) {
    const date = new Date(`${birthDate}T00:00:00`);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || Number.isNaN(date.getTime()) || date > today) {
      throw new Error("La fecha de nacimiento no es válida.");
    }
  }

  if (gender && !genderValues.includes(gender as (typeof genderValues)[number])) {
    throw new Error("Selecciona una opción válida para el género.");
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Inicia sesión para actualizar tu perfil.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone, dni, birth_date: birthDate, gender })
    .eq("id", user.id)
    .select("id, full_name, phone, dni, birth_date, gender, created_at, updated_at")
    .single();

  if (error || !data) throw new Error("No se pudo guardar el perfil.");
  return data;
}
