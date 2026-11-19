
import Link from "next/link";
import { ArrowUpRight, Boxes, LayoutDashboard, LayoutGrid, ReceiptText } from "lucide-react";

export type AdminSection = "summary" | "products" | "orders";

const footerText: Record<AdminSection, string> = {
  summary: "Revisa qué atender antes de entrar a cada sección.",
  products: "Organiza el catálogo antes de publicarlo.",
  orders: "Atiende cada pedido con su historial a la vista.",
};

export function AdminShell({ active, children }: { active: AdminSection; children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Navegación de administración">
        <div className="admin-sidebar-heading">
          <span className="admin-mark" aria-hidden="true">EM</span>
          <div><strong>Eternal Memory</strong><span>Administración</span></div>
        </div>
        <nav className="admin-side-links" aria-label="Secciones de administración">
          <Link href="/admin" aria-current={active === "summary" ? "page" : undefined}><LayoutDashboard size={18} aria-hidden="true" /> Resumen</Link>
          <Link href="/admin/productos" aria-current={active === "products" ? "page" : undefined}><Boxes size={18} aria-hidden="true" /> Productos</Link>
          <Link href="/admin/pedidos" aria-current={active === "orders" ? "page" : undefined}><ReceiptText size={18} aria-hidden="true" /> Pedidos</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <p>{footerText[active]}</p>
          <Link href="/catalogo"><LayoutGrid size={16} /> Ver catálogo <ArrowUpRight size={14} /></Link>
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
