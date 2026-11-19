import Link from "next/link";
import { ChevronRight, History, UserRound } from "lucide-react";
import type { AccountRole } from "@/features/auth/types/access";

type ProfileTabsProps = {
  active: "profile" | "history";
  role: AccountRole;
};

export function ProfileTabs({ active, role }: ProfileTabsProps) {
  return (
    <nav className="profile-tabs" aria-label="Secciones de la cuenta">
      <Link href="/perfil" aria-current={active === "profile" ? "page" : undefined}>
        <UserRound size={18} aria-hidden="true" /> <span>Mi perfil</span> <ChevronRight className="profile-nav-chevron" size={16} aria-hidden="true" />
      </Link>
      {role === "user" && (
        <Link href="/perfil/historial" aria-current={active === "history" ? "page" : undefined}>
          <History size={18} aria-hidden="true" /> <span>Historial</span> <ChevronRight className="profile-nav-chevron" size={16} aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}
