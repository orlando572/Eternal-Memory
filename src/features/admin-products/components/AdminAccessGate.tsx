"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLoading } from "./AdminLoading";
import type { SupabaseClient } from "@supabase/supabase-js";

const AdminClientContext = createContext<SupabaseClient | null>(null);
export function useAdminClient() {
  const client = useContext(AdminClientContext);
  if (!client) throw new Error("La sesión de administración no está disponible.");
  return client;
}

export function AdminAccessGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [state, setState] = useState<"loading" | "login" | "denied" | "error" | "ready">("loading");
  useEffect(() => {
    let active = true;
    async function check() {
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          if (active) setState("error");
          return;
        }
        const { supabase } = await import("@/lib/supabaseClient");
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!active) return;
        if (authError || !user) { setState("login"); return; }
        const { data, error } = await supabase.from("staff_roles").select("role")
          .eq("user_id", user.id).eq("role", "admin").maybeSingle();
        if (!active) return;
        if (error) { setState("error"); return; }
        if (!data) { setState("denied"); return; }
        setClient(supabase);
        setState("ready");
      } catch {
        if (active) setState("error");
      }
    }
    void check();
    return () => { active = false; };
  }, []);

  if (state === "ready" && client) return <AdminClientContext.Provider value={client}>{children}</AdminClientContext.Provider>;
  if (state === "loading") return <AdminLoading editor={pathname !== "/admin/productos"} />;
  const returnTo = typeof window === "undefined" ? "/admin/productos" : window.location.pathname + window.location.search;
  return <section className="admin-content admin-access-state" role="alert">
    <h1>{state === "login" ? "Inicia sesión para administrar productos" : state === "denied" ? "No tienes permisos para administrar productos" : "No se pudo comprobar el acceso"}</h1>
    {state === "login" && <Link href={`/login?next=${encodeURIComponent(returnTo)}`}>Ir a iniciar sesión</Link>}
    {state === "denied" && <Link href="/catalogo">Volver al catálogo</Link>}
    {state === "error" && <button type="button" onClick={() => window.location.reload()}>Reintentar</button>}
  </section>;
}
