import type { Metadata } from "next";
import { AdminAccessGate } from "@/features/admin-products/components/AdminAccessGate";
import { AdminShell } from "@/features/admin-products/components/AdminShell";
import "@/features/admin-products/admin-products.css";

export const metadata: Metadata = {
  title: "Administración de productos — Eternal Memory",
  description: "Interfaz de administración del catálogo de Eternal Memory.",
};

export default function AdminProductsLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell><AdminAccessGate>{children}</AdminAccessGate></AdminShell>;
}
