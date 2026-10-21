"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { AccountRole } from "@/features/auth/types/access";
import { HeaderIcon } from "@/features/header/HeaderIcon";

type DesktopAccountMenuProps = {
  state: "loading" | "signed-out" | "signed-in" | "error";
  role: AccountRole | null;
  signingOut: boolean;
  error: string | null;
  onSignOut: () => Promise<void>;
  onRetry: () => void;
};

export function DesktopAccountMenu({ state, role, signingOut, error, onSignOut, onRetry }: DesktopAccountMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }
    function closeOnResize() {
      if (window.innerWidth <= 900) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnResize);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnResize);
    };
  }, [open]);

  return (
    <div className="header-account-menu" ref={rootRef}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <Button ref={triggerRef} className="header-account-trigger" variant="ghost" type="button"
        aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)}>
        <HeaderIcon name="account" /><span>Mi cuenta</span><HeaderIcon name="chevron" />
      </Button>
      <div className="header-account-panel" id={panelId} hidden={!open}>
        <p className="header-account-heading">{state === "signed-in" ? "Tu espacio personal" : "Bienvenido a Eternal Memory"}</p>
        {state === "loading" ? <p className="header-account-status" role="status">Comprobando tu cuenta…</p>
          : state === "error" ? <Button variant="outline" type="button" onClick={onRetry}>Reintentar acceso</Button>
          : state === "signed-in" && role ? (
            <>
              <ul>
                <li><Link href="/perfil" onClick={() => setOpen(false)}>Mi perfil</Link></li>
                {role === "user" && <li><Link href="/perfil/historial" onClick={() => setOpen(false)}>Mis pedidos</Link></li>}
                {role === "admin" && <li><Link href="/admin/productos" onClick={() => setOpen(false)}>Administración</Link></li>}
              </ul>
              <Button className="header-signout" variant="ghost" type="button" disabled={signingOut}
                onClick={() => void onSignOut()}>{signingOut ? "Cerrando sesión…" : "Cerrar sesión"}</Button>
            </>
          ) : (
            <ul>
              <li><Link className="header-login" href="/login" onClick={() => setOpen(false)}>Iniciar sesión</Link></li>
              <li><Link href="/registro" onClick={() => setOpen(false)}>Crear una cuenta</Link></li>
            </ul>
          )}
        {error && <p className="header-account-message" role="alert">{error}</p>}
      </div>
    </div>
  );
}
