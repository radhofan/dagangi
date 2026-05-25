import { first } from '@/db/database';

export async function nextInvoiceNo(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const prefix = `DG-${y}${m}${d}`;
  const row = await first<{ count: number }>(
    'SELECT COUNT(*) as count FROM sales WHERE invoice_no LIKE ?',
    [`${prefix}-%`],
  );
  return `${prefix}-${String((row?.count ?? 0) + 1).padStart(4, '0')}`;
}
