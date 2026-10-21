"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { signOutUser } from "@/services/authService";

type AccountState = "loading" | "signed-out" | "signed-in";

export function AccountNavigation() {
  const [accountState, setAccountState] = useState<AccountState>("loading");
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    async function readAccount() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        if (!active) return;

        const supabase = createClient();
        const { data, error: authError } = await supabase.auth.getUser();
        if (active) setAccountState(!authError && data.user ? "signed-in" : "signed-out");

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (active) setAccountState(session?.user ? "signed-in" : "signed-out");
        });
        unsubscribe = () => listener.subscription.unsubscribe();
      } catch {
        if (active) setAccountState("signed-out");
      }
    }

    void readAccount();
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    setError(null);
    try {
      await signOutUser();
      setAccountState("signed-out");
      router.replace("/");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cerrar la sesión. Inténtalo de nuevo.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="site-account" aria-live="polite">
      {accountState === "loading" ? (
        <span className="site-account-loading" aria-label="Comprobando el estado de tu cuenta">Cuenta…</span>
      ) : accountState === "signed-in" ? (
        <>
          <Link href="/perfil" className="site-account-profile">
            <UserRound size={16} aria-hidden="true" /> <span>Mi perfil</span>
          </Link>
          <button type="button" className="site-account-signout" onClick={handleSignOut} disabled={signingOut} aria-label="Cerrar sesión">
            <LogOut size={16} aria-hidden="true" /> <span>{signingOut ? "Cerrando…" : "Cerrar sesión"}</span>
          </button>
        </>
      ) : (
        <Link href="/login">Iniciar sesión</Link>
      )}
      {error && <span className="site-account-error" role="alert">{error}</span>}
    </div>
  );
}
