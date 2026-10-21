import { LoginForm } from "@/features/auth/components/LoginForm";

type LoginPageProps = {
  searchParams: Promise<{ error?: string | string[]; next?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, next } = await searchParams;
  let returnTo = "/catalogo";

  if (typeof next === "string" && next.startsWith("/")) {
    try {
      const destination = new URL(next, "https://eternal-memory.local");
      if (
        destination.origin === "https://eternal-memory.local" &&
        (destination.pathname === "/admin/productos" || destination.pathname.startsWith("/admin/productos/"))
      ) {
        returnTo = `${destination.pathname}${destination.search}${destination.hash}`;
      }
    } catch {
      // Invalid return URLs keep the public catalog as their destination.
    }
  }

  return <LoginForm callbackError={error === "auth_callback"} returnTo={returnTo} />;
}
