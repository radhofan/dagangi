export type Product = {
  id: string;
  name: string;
  barcode?: string | null;
  category?: string | null;
  unit: string;
  cost_price: number;
  retail_price: number;
  wholesale_price?: number | null;
  wholesale_min_qty?: number | null;
  stock_qty: number;
  min_stock_qty: number;
  is_active: number;
  created_at: string;
  updated_at: string;
};

export type StockMovement = {
  id: string;
  product_id: string;
  type: 'SALE' | 'RESTOCK' | 'MANUAL_ADJUSTMENT' | 'RETURN';
  qty: number;
  before_qty: number;
  after_qty: number;
  reference_type?: string | null;
  reference_id?: string | null;
  note?: string | null;
  created_at: string;
};
