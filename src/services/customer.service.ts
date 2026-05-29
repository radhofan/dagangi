import { all, first, run } from '@/db/database';
import { Customer } from '@/types/debt';
import { createId } from '@/utils/id';
import { nowIso } from '@/utils/date';

export async function listCustomers(query = '') {
  const q = `%${query.trim()}%`;
  return all<Customer>(
    'SELECT * FROM customers WHERE ? = "" OR name LIKE ? OR phone LIKE ? ORDER BY name ASC',
    [query.trim(), q, q],
  );
}

export async function getCustomer(id: string) {
  return first<Customer>('SELECT * FROM customers WHERE id = ?', [id]);
}

export async function createCustomer(input: { name: string; phone?: string; address?: string; note?: string }) {
  if (!input.name.trim()) throw new Error('Nama pelanggan wajib diisi');
  const id = createId('cus');
  const now = nowIso();
  await run(
    'INSERT INTO customers (id, name, phone, address, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, input.name.trim(), input.phone?.trim() || null, input.address?.trim() || null, input.note?.trim() || null, now, now],
  );
  return getCustomer(id);
}

export async function updateCustomer(id: string, input: { name: string; phone?: string; address?: string; note?: string }) {
  if (!input.name.trim()) throw new Error('Nama pelanggan wajib diisi');
  const now = nowIso();
  await run(
    'UPDATE customers SET name = ?, phone = ?, address = ?, note = ?, updated_at = ? WHERE id = ?',
    [input.name.trim(), input.phone?.trim() || null, input.address?.trim() || null, input.note?.trim() || null, now, id],
  );
  return getCustomer(id);
}
