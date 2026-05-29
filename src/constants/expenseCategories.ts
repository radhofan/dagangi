export const EXPENSE_CATEGORIES = [
  'Restock',
  'Pegawai',
  'Perawatan Toko',
  'Alat-alat',
  'Lain-lain',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export function normalizeExpenseCategory(category?: string | null): ExpenseCategory {
  return EXPENSE_CATEGORIES.includes(category as ExpenseCategory) ? (category as ExpenseCategory) : 'Lain-lain';
}
