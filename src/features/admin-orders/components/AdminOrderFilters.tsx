import Form from "next/form";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { orderStatusLabel } from "@/features/checkout/lib/checkoutClient";
import { ADMIN_ORDERS_PATH, ADMIN_SEARCH_MAX_LENGTH, ORDER_STATUSES, adminOrdersHref, hasActiveFilters } from "@/features/admin-orders/lib/adminOrders";
import type { AdminOrderFilters as Filters } from "@/features/admin-orders/types/adminOrders";

/** Formulario GET: los filtros viven en la URL, se pueden compartir y funcionan sin JavaScript. */
export function AdminOrderFilters({ filters }: { filters: Filters }) {
  return <Form action={ADMIN_ORDERS_PATH} className="admin-toolbar admin-order-toolbar" key={adminOrdersHref({ ...filters, page: 1 })} aria-label="Buscar y filtrar pedidos">
    <label className="admin-search-field">
      <Search size={17} aria-hidden="true" />
      <span className="sr-only">Buscar por número, nombre o correo</span>
      <Input type="search" name="q" defaultValue={filters.query} maxLength={ADMIN_SEARCH_MAX_LENGTH} placeholder="Número, nombre o correo" />
    </label>
    <div className="admin-filters admin-order-filters">
      <SlidersHorizontal size={17} aria-hidden="true" />
      <label>
        <span className="sr-only">Filtrar por estado del pedido</span>
        <NativeSelect name="estado" defaultValue={filters.status ?? ""}>
          <option value="">Todos los estados</option>
          {ORDER_STATUSES.map((status) => <option key={status} value={status}>{orderStatusLabel(status)}</option>)}
        </NativeSelect>
      </label>
      <label className="admin-date-field">
        <span>Desde</span>
        <Input type="date" name="desde" defaultValue={filters.from ?? ""} min="2000-01-01" max="2100-12-31" />
      </label>
      <label className="admin-date-field">
        <span>Hasta</span>
        <Input type="date" name="hasta" defaultValue={filters.to ?? ""} min="2000-01-01" max="2100-12-31" />
      </label>
      <div className="admin-order-filter-actions">
        <Button type="submit" className="admin-primary-button">Filtrar</Button>
        {hasActiveFilters(filters) && <Button asChild variant="ghost"><Link href={ADMIN_ORDERS_PATH}>Limpiar</Link></Button>}
      </div>
    </div>
  </Form>;
}
