export type DailySummary = {
  total_sales: number;
  gross_profit: number;
  transaction_count: number;
  unpaid_debt: number;
  low_stock_count: number;
  expenses: number;
  net_profit: number;
};

export type TopProduct = {
  product_name: string;
  qty: number;
  total: number;
};

export type SoldProductItem = {
  id: string;
  sale_id: string;
  invoice_no: string;
  product_name: string;
  qty: number;
  unit: string;
  unit_price: number;
  total: number;
  sold_at: string;
};

export type SoldProductSummary = {
  product_name: string;
  qty: number;
  total: number;
};

export type SalesHistoryDay = {
  date: string;
  total_sales: number;
  gross_profit: number;
  expenses: number;
  net_profit: number;
  transaction_count: number;
  sold_products: SoldProductSummary[];
};
