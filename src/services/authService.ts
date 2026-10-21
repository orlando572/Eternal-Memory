type Credentials = { email: string; password: string };
type Registration = Credentials & { name: string };

function getRegistrationErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return "No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.";
  }

  const authError = error as { code?: unknown; message?: unknown; status?: unknown };
  const code = typeof authError.code === "string" ? authError.code : "";
  const message = typeof authError.message === "string" ? authError.message.toLowerCase() : "";
  const errorName = error instanceof Error ? error.name : "Error";
  const status = typeof authError.status === "number" ? authError.status : null;

  if (code === "weak_password" || message.includes("password should be at least")) {
    return "La contraseña no cumple la política de seguridad de Supabase. Prueba con una contraseña más larga.";
  }

  if (code === "email_address_invalid") {
    return "El correo no tiene un formato válido. Revísalo e inténtalo de nuevo.";
  }

  if (code === "over_email_send_rate_limit") {
    return "Se alcanzó el límite de correos de confirmación. Espera un momento antes de intentarlo de nuevo.";
  }

  if (code === "signup_disabled" || code === "email_provider_disabled") {
    return "El registro por correo está desactivado en la configuración de Supabase.";
  }

  if (message.includes("database error saving new user")) {
    return "Supabase no pudo guardar el nuevo usuario. Hay que revisar los registros de base de datos y el trigger de creación del perfil.";
  }

  if (errorName === "TypeError" && (message.includes("fetch") || message.includes("network"))) {
    return "No se pudo conectar con Supabase. Revisa la conexión y la configuración del servicio, e inténtalo de nuevo.";
  }

  if (
    code === "redirect_uri_not_allowed" ||
    (message.includes("redirect") && (message.includes("allow") || message.includes("not allowed")))
  ) {
    const callbackUrl = typeof window === "undefined" ? "/auth/callback" : `${window.location.origin}/auth/callback`;
    return `Supabase no permite la URL de confirmación. Agrégala en Authentication > URL Configuration > Redirect URLs: ${callbackUrl}`;
  }

  const safeMessage = message
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[correo]")
    .replace(/\b(?:bearer\s+)?eyJ[a-zA-Z0-9._-]+\b/gi, "[token]")
    .replace(/(token|password|secret)\s*[:=]\s*\S+/gi, "$1=[oculto]")
    .replace(/https?:\/\/\S+/gi, "[URL]")
    .replace(/[^\p{L}\p{N} .,:;()_/-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  const diagnostic = safeMessage || (code && /^[a-z0-9_-]{1,60}$/i.test(code) ? code : `${errorName}${status ? ` HTTP ${status}` : ""}`);
  return `No se pudo crear la cuenta. Diagnóstico: ${diagnostic}. Comparte este detalle para revisar el error.`;
}

function getCallbackUrl(nextPath: string) {
  if (typeof window === "undefined") {
    throw new Error("Esta operación de cuenta debe iniciarse desde el navegador.");
  }

  const callback = new URL("/auth/callback", window.location.origin);
  callback.searchParams.set("next", nextPath);
  return callback.toString();
}

export async function signInUser({ email, password }: Credentials) {
  const { createClient } = await import("@/lib/supabase/client");
  let data;

  try {
    const supabase = createClient();
    const result = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (result.error) throw result.error;
    data = result.data;
  } catch {
    throw new Error("No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.");
  }

  return data;
}

export async function requestEmailChange(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("Escribe un correo electrónico válido.");
  }

  const { createClient } = await import("@/lib/supabase/client");
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Inicia sesión para cambiar el correo.");
    if (user.email?.toLowerCase() === normalizedEmail) {
      return { requiresConfirmation: false };
    }

    const { data, error } = await supabase.auth.updateUser(
      { email: normalizedEmail },
      { emailRedirectTo: getCallbackUrl("/perfil") },
    );
    if (error) throw error;

    return { requiresConfirmation: data.user?.email?.toLowerCase() !== normalizedEmail };
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("already been registered") || message.includes("already exists")) {
      throw new Error("Ese correo ya está asociado a otra cuenta.");
    }
    if (message.includes("inicia sesión")) throw error;
    throw new Error("No se pudo solicitar el cambio de correo. Revisa la dirección e inténtalo de nuevo.");
  }
}

export async function registerUser({ email, password, name }: Registration) {
  const { createClient } = await import("@/lib/supabase/client");

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: getCallbackUrl("/catalogo"),
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(getRegistrationErrorMessage(error));
  }
}

export async function requestPasswordReset(email: string) {
  const { createClient } = await import("@/lib/supabase/client");

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: getCallbackUrl("/restablecer-contrasena"),
    });

    if (error) throw error;
  } catch {
    throw new Error("No fue posible procesar la solicitud. Inténtalo de nuevo más tarde.");
  }
}

export async function updatePassword(password: string) {
  if (password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }

  const { createClient } = await import("@/lib/supabase/client");

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  } catch {
    throw new Error("No se pudo actualizar la contraseña. Solicita un nuevo enlace e inténtalo otra vez.");
  }
}

export async function signOutUser() {
  const { createClient } = await import("@/lib/supabase/client");

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch {
    throw new Error("No se pudo cerrar la sesión. Inténtalo de nuevo.");
  }
}
