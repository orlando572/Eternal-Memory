import { LoginForm } from "@/features/auth/components/LoginForm";
import { getAdminReturnPath, getPostLoginPath } from "@/features/auth/lib/roleNavigation";
import { getCurrentAccess } from "@/features/auth/services/accessService";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<{ error?: string | string[]; next?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, next } = await searchParams;
  const returnTo = getAdminReturnPath(next);
  const access = await getCurrentAccess().catch(() => null);
  if (access && error !== "auth_callback") {
    redirect(getPostLoginPath(access.role, returnTo));
  }

  return <LoginForm callbackError={error === "auth_callback"} returnTo={returnTo} />;
}
