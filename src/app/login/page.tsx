"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("Credenciales:", { email, password });

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleOAuthLogin = (provider: "google" | "apple" | "facebook") => {
    console.log(`Iniciando sesión con ${provider}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-ink text-bone">
      <div className="w-full max-w-md border border-brass/15 bg-ink-800/60 backdrop-blur p-8 rounded-xl shadow-2xl">
        <div className="mb-6 text-center">
          <span className="text-xs uppercase tracking-widest text-bone-500">
            Panel de Acceso
          </span>
          <h1 className="text-2xl font-serif mt-2 tracking-wide text-bone">
            Eternal Memory
          </h1>
          <p className="text-xs text-bone-400 mt-2">
            Ingresa a tu cuenta para gestionar los homenajes y servicios
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-wider text-bone-400 mb-1.5"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded border border-brass/20 bg-ink-900/80 px-3.5 py-2.5 text-sm text-bone placeholder-bone-600 outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs uppercase tracking-wider text-bone-400 mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded border border-brass/20 bg-ink-900/80 px-3.5 py-2.5 text-sm text-bone placeholder-bone-600 outline-none transition focus:border-brass focus:ring-1 focus:ring-brass"
            />
            <div className="mt-1.5 text-right">
              <Link
                href="/recuperar"
                className="text-xs text-bone-500 hover:text-bone transition"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded bg-brass text-ink font-medium py-2.5 text-sm transition hover:bg-brass-300 disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>

        {/* Separador */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-brass/10 w-full" />
          <span className="bg-ink px-3 text-[10px] uppercase tracking-widest text-bone-500 absolute">
          accede con
          </span>
        </div>

        {/* Botones de inicio rápido */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Apple */}
          <button
            type="button"
            onClick={() => handleOAuthLogin("apple")}
            className="flex items-center justify-center py-2.5 px-3 rounded-md border border-brass/20 bg-ink/50 hover:bg-ink-800 hover:border-brass/40 transition text-bone"
            title="Continuar con Apple"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.7-11.7-13.98-5.77-8.81-10.33-19.14-13.68-30.98-3.35-11.84-5.03-22.92-5.03-33.24 0-14.89 3.8-27.18 11.4-36.87 7.6-9.68 17.3-14.63 29.11-14.85 4.56 0 9.8 1.23 15.71 3.69 5.92 2.46 9.77 3.75 11.56 3.86 1.52-.11 5.56-1.46 12.11-4.04 6.56-2.59 12.12-3.74 16.71-3.46 12.4.65 22.42 5.37 30.08 14.17-10.88 6.53-16.19 15.56-15.93 27.09.22 9.03 3.69 16.64 10.42 22.84 6.74 6.2 14.68 9.79 23.83 10.77-2.39 7.4-5.19 14.58-8.42 21.56zM119.22 33.64c0-7.29 2.61-14.14 7.82-20.55 5.22-6.42 11.75-10.78 19.6-13.09.22 1.3.33 2.4.33 3.27 0 7.29-2.72 14.36-8.16 21.21-5.44 6.85-12.18 11.1-20.23 12.77-.22-1.09-.36-2.29-.36-3.61z" />
            </svg>
          </button>

          {/* Google */}
          <button
            type="button"
            onClick={() => handleOAuthLogin("google")}
            className="flex items-center justify-center py-2.5 px-3 rounded-md border border-brass/20 bg-ink/50 hover:bg-ink-800 hover:border-brass/40 transition"
            title="Continuar con Google"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.1-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={() => handleOAuthLogin("facebook")}
            className="flex items-center justify-center py-2.5 px-3 rounded-md border border-brass/20 bg-ink/50 hover:bg-ink-800 hover:border-brass/40 transition"
            title="Continuar con Facebook"
          >
            <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
        </div>

        {/* Registro */}
        <p className="text-center text-xs text-bone-400">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/registro"
            className="text-brass hover:text-brass-300 transition underline underline-offset-4"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
