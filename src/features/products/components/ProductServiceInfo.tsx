import { PenLine, Truck } from "lucide-react";
import { formatCatalogPrice } from "@/features/catalogo/lib/catalogPresentation";
import { engravingSummary, shippingSummary, type EngravingOption, type ShippingRate } from "@/features/products/lib/productDetail";

type ProductServiceInfoProps = {
  shippingRates: ShippingRate[];
  engraving: EngravingOption | null | undefined;
};

export function ProductServiceInfo({ shippingRates, engraving }: ProductServiceInfoProps) {
  const engravingText = engravingSummary(engraving, formatCatalogPrice);
  return (
    <section className="detail-service" aria-label="Envío y grabado">
      <dl>
        <div>
          <dt><Truck size={17} aria-hidden="true" />Envío</dt>
          <dd>{shippingSummary(shippingRates, formatCatalogPrice)}</dd>
        </div>
        {engravingText && (
          <div>
            <dt><PenLine size={17} aria-hidden="true" />Grabado</dt>
            <dd>{engravingText}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
