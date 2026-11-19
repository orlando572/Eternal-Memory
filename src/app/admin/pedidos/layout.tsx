import type { Metadata } from "next";
import { AdminShell } from "@/features/admin-products/components/AdminShell";
import "@/features/admin-products/admin-products.css";
import "@/features/admin-orders/admin-orders.css";

export const metadata: Metadata = {
  title: "Pedidos — Administración de Eternal Memory",
  description: "Panel interno para buscar, filtrar y atender pedidos.",
  robots: { index: false, follow: false },
};

export default function AdminOrdersLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell active="orders">{children}</AdminShell>;
}
