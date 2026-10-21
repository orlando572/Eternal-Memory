import { AdminProductEditor } from "@/features/admin-products/components/AdminProductEditor";
export default async function EditAdminProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ accion?: string }> }) {
  const [{ id }, { accion }] = await Promise.all([params, searchParams]);
  return <AdminProductEditor id={id} archive={accion === "archivar"} />;
}
