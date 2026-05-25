export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER' | 'DEBT';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID';

export type Sale = {
  id: string;
  invoice_no: string;
  sale_date: string;
  subtotal: number;
  discount_total: number;
  grand_total: number;
  paid_amount: number;
  change_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  customer_id?: string | null;
  debt_id?: string | null;
  note?: string | null;
  created_at: string;
};

export type SaleItem = {
  id: string;
  sale_id: string;
  product_id?: string | null;
  product_name_snapshot: string;
  qty: number;
  unit: string;
  unit_price: number;
  cost_price_snapshot: number;
  subtotal: number;
  created_at: string;
};

export type SaleWithItems = Sale & {
  items: SaleItem[];
};

export type CartItem = {
  product_id: string;
  product_name: string;
  qty: number;
  unit: string;
  unit_price: number;
  cost_price_snapshot: number;
  stock_qty: number;
  retail_price: number;
  wholesale_price?: number | null;
  wholesale_min_qty?: number | null;
  subtotal: number;
  price_type: 'RETAIL' | 'WHOLESALE' | 'MANUAL';
};
