import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProfileLayout } from "@/features/auth/components/ProfileLayout";
import { getCurrentAccess } from "@/features/auth/services/accessService";
import { getCurrentProfile } from "@/features/auth/services/profileService";

export default async function ProfileHistoryPage() {
  let access;
  try {
    access = await getCurrentAccess();
  } catch {
    redirect("/login");
  }

  if (!access) redirect("/login");
  if (access.role === "admin") redirect("/perfil");
  const profile = await getCurrentProfile().catch(() => null);

  return (
    <ProfileLayout
      active="history"
      fullName={profile?.full_name ?? ""}
      email={access.user.email ?? ""}
      role={access.role}
      title="Mi cuenta"
      description="Consulta la información vinculada a tu cuenta."
    >
      <section className="profile-history" aria-labelledby="profile-history-heading">
        <h3 id="profile-history-heading">Historial de pedidos</h3>
        <p>Esta sección estará disponible más adelante.</p>
        <Link href="/perfil" className="profile-history-back"><ArrowLeft size={16} aria-hidden="true" /> Volver a mi perfil</Link>
      </section>
    </ProfileLayout>
  );
}
