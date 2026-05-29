import { all, first } from '@/db/database';
import { DailySummary, SalesHistoryDay, SoldProductItem, SoldProductSummary, TopProduct } from '@/types/report';
import { Sale } from '@/types/sale';
import { endOfMonth, localDayUtcRange, startOfMonth } from '@/utils/date';

export async function getDailySummary(date: string) {
  const range = localDayUtcRange(date);
  const sales = await first<{ total_sales: number; transaction_count: number }>(
    `SELECT COALESCE(SUM(grand_total), 0) as total_sales, COUNT(*) as transaction_count
     FROM sales
     WHERE sale_date = ? OR (created_at >= ? AND created_at < ?)`,
    [date, range.startIso, range.endIso],
  );
  const profit = await first<{ gross_profit: number }>(
    `SELECT COALESCE(SUM((unit_price - cost_price_snapshot) * qty), 0) as gross_profit
     FROM sale_items JOIN sales ON sales.id = sale_items.sale_id
     WHERE sales.sale_date = ? OR (sales.created_at >= ? AND sales.created_at < ?)`,
    [date, range.startIso, range.endIso],
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

export async function getSalesHistoryByMonth(year: number, month: number) {
  const startDate = startOfMonth(year, month);
  const endDate = endOfMonth(year, month);
  const saleRows = await all<{
    date: string;
    total_sales: number;
    transaction_count: number;
  }>(
    `SELECT sales.sale_date as date,
            COALESCE(SUM(sales.grand_total), 0) as total_sales,
            COUNT(*) as transaction_count
     FROM sales
     WHERE sales.sale_date >= ? AND sales.sale_date <= ?
     GROUP BY sales.sale_date
     ORDER BY sales.sale_date DESC`,
    [startDate, endDate],
  );
  const profitRows = await all<{ date: string; gross_profit: number }>(
    `SELECT sales.sale_date as date,
            COALESCE(SUM((sale_items.unit_price - sale_items.cost_price_snapshot) * sale_items.qty), 0) as gross_profit
     FROM sale_items
     JOIN sales ON sales.id = sale_items.sale_id
     WHERE sales.sale_date >= ? AND sales.sale_date <= ?
     GROUP BY sales.sale_date`,
    [startDate, endDate],
  );
  const expenseRows = await all<{ date: string; expenses: number }>(
    `SELECT expense_date as date, COALESCE(SUM(amount), 0) as expenses
     FROM expenses
     WHERE expense_date >= ? AND expense_date <= ?
     GROUP BY expense_date`,
    [startDate, endDate],
  );
  const soldRows = await all<SoldProductSummary & { date: string }>(
    `SELECT sales.sale_date as date,
            sale_items.product_name_snapshot as product_name,
            SUM(sale_items.qty) as qty,
            SUM(sale_items.subtotal) as total
     FROM sale_items
     JOIN sales ON sales.id = sale_items.sale_id
     WHERE sales.sale_date >= ? AND sales.sale_date <= ?
     GROUP BY sales.sale_date, sale_items.product_name_snapshot
     ORDER BY sales.sale_date DESC, qty DESC`,
    [startDate, endDate],
  );

  const byDate = new Map<string, SalesHistoryDay>();
  for (const row of saleRows) {
    byDate.set(row.date, {
      date: row.date,
      total_sales: row.total_sales,
      gross_profit: 0,
      expenses: 0,
      net_profit: 0,
      transaction_count: row.transaction_count,
      sold_products: [],
    });
  }
  for (const row of profitRows) {
    const current = byDate.get(row.date) ?? {
      date: row.date,
      total_sales: 0,
      gross_profit: 0,
      expenses: 0,
      net_profit: 0,
      transaction_count: 0,
      sold_products: [],
    };
    current.gross_profit = row.gross_profit;
    current.net_profit = row.gross_profit - current.expenses;
    byDate.set(row.date, current);
  }
  for (const row of expenseRows) {
    const current = byDate.get(row.date) ?? {
      date: row.date,
      total_sales: 0,
      gross_profit: 0,
      expenses: 0,
      net_profit: 0,
      transaction_count: 0,
      sold_products: [],
    };
    current.expenses = row.expenses;
    current.net_profit = current.gross_profit - row.expenses;
    byDate.set(row.date, current);
  }
  for (const row of soldRows) {
    const current = byDate.get(row.date);
    if (!current) continue;
    current.sold_products.push({
      product_name: row.product_name,
      qty: row.qty,
      total: row.total,
    });
  }

  return Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getSalesByDateRange(startDate: string, endDate: string) {
  const salesSummary = await first<{ total_sales: number; transactions: number }>(
    `SELECT COALESCE(SUM(grand_total), 0) as total_sales,
            COUNT(*) as transactions
     FROM sales
     WHERE sales.sale_date >= ? AND sales.sale_date <= ?`,
    [startDate, endDate],
  );
  const itemSummary = await first<{ total_cost: number; gross_profit: number }>(
    `SELECT COALESCE(SUM(sale_items.cost_price_snapshot * sale_items.qty), 0) as total_cost,
            COALESCE(SUM((sale_items.unit_price - sale_items.cost_price_snapshot) * sale_items.qty), 0) as gross_profit
     FROM sale_items
     JOIN sales ON sales.id = sale_items.sale_id
     WHERE sales.sale_date >= ? AND sales.sale_date <= ?`,
    [startDate, endDate],
  );
  const expenses = await getExpenseSummary(startDate, endDate);
  const rows = await all<Sale>('SELECT * FROM sales WHERE sale_date >= ? AND sale_date <= ? ORDER BY created_at DESC', [startDate, endDate]);
  const grossProfit = itemSummary?.gross_profit ?? 0;
  return {
    total_sales: salesSummary?.total_sales ?? 0,
    transactions: salesSummary?.transactions ?? 0,
    total_cost: itemSummary?.total_cost ?? 0,
    gross_profit: grossProfit,
    total_expenses: expenses.total,
    net_profit: grossProfit - expenses.total,
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

export async function getSoldProductItemsByDate(date: string) {
  return all<SoldProductItem>(
    `SELECT sale_items.id,
            sale_items.sale_id,
            sales.invoice_no,
            sale_items.product_name_snapshot as product_name,
            sale_items.qty,
            sale_items.unit,
            sale_items.unit_price,
            sale_items.subtotal as total,
            sales.created_at as sold_at
     FROM sale_items
     JOIN sales ON sales.id = sale_items.sale_id
     WHERE sales.sale_date = ?
     ORDER BY sales.created_at DESC, sale_items.created_at DESC`,
    [date],
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
