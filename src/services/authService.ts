type Credentials = { email: string; password: string };
type Registration = Credentials & { name: string };

async function getSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("El acceso aún no está configurado. Inténtalo cuando el servicio esté disponible.");
  }
  const { supabase } = await import("@/lib/supabaseClient");
  return supabase;
}

export async function signInUser({ email, password }: Credentials) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function registerUser({ email, password, name }: Registration) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
  if (error) throw error;
  return data;
}
