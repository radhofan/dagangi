import { all, first } from '@/db/database';
import { DailySummary, TopProduct } from '@/types/report';
import { Sale } from '@/types/sale';
import { endOfMonth, startOfMonth } from '@/utils/date';

export async function getDailySummary(date: string) {
  const sales = await first<{ total_sales: number; transaction_count: number }>(
    'SELECT COALESCE(SUM(grand_total), 0) as total_sales, COUNT(*) as transaction_count FROM sales WHERE sale_date = ?',
    [date],
  );
  const profit = await first<{ gross_profit: number }>(
    `SELECT COALESCE(SUM((unit_price - cost_price_snapshot) * qty), 0) as gross_profit
     FROM sale_items JOIN sales ON sales.id = sale_items.sale_id WHERE sales.sale_date = ?`,
    [date],
  );
  const expenses = await first<{ total: number }>('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE expense_date = ?', [date]);
  const debt = await getDebtSummary();
  const lowStock = await first<{ count: number }>('SELECT COUNT(*) as count FROM products WHERE is_active = 1 AND stock_qty <= min_stock_qty');
  return {
    total_sales: sales?.total_sales ?? 0,
    gross_profit: profit?.gross_profit ?? 0,
    transaction_count: sales?.transaction_count ?? 0,
    unpaid_debt: debt.remaining,
    low_stock_count: lowStock?.count ?? 0,
    expenses: expenses?.total ?? 0,
    net_profit: (profit?.gross_profit ?? 0) - (expenses?.total ?? 0),
  } satisfies DailySummary;
}

export async function getMonthlySummary(year: number, month: number) {
  return getSalesByDateRange(startOfMonth(year, month), endOfMonth(year, month));
}

export async function getSalesByDateRange(startDate: string, endDate: string) {
  const summary = await first<{ total_sales: number; total_cost: number; gross_profit: number; transactions: number }>(
    `SELECT COALESCE(SUM(sales.grand_total), 0) as total_sales,
            COALESCE(SUM(sale_items.cost_price_snapshot * sale_items.qty), 0) as total_cost,
            COALESCE(SUM((sale_items.unit_price - sale_items.cost_price_snapshot) * sale_items.qty), 0) as gross_profit,
            COUNT(DISTINCT sales.id) as transactions
     FROM sales LEFT JOIN sale_items ON sale_items.sale_id = sales.id
     WHERE sales.sale_date >= ? AND sales.sale_date <= ?`,
    [startDate, endDate],
  );
  const expenses = await getExpenseSummary(startDate, endDate);
  const rows = await all<Sale>('SELECT * FROM sales WHERE sale_date >= ? AND sale_date <= ? ORDER BY created_at DESC', [startDate, endDate]);
  return {
    ...summary,
    total_expenses: expenses.total,
    net_profit: (summary?.gross_profit ?? 0) - expenses.total,
    rows,
  };
}

export async function getTopSellingProducts(startDate: string, endDate: string) {
  return all<TopProduct>(
    `SELECT product_name_snapshot as product_name, SUM(qty) as qty, SUM(subtotal) as total
     FROM sale_items JOIN sales ON sales.id = sale_items.sale_id
     WHERE sales.sale_date >= ? AND sales.sale_date <= ?
     GROUP BY product_name_snapshot
     ORDER BY qty DESC LIMIT 10`,
    [startDate, endDate],
  );
}

export async function getExpenseSummary(startDate: string, endDate: string) {
  const row = await first<{ total: number }>(
    'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE expense_date >= ? AND expense_date <= ?',
    [startDate, endDate],
  );
  return { total: row?.total ?? 0 };
}

export async function getDebtSummary() {
  const row = await first<{ total: number; paid: number; remaining: number; count: number }>(
    `SELECT COALESCE(SUM(amount_total), 0) as total,
            COALESCE(SUM(amount_paid), 0) as paid,
            COALESCE(SUM(amount_total - amount_paid), 0) as remaining,
            COUNT(*) as count
     FROM debts WHERE status != 'PAID'`,
  );
  return row ?? { total: 0, paid: 0, remaining: 0, count: 0 };
}
