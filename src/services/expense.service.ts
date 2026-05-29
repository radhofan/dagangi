import { all, first, run } from '@/db/database';
import { EXPENSE_CATEGORIES } from '@/constants/expenseCategories';
import { Expense } from '@/types/expense';
import { nowIso, todayKey } from '@/utils/date';
import { createId } from '@/utils/id';
import { expenseSchema } from '@/utils/validation';

export const defaultExpenseCategories = EXPENSE_CATEGORIES;

export async function listExpenses(start?: string, end?: string) {
  return all<Expense>(
    `SELECT * FROM expenses
     WHERE (? IS NULL OR expense_date >= ?) AND (? IS NULL OR expense_date <= ?)
     ORDER BY expense_date DESC, created_at DESC`,
    [start ?? null, start ?? null, end ?? null, end ?? null],
  );
}

export async function getExpense(id: string) {
  return first<Expense>('SELECT * FROM expenses WHERE id = ?', [id]);
}

export async function upsertExpense(input: Partial<Expense> & { category: string; amount: number }) {
  const payload = {
    expense_date: input.expense_date || todayKey(),
    category: input.category,
    amount: input.amount,
    note: input.note || '',
  };
  expenseSchema.parse(payload);
  const now = nowIso();
  if (input.id) {
    await run(
      'UPDATE expenses SET expense_date = ?, category = ?, amount = ?, note = ?, updated_at = ? WHERE id = ?',
      [payload.expense_date, payload.category, payload.amount, payload.note || null, now, input.id],
    );
    return getExpense(input.id);
  }
  const id = createId('exp');
  await run(
    'INSERT INTO expenses (id, expense_date, category, amount, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, payload.expense_date, payload.category, payload.amount, payload.note || null, now, now],
  );
  return getExpense(id);
}

export async function deleteExpense(id: string) {
  await run('DELETE FROM expenses WHERE id = ?', [id]);
}
