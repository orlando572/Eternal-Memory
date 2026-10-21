import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { PasswordResetForm } from "@/features/auth/components/PasswordResetForm";

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Elige una contraseña nueva." description="Actualiza el acceso a tu cuenta y continúa cuando estés listo.">
      <PasswordResetForm />
    </AuthLayout>
  );
}
