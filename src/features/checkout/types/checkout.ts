export type CheckoutCustomization = { mode: "urn_name"; text: string };

export type CheckoutOptions = {
  locations: { ubigeo: string; department: string; province: string; district: string; is_covered: boolean }[];
  products: { id: string; name: string; customization: { mode: "urn_name"; unitSurchargePen: number; maxCharacters: number } | null }[];
};

export type CheckoutLine = {
  key: string;
  productId: string;
  variantId: string;
  quantity: number;
  customization: CheckoutCustomization | null;
};

export type CheckoutInput = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  addressLine: string;
  addressDetail: string;
  ubigeo: string;
  lines: CheckoutLine[];
};

export type CheckoutQuoteLine = CheckoutLine & {
  productName: string;
  variantName: string;
  baseUnitPricePen: number;
  customizationUnitPen: number;
  unitPricePen: number;
  lineTotalPen: number;
};

export type CheckoutSummary = {
  lines: CheckoutQuoteLine[];
  location: { ubigeo: string; department: string; province: string; district: string };
  deliveryZone: "arequipa_province" | "rest_of_peru";
  baseSubtotalPen: number;
  customizationPen: number;
  subtotalPen: number;
  deliveryPen: number;
  totalPen: number;
};

export type CheckoutQuote = {
  quoteId: string;
  expiresAt: string;
  summary: CheckoutSummary;
};

export type CheckoutOrder = {
  id: string;
  status: string;
  paymentStatus: string;
  reservationExpiresAt: string;
  subtotalPen: number;
  deliveryPen: number;
  totalPen: number;
  lines: CheckoutQuoteLine[];
  location: CheckoutSummary["location"];
};
