import { all, first, run, transaction } from '@/db/database';
import { Debt, DebtPayment } from '@/types/debt';
import { createId } from '@/utils/id';
import { nowIso, todayKey } from '@/utils/date';

export async function listDebts(status: 'OPEN' | 'ALL' = 'OPEN') {
  return all<Debt>(
    `SELECT debts.*, customers.name as customer_name
     FROM debts JOIN customers ON customers.id = debts.customer_id
     WHERE (? = 'ALL' OR debts.status != 'PAID')
     ORDER BY debts.updated_at DESC`,
    [status],
  );
}

export async function getDebt(id: string) {
  return first<Debt>(
    `SELECT debts.*, customers.name as customer_name
     FROM debts JOIN customers ON customers.id = debts.customer_id
     WHERE debts.id = ?`,
    [id],
  );
}

export async function getDebtPayments(debtId: string) {
  return all<DebtPayment>('SELECT * FROM debt_payments WHERE debt_id = ? ORDER BY payment_date DESC, created_at DESC', [debtId]);
}

export async function recordDebtPayment(debtId: string, amount: number, note?: string) {
  if (amount <= 0) throw new Error('Jumlah bayar harus lebih dari 0');
  await transaction(async () => {
    const debt = await first<Debt>('SELECT * FROM debts WHERE id = ?', [debtId]);
    if (!debt) throw new Error('Hutang tidak ditemukan');
    const remaining = debt.amount_total - debt.amount_paid;
    if (amount > remaining) throw new Error('Pembayaran melebihi sisa hutang');
    const paid = debt.amount_paid + amount;
    const status = paid >= debt.amount_total ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID';
    await run(
      'INSERT INTO debt_payments (id, debt_id, payment_date, amount, note, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [createId('pay'), debtId, todayKey(), amount, note || null, nowIso()],
    );
    await run('UPDATE debts SET amount_paid = ?, status = ?, updated_at = ? WHERE id = ?', [paid, status, nowIso(), debtId]);
  });
}

export async function createManualDebt(input: { customer_id: string; amount_total: number; note?: string; due_date?: string | null }) {
  if (input.amount_total <= 0) throw new Error('Jumlah hutang harus lebih dari 0');
  const id = createId('debt');
  const now = nowIso();
  await run(
    'INSERT INTO debts (id, customer_id, amount_total, amount_paid, status, due_date, note, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?)',
    [id, input.customer_id, input.amount_total, 'UNPAID', input.due_date || null, input.note || null, now, now],
  );
  return getDebt(id);
}
