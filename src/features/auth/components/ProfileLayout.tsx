import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProfileTabs } from "@/features/auth/components/ProfileTabs";
import { accountRoleLabels, type AccountRole } from "@/features/auth/types/access";

type ProfileLayoutProps = {
  active: "profile" | "history";
  fullName: string;
  email: string;
  role: AccountRole;
  title: string;
  description: string;
  children: ReactNode;
};

export function ProfileLayout({ active, fullName, email, role, title, description, children }: ProfileLayoutProps) {
  const initial = fullName.trim().slice(0, 1).toLocaleUpperCase("es") || email.slice(0, 1).toLocaleUpperCase("es");

  return (
    <main id="main-content" className="shop-page profile-page">
      <header className="shop-heading">
        <div className="shop-container profile-page-heading">
          <div>
            <Link href="/" className="shop-back-link">Volver al inicio <ArrowRight size={14} aria-hidden="true" /></Link>
            <h1>Tu cuenta, a tu ritmo.</h1>
            <p>{description}</p>
          </div>
          <Link href="/catalogo" className="auth-catalog-link">Explorar catálogo <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </header>

      <div className="shop-container profile-workspace">
        <aside className="profile-sidebar" aria-label="Tu cuenta">
          <div className="profile-account-summary">
            <div className="profile-avatar" aria-hidden="true">{initial}</div>
            <div className="profile-account-identity">
              <p className="profile-account-name">{fullName || "Mi perfil"}</p>
              <p className="profile-account-email">{email}</p>
            </div>
            <p className="profile-account-role">Rol de la cuenta: <strong>{accountRoleLabels[role]}</strong></p>
          </div>
          <ProfileTabs active={active} role={role} />
          <Link href="/catalogo" className="profile-sidebar-back"><ArrowLeft size={15} aria-hidden="true" /> Volver al catálogo</Link>
        </aside>

        <section className="auth-panel profile-panel" aria-labelledby="auth-panel-title">
          <h2 id="auth-panel-title">{title}</h2>
          {children}
        </section>
      </div>
    </main>
  );
}
