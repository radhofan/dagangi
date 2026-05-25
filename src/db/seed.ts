import { run, transaction } from '@/db/database';
import { createId } from '@/utils/id';
import { nowIso, todayKey } from '@/utils/date';
import { nextInvoiceNo } from '@/utils/invoice';

export async function seedSampleData() {
  const now = nowIso();
  await transaction(async () => {
    const products = [
      ['Beras Ramos 5kg', '899100001', 'Sembako', 'karung', 62000, 72000, 69000, 5, 20, 4],
      ['Minyak Goreng 1L', '899100002', 'Sembako', 'botol', 14500, 17000, 16000, 12, 36, 8],
      ['Gula Pasir 1kg', '899100003', 'Sembako', 'pack', 13500, 16000, 15000, 10, 28, 6],
      ['Pulpen Biru', '899100004', 'ATK', 'pcs', 1800, 3000, 2500, 12, 100, 20],
      ['Kantong Plastik Sedang', '899100005', 'Plastik', 'pack', 7000, 10000, 9000, 10, 5, 10],
    ];

    const productIds: string[] = [];
    for (const p of products) {
      const id = createId('prd');
      productIds.push(id);
      await run(
        `INSERT OR REPLACE INTO products
        (id, name, barcode, category, unit, cost_price, retail_price, wholesale_price, wholesale_min_qty, stock_qty, min_stock_qty, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [id, ...p, now, now],
      );
    }

    const customerId = createId('cus');
    await run(
      'INSERT OR REPLACE INTO customers (id, name, phone, address, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customerId, 'Bu Sari', '08123456789', 'Dekat pasar', 'Pelanggan grosir', now, now],
    );

    const saleId = createId('sale');
    const invoice = await nextInvoiceNo();
    await run(
      `INSERT INTO sales (id, invoice_no, sale_date, subtotal, discount_total, grand_total, paid_amount, change_amount, payment_method, payment_status, customer_id, created_at)
       VALUES (?, ?, ?, ?, 0, ?, ?, ?, 'CASH', 'PAID', ?, ?)`,
      [saleId, invoice, todayKey(), 89000, 89000, 100000, 11000, customerId, now],
    );
    await run(
      `INSERT INTO sale_items (id, sale_id, product_id, product_name_snapshot, qty, unit, unit_price, cost_price_snapshot, subtotal, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [createId('item'), saleId, productIds[1], 'Minyak Goreng 1L', 2, 'botol', 17000, 14500, 34000, now],
    );
    await run(
      `INSERT INTO sale_items (id, sale_id, product_id, product_name_snapshot, qty, unit, unit_price, cost_price_snapshot, subtotal, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [createId('item'), saleId, productIds[0], 'Beras Ramos 5kg', 1, 'karung', 72000, 62000, 72000, now],
    );

    const debtId = createId('debt');
    await run(
      'INSERT INTO debts (id, customer_id, amount_total, amount_paid, status, due_date, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [debtId, customerId, 125000, 50000, 'PARTIAL', null, 'Contoh hutang pelanggan', now, now],
    );
    await run(
      'INSERT INTO debt_payments (id, debt_id, payment_date, amount, note, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [createId('pay'), debtId, todayKey(), 50000, 'Bayar sebagian', now],
    );
    await run(
      'INSERT INTO expenses (id, expense_date, category, amount, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [createId('exp'), todayKey(), 'Transport', 15000, 'Ongkos ambil barang', now, now],
    );

    for (const id of productIds) {
      await run(
        'INSERT INTO stock_movements (id, product_id, type, qty, before_qty, after_qty, reference_type, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [createId('mov'), id, 'RESTOCK', 10, 0, 10, 'SEED', 'Data contoh', now],
      );
    }
  });
}
