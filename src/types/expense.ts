export type Expense = {
  id: string;
  expense_date: string;
  category: string;
  amount: number;
  note?: string | null;
  created_at: string;
  updated_at: string;
};
