'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/services/authService';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await registerUser(formData);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-[#c9d1d9] px-4 py-12">
      <div className="w-full max-w-[440px] bg-[#161b22]/80 border border-[#21262d] rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        
        {/* Encabezado */}
        <div className="text-center mb-8">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-[#8b949e] uppercase block mb-2">
            REGISTRO DE USUARIO
          </span>
          <h1 className="text-3xl font-serif text-[#f0f6fc] tracking-tight mb-2">
            Eternal Memory
          </h1>
          <p className="text-xs text-[#8b949e]">
            Crea una cuenta para gestionar los homenajes y servicios
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-950/30 border border-red-800/50 text-red-400 rounded-lg text-xs text-center">
            {error}
          </div>
        )}

        {/* Mensaje de Éxito o Formulario */}
        {success ? (
          <div className="p-4 bg-emerald-950/30 border border-emerald-800/50 text-emerald-400 rounded-lg text-center text-xs leading-relaxed">
            ¡Cuenta creada con éxito! Revisa tu correo electrónico para confirmarla. Redirigiendo...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                className="w-full px-4 py-2.5 bg-[#0d1117]/60 border border-[#21262d] rounded-lg text-sm text-[#f0f6fc] placeholder-[#484f58] focus:outline-none focus:border-[#a37943] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className="w-full px-4 py-2.5 bg-[#0d1117]/60 border border-[#21262d] rounded-lg text-sm text-[#f0f6fc] placeholder-[#484f58] focus:outline-none focus:border-[#a37943] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-[#0d1117]/60 border border-[#21262d] rounded-lg text-sm text-[#f0f6fc] placeholder-[#484f58] focus:outline-none focus:border-[#a37943] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#b58849] hover:bg-[#966f3a] active:bg-[#7a5a2f] disabled:opacity-50 text-[#0d1117] font-semibold text-sm rounded-lg transition-colors duration-200 mt-2"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>
        )}

        {/* Pie del Card */}
        <div className="mt-8 text-center text-xs text-[#8b949e]">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-[#b58849] hover:underline font-medium ml-1">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
