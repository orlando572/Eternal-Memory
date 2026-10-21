"use client";

import { CatalogError } from "@/features/catalogo/components/CatalogError";

export default function Error({ retry }: { retry: () => void }) {
  return <CatalogError retry={retry} />;
}
