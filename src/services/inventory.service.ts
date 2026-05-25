import { all, first, run, transaction } from '@/db/database';
import { Product, StockMovement } from '@/types/product';
import { nowIso } from '@/utils/date';
import { createId } from '@/utils/id';

export async function restockProduct(productId: string, qty: number, note?: string) {
  if (qty <= 0) throw new Error('Jumlah restock harus lebih dari 0');
  await transaction(async () => {
    const product = await first<Product>('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) throw new Error('Produk tidak ditemukan');
    const after = product.stock_qty + qty;
    await run('UPDATE products SET stock_qty = ?, updated_at = ? WHERE id = ?', [after, nowIso(), productId]);
    await run(
      'INSERT INTO stock_movements (id, product_id, type, qty, before_qty, after_qty, reference_type, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [createId('mov'), productId, 'RESTOCK', qty, product.stock_qty, after, 'RESTOCK', note || null, nowIso()],
    );
  });
}

export async function adjustStock(productId: string, newQty: number, note?: string) {
  await transaction(async () => {
    const product = await first<Product>('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) throw new Error('Produk tidak ditemukan');
    const diff = newQty - product.stock_qty;
    await run('UPDATE products SET stock_qty = ?, updated_at = ? WHERE id = ?', [newQty, nowIso(), productId]);
    await run(
      'INSERT INTO stock_movements (id, product_id, type, qty, before_qty, after_qty, reference_type, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [createId('mov'), productId, 'MANUAL_ADJUSTMENT', diff, product.stock_qty, newQty, 'ADJUSTMENT', note || null, nowIso()],
    );
  });
}

export async function getLowStockProducts() {
  return all<Product>('SELECT * FROM products WHERE is_active = 1 AND stock_qty <= min_stock_qty ORDER BY stock_qty ASC, name ASC');
}

export async function getStockMovements(productId: string) {
  return all<StockMovement>('SELECT * FROM stock_movements WHERE product_id = ? ORDER BY created_at DESC', [productId]);
}
