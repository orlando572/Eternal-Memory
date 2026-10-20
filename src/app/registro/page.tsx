"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { registerUser } from "@/services/authService";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerUser({ name, email, password });
      setSuccess(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo crear la cuenta. Inténtalo otra vez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shop-page auth-page">
      <div className="auth-layout shop-container">
        <div className="auth-intro"><Link href="/" className="shop-back-link">Volver al inicio <ArrowRight size={14} /></Link><h1>Crea tu cuenta con calma.</h1><p>Puedes seguir viendo productos sin registrarte. La selección del carrito se guarda en este navegador.</p><Link href="/catalogo" className="auth-catalog-link">Explorar catálogo <ArrowRight size={18} /></Link></div>
        <div className="auth-panel">
          <h2>Crear cuenta</h2>
          <p>Completa estos datos para registrarte.</p>
          {error && <div className="auth-message error" role="alert">{error}</div>}
          {success ? <div className="auth-message success" role="status">Cuenta creada. Si recibes un correo de confirmación, sigue sus instrucciones. <Link href="/login">Ir a iniciar sesión</Link></div> : (
            <form onSubmit={handleSubmit}>
              <label htmlFor="register-name">Nombre completo</label>
              <input id="register-name" type="text" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" />
              <label htmlFor="register-email">Correo electrónico</label>
              <input id="register-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" />
              <label htmlFor="register-password">Contraseña</label>
              <input id="register-password" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Al menos 6 caracteres" />
              <Button type="submit" disabled={loading}>{loading ? "Creando cuenta…" : "Crear cuenta"} <ArrowRight size={18} /></Button>
            </form>
          )}
          <p className="auth-switch">¿Ya tienes una cuenta? <Link href="/login">Iniciar sesión</Link></p>
        </div>
      </div>
    </main>
  );
}
