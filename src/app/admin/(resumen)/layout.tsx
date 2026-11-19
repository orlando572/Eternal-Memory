import type { Metadata } from "next";
import { AdminShell } from "@/features/admin-products/components/AdminShell";
import "@/features/admin-products/admin-products.css";
import "@/features/admin-orders/admin-orders.css";
import "@/features/admin-summary/admin-summary.css";

// Grupo de rutas: `/admin` tiene su propio `AdminShell` sin envolver a `productos` ni a `pedidos`.

export const metadata: Metadata = {
  title: "Resumen — Administración de Eternal Memory",
  description: "Página de inicio del administrador con los pedidos por atender y el estado del catálogo.",
  robots: { index: false, follow: false },
};

export default function AdminSummaryLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell active="summary">{children}</AdminShell>;
}
