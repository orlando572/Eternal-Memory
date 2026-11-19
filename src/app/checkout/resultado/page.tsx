import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAccess } from "@/features/auth/services/accessService";
import { PaymentResult } from "@/features/checkout/components/PaymentResult";
import { isUuid } from "@/features/checkout/lib/validation";
import "@/features/checkout/checkout.css";

export const metadata: Metadata = { title: "Resultado del pago — Eternal Memory", robots: { index: false, follow: false } };

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ pedido?: string | string[]; cancelado?: string | string[] }> }) {
  const { pedido, cancelado } = await searchParams;
  const access = await getCurrentAccess().catch(() => undefined);
  if (access === null) redirect("/login");
  if (!access) return <main className="shop-page checkout-page"><div className="shop-container checkout-empty"><h1>No pudimos cargar tu sesión</h1><p role="alert">Inténtalo de nuevo en un momento.</p><Link href="/checkout/resultado">Volver a intentar</Link></div></main>;
  if (typeof pedido !== "string" || !isUuid(pedido)) {
    return <main className="shop-page checkout-page"><div className="shop-container checkout-empty"><h1>No encontramos este pedido</h1><p>El enlace no es válido. Revisa tus pedidos desde tu cuenta.</p><Link href="/perfil/historial">Ir a mis pedidos</Link></div></main>;
  }
  return <main className="shop-page checkout-page"><div className="shop-container"><PaymentResult key={pedido} orderId={pedido} canceledByUser={cancelado === "1"} /></div></main>;
}
