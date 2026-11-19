export type AccountOrderSummary = {
  id: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  totalPen: number;
  itemCount: number;
};

export type AccountOrderList = {
  orders: AccountOrderSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AccountOrderLine = {
  key: string | null;
  productName: string;
  variantName: string;
  quantity: number;
  customization: { mode: "urn_name"; text: string } | null;
  baseUnitPricePen: number;
  customizationUnitPen: number;
  unitPricePen: number;
  lineTotalPen: number;
};

export type AccountOrderHistoryEntry = {
  fromStatus: string | null;
  toStatus: string;
  createdAt: string;
};

export type AccountOrderDetail = {
  id: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  reservationExpiresAt: string;
  contact: { name: string; email: string; phone: string };
  address: { line: string; detail: string | null; ubigeo: string | null; department: string; province: string; district: string };
  subtotalPen: number;
  deliveryPen: number;
  totalPen: number;
  lines: AccountOrderLine[];
  history: AccountOrderHistoryEntry[];
};
