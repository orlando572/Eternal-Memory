import Link from "next/link";
import { ArrowUpRight, Boxes, LayoutGrid, ReceiptText } from "lucide-react";

export type AdminSection = "products" | "orders";

export function AdminShell({ active, children }: { active: AdminSection; children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Navegación de administración">
        <div className="admin-sidebar-heading">
          <span className="admin-mark" aria-hidden="true">EM</span>
          <div><strong>Eternal Memory</strong><span>Administración</span></div>
        </div>
        <nav className="admin-side-links" aria-label="Secciones de administración">
          <Link href="/admin/productos" aria-current={active === "products" ? "page" : undefined}><Boxes size={18} aria-hidden="true" /> Productos</Link>
          <Link href="/admin/pedidos" aria-current={active === "orders" ? "page" : undefined}><ReceiptText size={18} aria-hidden="true" /> Pedidos</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <p>{active === "orders" ? "Atiende cada pedido con su historial a la vista." : "Organiza el catálogo antes de publicarlo."}</p>
          <Link href="/catalogo"><LayoutGrid size={16} /> Ver catálogo <ArrowUpRight size={14} /></Link>
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
