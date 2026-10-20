"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInUser } from "@/services/authService";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInUser({ email, password });
      router.push("/catalogo");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo iniciar sesión. Inténtalo otra vez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shop-page auth-page">
      <div className="auth-layout shop-container">
        <div className="auth-intro"><Link href="/" className="shop-back-link">Volver al inicio <ArrowRight size={14} /></Link><h1>Accede a tu cuenta con calma.</h1><p>Puedes explorar el catálogo sin iniciar sesión. La selección del carrito se guarda en este navegador.</p><Link href="/catalogo" className="auth-catalog-link">Explorar catálogo <ArrowRight size={18} /></Link></div>
        <div className="auth-panel">
          <h2>Iniciar sesión</h2>
          <p>Ingresa con tu correo y contraseña.</p>
          {error && <div className="auth-message error" role="alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="login-email">Correo electrónico</label>
            <input id="login-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" />
            <label htmlFor="login-password">Contraseña</label>
            <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tu contraseña" />
            <Button type="submit" disabled={loading}>{loading ? "Ingresando…" : "Ingresar"} <ArrowRight size={18} /></Button>
          </form>
          <p className="auth-switch">¿Aún no tienes cuenta? <Link href="/registro">Crear cuenta</Link></p>
        </div>
      </div>
    </main>
  );
}
