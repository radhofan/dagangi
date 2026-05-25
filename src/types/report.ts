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
