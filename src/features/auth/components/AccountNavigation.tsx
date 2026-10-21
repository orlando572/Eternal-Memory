"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOutUser } from "@/services/authService";
import { AccountLinks } from "@/features/auth/components/AccountLinks";
import { readCurrentAccess } from "@/features/auth/services/accountAccessClient";
import type { AccountRole } from "@/features/auth/types/access";
import { LoadingIndicator } from "@/features/loading/Loading";
import { DesktopAccountMenu } from "@/features/header/DesktopAccountMenu";

type AccountState = "loading" | "signed-out" | "signed-in" | "error";

export function AccountNavigation() {
  const [accountState, setAccountState] = useState<AccountState>("loading");
  const [role, setRole] = useState<AccountRole | null>(null);
  const [revision, setRevision] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    let readVersion = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();

    async function readAccount() {
      const version = ++readVersion;
      setAccountState("loading");
      setRole(null);
      setError(null);
      try {
        const access = await readCurrentAccess(controller.signal);
        if (!active || version !== readVersion) return;
        setRole(access?.role ?? null);
        setAccountState(access ? "signed-in" : "signed-out");
      } catch (caught) {
        if (!active || version !== readVersion) return;
        setAccountState("error");
        setError(caught instanceof Error ? caught.message : "No se pudo comprobar tu cuenta.");
      }
    }

    async function subscribeToAccount() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        if (!active) return;

        const supabase = createClient();
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!active) return;
          ++readVersion;
          setRole(null);
          setError(null);
          if (timer) clearTimeout(timer);
          if (!session?.user) {
            setAccountState("signed-out");
            return;
          }
          setAccountState("loading");
          // Read through the server outside the Supabase auth callback.
          timer = setTimeout(() => { if (active) void readAccount(); }, 0);
        });
        unsubscribe = () => listener.subscription.unsubscribe();
        await readAccount();
      } catch {
        if (active) setAccountState("signed-out");
      }
    }

    void subscribeToAccount();
    return () => {
      active = false;
      controller.abort();
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, [revision]);

  async function handleSignOut() {
    setSigningOut(true);
    setError(null);
    try {
      await signOutUser();
      setAccountState("signed-out");
      setRole(null);
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
      <div className="header-account-mobile">
        {accountState === "loading" ? (
          <LoadingIndicator label="Comprobando cuenta" className="loading-account" />
        ) : accountState === "signed-in" && role ? (
          <AccountLinks role={role} signingOut={signingOut} onSignOut={handleSignOut} />
        ) : accountState === "error" ? (
          <button type="button" className="site-account-retry" onClick={() => setRevision((value) => value + 1)}>Reintentar acceso</button>
        ) : (
          <Link href="/login">Iniciar sesión</Link>
        )}
        {error && <span className="site-account-error" role="alert">{error}</span>}
      </div>
      <DesktopAccountMenu state={accountState} role={role} signingOut={signingOut} error={error}
        onSignOut={handleSignOut} onRetry={() => setRevision((value) => value + 1)} />
    </div>
  );
}
