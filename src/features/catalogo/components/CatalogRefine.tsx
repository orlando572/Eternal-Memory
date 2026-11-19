"use client";

import { useState, type FormEvent } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { LoadingButton } from "@/features/loading/LoadingButton";
import { CATALOG_SORT_OPTIONS, isCatalogSort, parseCatalogPrice } from "@/features/catalogo/lib/catalogParams";
import type { CatalogFilters, CatalogSort } from "@/features/catalogo/types/catalog";

type CatalogRefineProps = {
  filters: CatalogFilters;
  pending: boolean;
  busyTarget: string;
  onSortChange: (sort: CatalogSort) => void;
  onPriceApply: (range: Pick<CatalogFilters, "minPrice" | "maxPrice">) => void;
};

const PRICE_HINT = "Importes en soles, sin signos (por ejemplo 150 o 150.50). Deja un campo vacío para no limitarlo.";

export function CatalogRefine({ filters, pending, busyTarget, onSortChange, onPriceApply }: CatalogRefineProps) {
  const [min, setMin] = useState(filters.minPrice === null ? "" : String(filters.minPrice));
  const [max, setMax] = useState(filters.maxPrice === null ? "" : String(filters.maxPrice));
  const [error, setError] = useState("");

  function applyPrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const minPrice = min.trim() ? parseCatalogPrice(min) : null;
    const maxPrice = max.trim() ? parseCatalogPrice(max) : null;
    if ((min.trim() && minPrice === null) || (max.trim() && maxPrice === null)) {
      setError("Revisa los importes: usa solo números positivos con hasta dos decimales.");
      return;
    }
    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      setError("El precio mínimo no puede ser mayor que el máximo.");
      return;
    }
    setError("");
    onPriceApply({ minPrice, maxPrice });
  }

  const describedBy = error ? "catalog-price-hint catalog-price-error" : "catalog-price-hint";

  return (
    <div className="catalog-refine">
      <form className="catalog-price" onSubmit={applyPrice} noValidate>
        <fieldset>
          <legend className="catalog-refine-title">Rango de precio</legend>
          <div className="catalog-price-fields">
            <div>
              <label htmlFor="catalog-price-min">Mínimo (S/)</label>
              <Input id="catalog-price-min" inputMode="decimal" autoComplete="off" value={min} maxLength={10} placeholder="0"
                aria-invalid={Boolean(error)} aria-describedby={describedBy} onChange={(event) => setMin(event.target.value)} />
            </div>
            <div>
              <label htmlFor="catalog-price-max">Máximo (S/)</label>
              <Input id="catalog-price-max" inputMode="decimal" autoComplete="off" value={max} maxLength={10} placeholder="Sin límite"
                aria-invalid={Boolean(error)} aria-describedby={describedBy} onChange={(event) => setMax(event.target.value)} />
            </div>
            <LoadingButton type="submit" variant="outline" busy={pending && busyTarget === "price"} disabled={pending}>
              <SlidersHorizontal size={16} aria-hidden="true" /> Aplicar
            </LoadingButton>
          </div>
          <p id="catalog-price-hint" className="catalog-price-hint">{PRICE_HINT}</p>
          {error && <p id="catalog-price-error" className="catalog-price-error" role="alert">{error}</p>}
        </fieldset>
      </form>
      <div className="catalog-sort">
        <label htmlFor="catalog-sort">Ordenar por</label>
        <NativeSelect id="catalog-sort" value={filters.sort} disabled={pending}
          onChange={(event) => { if (isCatalogSort(event.target.value)) onSortChange(event.target.value); }}>
          {CATALOG_SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </NativeSelect>
      </div>
    </div>
  );
}
