export const tableNames = [
  'products',
  'customers',
  'sales',
  'sale_items',
  'debts',
  'debt_payments',
  'expenses',
  'stock_movements',
  'app_settings',
] as const;

export type TableName = typeof tableNames[number];
