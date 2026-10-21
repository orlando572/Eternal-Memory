"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { registerUser } from "@/services/authService";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<"confirmation" | "ready" | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await registerUser({ name, email, password });
      setSuccess(result.session ? "ready" : "confirmation");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Crea tu cuenta con calma."
      description="Puedes seguir viendo productos sin registrarte. Tu selección del carrito se guarda en este navegador."
    >
      <h2 id="auth-panel-title">Crear cuenta</h2>
      <p>Completa estos datos para registrarte.</p>
      {error && <div className="auth-message error" role="alert">{error}</div>}
      {success ? (
        <div className="auth-message success" role="status">
          {success === "confirmation" ? (
            <>
              <p>Confirmación por correo activo, revisa tu bandeja de entrada y sigue el enlace para activar tu cuenta.</p>
              <Link href="/login">Ir a iniciar sesión</Link>
            </>
          ) : (
            <>
              <p>Tu cuenta está lista.</p>
              <Link href="/catalogo">Explorar catálogo</Link>
            </>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="register-name">Nombre completo</label>
          <input id="register-name" type="text" autoComplete="name" required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" />
          <label htmlFor="register-email">Correo electrónico</label>
          <input id="register-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" />
          <label htmlFor="register-password">Contraseña</label>
          <input id="register-password" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Al menos 6 caracteres" aria-describedby="register-password-hint" />
          <span id="register-password-hint" className="auth-field-hint">Usa al menos 6 caracteres.</span>
          <Button type="submit" disabled={loading}>
            {loading ? "Creando cuenta…" : "Crear cuenta"}
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </form>
      )}
      <p className="auth-switch">¿Ya tienes una cuenta? <Link href="/login">Iniciar sesión</Link></p>
    </AuthLayout>
  );
}
