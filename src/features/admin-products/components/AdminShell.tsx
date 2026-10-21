import Link from "next/link";
import { ArrowUpRight, Boxes, LayoutGrid } from "lucide-react";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Navegación de administración">
        <div className="admin-sidebar-heading">
          <span className="admin-mark" aria-hidden="true">EM</span>
          <div><strong>Eternal Memory</strong><span>Administración</span></div>
        </div>
        <nav className="admin-side-links" aria-label="Secciones de administración">
          <Link href="/admin/productos" aria-current="page"><Boxes size={18} /> Productos</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <p>Organiza el catálogo antes de publicarlo.</p>
          <Link href="/catalogo"><LayoutGrid size={16} /> Ver catálogo <ArrowUpRight size={14} /></Link>
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
