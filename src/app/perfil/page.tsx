import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { ProfileForm } from "@/features/auth/components/ProfileForm";
import { ProfileLayout } from "@/features/auth/components/ProfileLayout";
import { getCurrentProfile } from "@/features/auth/services/profileService";
import { getCurrentAccess } from "@/features/auth/services/accessService";

export default async function ProfilePage() {
  let access;
  try {
    access = await getCurrentAccess();
  } catch {
    return (
      <AuthLayout title="Tu cuenta, a tu ritmo." description="Los datos de tu cuenta se mantienen privados.">
        <h2 id="auth-panel-title">Perfil no disponible</h2>
        <p role="alert">No se pudo conectar con el servicio de cuenta. Inténtalo más tarde.</p>
      </AuthLayout>
    );
  }

  if (!access) redirect("/login");
  const { user, role } = access;

  let profile;
  try {
    profile = await getCurrentProfile();
  } catch {
    profile = null;
  }

  return (
    <ProfileLayout
      active="profile"
      fullName={profile?.full_name ?? ""}
      email={user.email ?? ""}
      role={role}
      title="Mi perfil"
      description="Consulta y actualiza los datos asociados a tu cuenta."
    >
      {profile ? (
        <ProfileForm
          email={user.email ?? ""}
          fullName={profile.full_name}
          phone={profile.phone}
          dni={profile.dni}
          birthDate={profile.birth_date}
          gender={profile.gender}
        />
      ) : (
        <div className="auth-message error" role="alert">
          <p>No se pudo cargar tu perfil.</p>
          <Link href="/catalogo">Volver al catálogo <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      )}
    </ProfileLayout>
  );
}
