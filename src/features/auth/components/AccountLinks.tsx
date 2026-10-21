"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import type { AccountRole } from "@/features/auth/types/access";

type AccountLinksProps = {
  role: AccountRole;
  signingOut: boolean;
  onSignOut: () => void;
};

export function AccountLinks({ role, signingOut, onSignOut }: AccountLinksProps) {
  return (
    <>
      {role === "admin" && (
        <Link href="/admin/productos" className="site-account-admin">
          <LayoutDashboard size={16} aria-hidden="true" /> <span>Administración</span>
        </Link>
      )}
      <Link href="/perfil" className="site-account-profile">
        <UserRound size={16} aria-hidden="true" /> <span>Mi perfil</span>
      </Link>
      <button type="button" className="site-account-signout" onClick={onSignOut} disabled={signingOut} aria-label="Cerrar sesión">
        <LogOut size={16} aria-hidden="true" /> <span>{signingOut ? "Cerrando…" : "Cerrar sesión"}</span>
      </button>
    </>
  );
}
