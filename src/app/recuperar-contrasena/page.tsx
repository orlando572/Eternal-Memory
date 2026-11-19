"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LoadingButton } from "@/features/loading/LoadingButton";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { requestPasswordReset } from "@/services/authService";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible procesar la solicitud. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout title="Recupera el acceso a tu cuenta." description="Te ayudaremos a volver a entrar con un enlace enviado a tu correo.">
      <h2 id="auth-panel-title">Recuperar contraseña</h2>
      <p>Escribe el correo asociado a tu cuenta.</p>
      {error && <div className="auth-message error" role="alert">{error}</div>}
      {sent ? (
        <div className="auth-message success" role="status">
          <p>En el correo asociado a la cuenta, recibirás instrucciones para recuperar el acceso.</p>
          <Link href="/login">Volver a iniciar sesión</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="recovery-email">Correo electrónico</label>
          <input id="recovery-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" />
          <LoadingButton busy={pending} type="submit" disabled={pending}>
            Enviar enlace
            <ArrowRight size={18} aria-hidden="true" />
          </LoadingButton>
        </form>
      )}
      <p className="auth-switch"><Link href="/login">Volver a iniciar sesión</Link></p>
    </AuthLayout>
  );
}
