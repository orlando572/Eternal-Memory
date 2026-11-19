"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FormSkeleton, LoadingRegion } from "@/features/loading/Loading";
import { ArrowRight } from "lucide-react";
import { LoadingButton } from "@/features/loading/LoadingButton";
import { updatePassword } from "@/services/authService";

type RecoveryState = "checking" | "ready" | "invalid";

export function PasswordResetForm() {
  const [recoveryState, setRecoveryState] = useState<RecoveryState>("checking");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkRecoverySession() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const { data, error: authError } = await createClient().auth.getUser();
        if (active) setRecoveryState(!authError && data.user ? "ready" : "invalid");
      } catch {
        if (active) setRecoveryState("invalid");
      }
    }
    void checkRecoverySession();
    return () => { active = false; };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmation) {
      setError("Las contraseñas no coinciden. Revísalas e inténtalo de nuevo.");
      return;
    }

    setPending(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      setPassword("");
      setConfirmation("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo actualizar la contraseña. Solicita otro enlace.");
    } finally {
      setPending(false);
    }
  }

  if (recoveryState === "checking") {
    return (
      <>
        <h2 id="auth-panel-title">Comprobar enlace</h2>
        <LoadingRegion label="Comprobando enlace de recuperación"><FormSkeleton fields={2} /></LoadingRegion>
      </>
    );
  }

  if (recoveryState === "invalid") {
    return (
      <>
        <h2 id="auth-panel-title">El enlace no está disponible</h2>
        <div className="auth-message error" role="alert">
          <p>Este enlace no es válido o ya venció.</p>
          <Link href="/recuperar-contrasena">Solicitar otro enlace</Link>
        </div>
      </>
    );
  }

  if (success) {
    return (
      <>
        <h2 id="auth-panel-title">Contraseña actualizada</h2>
        <div className="auth-message success" role="status">
          <p>Tu contraseña se actualizó.</p>
          <Link href="/perfil">Ir a mi perfil</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 id="auth-panel-title">Crear una contraseña nueva</h2>
      {error && <div className="auth-message error" role="alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="reset-password">Nueva contraseña</label>
        <input id="reset-password" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby="reset-password-hint" />
        <span id="reset-password-hint" className="auth-field-hint">Al menos 6 caracteres.</span>
        <label htmlFor="reset-confirmation">Confirma la contraseña</label>
        <input id="reset-confirmation" type="password" autoComplete="new-password" required minLength={6} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
        <LoadingButton busy={pending} type="submit" disabled={pending}>
          Guardar contraseña
          <ArrowRight size={18} aria-hidden="true" />
        </LoadingButton>
      </form>
      <p className="auth-switch"><Link href="/login">Volver a iniciar sesión</Link></p>
    </>
  );
}
