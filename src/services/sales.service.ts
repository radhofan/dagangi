import { all, first, run, transaction } from '@/db/database';
import { allowNegativeStock } from '@/services/settings.service';
import { CartItem, PaymentMethod, PaymentStatus, Sale, SaleWithItems } from '@/types/sale';
import { Product } from '@/types/product';
import { nowIso, todayKey } from '@/utils/date';
import { createId } from '@/utils/id';
import { nextInvoiceNo } from '@/utils/invoice';

export type CreateSaleInput = {
  items: CartItem[];
  discount_total?: number;
  payment_method: PaymentMethod;
  paid_amount: number;
  customer_id?: string | null;
  note?: string;
};

export async function createSale(input: CreateSaleInput) {
  if (!input.items.length) throw new Error('Keranjang masih kosong');
  if (input.paid_amount < 0) throw new Error('Jumlah bayar tidak boleh negatif');
  const subtotal = input.items.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = Math.min(input.discount_total ?? 0, subtotal);
  const grandTotal = subtotal - discount;
  const debtAmount = Math.max(0, grandTotal - input.paid_amount);
  const status: PaymentStatus = debtAmount <= 0 ? 'PAID' : input.paid_amount > 0 ? 'PARTIAL' : 'UNPAID';
  if ((input.payment_method === 'DEBT' || status !== 'PAID') && !input.customer_id) {
    throw new Error('Pelanggan wajib dipilih untuk transaksi hutang');
  }
  if (status === 'PAID' && input.paid_amount < grandTotal) {
    throw new Error('Jumlah bayar kurang dari total');
  }

  const saleId = createId('sale');
  const debtId = status === 'PAID' ? null : createId('debt');
  const invoice = await nextInvoiceNo();
  const now = nowIso();
  const negativeAllowed = await allowNegativeStock();

  await transaction(async () => {
    for (const item of input.items) {
      const product = await first<Product>('SELECT * FROM products WHERE id = ?', [item.product_id]);
      if (!product) throw new Error(`Produk ${item.product_name} tidak ditemukan`);
      if (!negativeAllowed && product.stock_qty < item.qty) {
        throw new Error(`Stok ${product.name} tidak cukup`);
      }
    }

    await run(
      `INSERT INTO sales
      (id, invoice_no, sale_date, subtotal, discount_total, grand_total, paid_amount, change_amount, payment_method, payment_status, customer_id, debt_id, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        saleId,
        invoice,
        todayKey(),
        subtotal,
        discount,
        grandTotal,
        input.paid_amount,
        Math.max(0, input.paid_amount - grandTotal),
        input.payment_method,
        status,
        input.customer_id || null,
        debtId,
        input.note || null,
        now,
      ],
    );

    for (const item of input.items) {
      await run(
        `INSERT INTO sale_items
        (id, sale_id, product_id, product_name_snapshot, qty, unit, unit_price, cost_price_snapshot, subtotal, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          createId('item'),
          saleId,
          item.product_id,
          item.product_name,
          item.qty,
          item.unit,
          item.unit_price,
          item.cost_price_snapshot,
          item.subtotal,
          now,
        ],
      );
      const product = await first<Product>('SELECT * FROM products WHERE id = ?', [item.product_id]);
      const before = product?.stock_qty ?? 0;
      const after = before - item.qty;
      await run('UPDATE products SET stock_qty = ?, updated_at = ? WHERE id = ?', [after, now, item.product_id]);
      await run(
        'INSERT INTO stock_movements (id, product_id, type, qty, before_qty, after_qty, reference_type, reference_id, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [createId('mov'), item.product_id, 'SALE', -item.qty, before, after, 'SALE', saleId, invoice, now],
      );
    }

    if (debtId && input.customer_id) {
      await run(
        'INSERT INTO debts (id, customer_id, sale_id, amount_total, amount_paid, status, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [debtId, input.customer_id, saleId, grandTotal, input.paid_amount, status, input.note || null, now, now],
      );
    }
  });

  const sale = await getSaleById(saleId);
  if (!sale) throw new Error('Transaksi gagal disimpan');
  return sale;
}

export async function getSaleById(id: string) {
  const sale = await first<Sale>('SELECT * FROM sales WHERE id = ?', [id]);
  if (!sale) return null;
  const items = await all<SaleWithItems['items'][number]>('SELECT * FROM sale_items WHERE sale_id = ? ORDER BY created_at ASC', [id]);
  return { ...sale, items };
}

export async function listSalesByDateRange(startDate: string, endDate: string) {
  return all<Sale>('SELECT * FROM sales WHERE sale_date >= ? AND sale_date <= ? ORDER BY created_at DESC', [startDate, endDate]);
}
