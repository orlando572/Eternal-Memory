"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { LoadingButton } from "@/features/loading/LoadingButton";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { signInUser } from "@/services/authService";
import { readCurrentAccess } from "@/features/auth/services/accountAccessClient";
import { getPostLoginPath } from "@/features/auth/lib/roleNavigation";

type LoginFormProps = {
  callbackError: boolean;
  returnTo?: string;
};

export function LoginForm({ callbackError, returnTo }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    callbackError ? "El enlace no se pudo validar o ya venció. Solicita uno nuevo e inténtalo otra vez." : null,
  );
  const router = useRouter();
  const [navigating, startNavigation] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInUser({ email, password });
      const access = await readCurrentAccess();
      if (!access) throw new Error("La sesión no está disponible. Inicia sesión de nuevo.");
      startNavigation(() => { router.replace(getPostLoginPath(access.role, returnTo)); router.refresh(); });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Accede a tu cuenta con calma."
      description="Puedes explorar el catálogo sin iniciar sesión. Tu selección del carrito se guarda en este navegador."
    >
      <h2 id="auth-panel-title">Iniciar sesión</h2>
      <p>Ingresa con tu correo y contraseña.</p>
      {error && <div className="auth-message error" role="alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="login-email">Correo electrónico</label>
        <input id="login-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" />
        <label htmlFor="login-password">Contraseña</label>
        <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tu contraseña" />
        <p className="auth-forgot-link"><Link href="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link></p>
        <LoadingButton busy={loading || navigating} type="submit" disabled={loading}>
          Ingresar
          <ArrowRight size={18} aria-hidden="true" />
        </LoadingButton>
      </form>
      <p className="auth-switch">¿Aún no tienes cuenta? <Link href="/registro">Crear cuenta</Link></p>
    </AuthLayout>
  );
}
