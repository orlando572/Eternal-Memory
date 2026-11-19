import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileLayout } from "@/features/auth/components/ProfileLayout";
import { getCurrentAccess } from "@/features/auth/services/accessService";
import { getCurrentProfile } from "@/features/auth/services/profileService";
import { listAccountOrders } from "@/features/account-orders/services/accountOrdersService";
import { OrderHistoryList } from "@/features/account-orders/components/OrderHistoryList";
import { historyPageHref } from "@/features/account-orders/lib/orderPresentation";
import type { AccountOrderList } from "@/features/account-orders/types/accountOrders";
import "@/features/account-orders/account-orders.css";

export const metadata: Metadata = { title: "Mis pedidos — Eternal Memory", robots: { index: false, follow: false } };

export default async function ProfileHistoryPage({ searchParams }: { searchParams: Promise<{ pagina?: string | string[] }> }) {
  let access;
  try {
    access = await getCurrentAccess();
  } catch {
    redirect("/login");
  }

  if (!access) redirect("/login");
  if (access.role === "admin") redirect("/perfil");
  const [{ pagina }, profile] = await Promise.all([searchParams, getCurrentProfile().catch(() => null)]);

  const params = new URLSearchParams();
  if (typeof pagina === "string") params.set("pagina", pagina);
  let list: AccountOrderList | null = null;
  try {
    list = await listAccountOrders(params);
  } catch {
    list = null;
  }
  // Una página fuera de rango se lleva a la última que tiene pedidos.
  if (list && list.orders.length === 0 && list.total > 0) redirect(historyPageHref(list.totalPages));

  return (
    <ProfileLayout
      active="history"
      fullName={profile?.full_name ?? ""}
      email={access.user.email ?? ""}
      role={access.role}
      title="Mis pedidos"
      description="Consulta el estado de tus pedidos y de su pago."
    >
      <section className="profile-history" aria-labelledby="profile-history-heading">
        <h3 id="profile-history-heading">Historial de pedidos</h3>
        {list
          ? <OrderHistoryList list={list} />
          : <div className="orders-error" role="alert">
            <p>No pudimos cargar tus pedidos. Inténtalo de nuevo en un momento.</p>
            <Link href="/perfil/historial" className="profile-history-back">Volver a intentar</Link>
          </div>}
      </section>
    </ProfileLayout>
  );
}
