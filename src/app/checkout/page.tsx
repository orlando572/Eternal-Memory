import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAccess } from "@/features/auth/services/accessService";
import { getCurrentProfile } from "@/features/auth/services/profileService";
import { CheckoutForm } from "@/features/checkout/components/CheckoutForm";
import "@/features/checkout/checkout.css";

export const metadata: Metadata = { title: "Revisar pedido — Eternal Memory" };

export default async function CheckoutPage() {
  const access = await getCurrentAccess().catch(() => undefined);
  if (access === null) redirect("/login?next=%2Fcheckout");
  if (!access) return <main className="shop-page checkout-page"><div className="shop-container checkout-empty"><h1>No pudimos cargar tu sesión</h1><p role="alert">Inténtalo de nuevo en un momento. Tu selección se conserva en este navegador.</p><Link href="/checkout">Volver a intentar</Link></div></main>;
  const profile = await getCurrentProfile().catch(() => null);
  return <CheckoutForm key={access.user.id} userId={access.user.id} initialContact={{ contactName: profile?.full_name ?? "", contactEmail: access.user.email ?? "", contactPhone: profile?.phone ?? "" }} />;
}
