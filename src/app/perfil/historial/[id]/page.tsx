import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProfileLayout } from "@/features/auth/components/ProfileLayout";
import { getCurrentAccess } from "@/features/auth/services/accessService";
import { getCurrentProfile } from "@/features/auth/services/profileService";
import { getAccountOrder } from "@/features/account-orders/services/accountOrdersService";
import { OrderDetailView } from "@/features/account-orders/components/OrderDetailView";
import { shortOrderNumber } from "@/features/account-orders/lib/orderPresentation";
import { CheckoutError } from "@/features/checkout/lib/validation";
import type { AccountOrderDetail } from "@/features/account-orders/types/accountOrders";
import "@/features/account-orders/account-orders.css";

export const metadata: Metadata = { title: "Detalle del pedido — Eternal Memory", robots: { index: false, follow: false } };

export default async function ProfileOrderPage({ params }: { params: Promise<{ id: string }> }) {
  let access;
  try {
    access = await getCurrentAccess();
  } catch {
    redirect("/login");
  }

  if (!access) redirect("/login");
  if (access.role === "admin") redirect("/perfil");
  const [{ id }, profile] = await Promise.all([params, getCurrentProfile().catch(() => null)]);

  let order: AccountOrderDetail | null = null;
  let missing = false;
  try {
    order = await getAccountOrder(id);
  } catch (error) {
    missing = error instanceof CheckoutError && error.code === "ORDER_NOT_FOUND";
  }
  // `notFound` interrumpe la ejecución, por eso va fuera del `try`.
  if (missing) notFound();

  return (
    <ProfileLayout
      active="history"
      fullName={profile?.full_name ?? ""}
      email={access.user.email ?? ""}
      role={access.role}
      title={order ? `Pedido ${shortOrderNumber(order.id)}` : "Pedido"}
      description="Consulta los productos, la entrega y el seguimiento de tu pedido."
    >
      <section className="profile-history" aria-labelledby="profile-history-heading">
        <h3 id="profile-history-heading" className="sr-only">Detalle del pedido</h3>
        {order
          ? <OrderDetailView order={order} />
          : <div className="orders-error" role="alert">
            <p>No pudimos cargar este pedido. Inténtalo de nuevo en un momento.</p>
          </div>}
        <Link href="/perfil/historial" className="profile-history-back"><ArrowLeft size={16} aria-hidden="true" /> Volver a mis pedidos</Link>
      </section>
    </ProfileLayout>
  );
}
