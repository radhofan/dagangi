import { all, first, run } from '@/db/database';
import { Product } from '@/types/product';
import { nowIso } from '@/utils/date';
import { createId } from '@/utils/id';
import { productSchema } from '@/utils/validation';

export type ProductInput = {
  name: string;
  barcode?: string | null;
  category?: string | null;
  unit: string;
  cost_price: number;
  retail_price: number;
  wholesale_price?: number | null;
  wholesale_min_qty?: number | null;
  stock_qty: number;
  min_stock_qty: number;
};

export async function listProducts(query = '', onlyActive = false) {
  const q = `%${query.trim()}%`;
  return all<Product>(
    `SELECT * FROM products
     WHERE (? = '' OR name LIKE ? OR barcode LIKE ? OR category LIKE ?)
       AND (? = 0 OR is_active = 1)
     ORDER BY is_active DESC, name ASC`,
    [query.trim(), q, q, q, onlyActive ? 1 : 0],
  );
}

export async function getProduct(id: string) {
  return first<Product>('SELECT * FROM products WHERE id = ?', [id]);
}

export async function createProduct(input: ProductInput) {
  productSchema.parse(input);
  const now = nowIso();
  const id = createId('prd');
  await run(
    `INSERT INTO products
    (id, name, barcode, category, unit, cost_price, retail_price, wholesale_price, wholesale_min_qty, stock_qty, min_stock_qty, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    [
      id,
      input.name,
      input.barcode || null,
      input.category || null,
      input.unit || 'pcs',
      input.cost_price,
      input.retail_price,
      input.wholesale_price || null,
      input.wholesale_min_qty || null,
      input.stock_qty,
      input.min_stock_qty,
      now,
      now,
    ],
  );
  return getProduct(id);
}

export async function updateProduct(id: string, input: ProductInput) {
  productSchema.parse(input);
  await run(
    `UPDATE products SET
      name = ?, barcode = ?, category = ?, unit = ?, cost_price = ?, retail_price = ?,
      wholesale_price = ?, wholesale_min_qty = ?, stock_qty = ?, min_stock_qty = ?, updated_at = ?
     WHERE id = ?`,
    [
      input.name,
      input.barcode || null,
      input.category || null,
      input.unit || 'pcs',
      input.cost_price,
      input.retail_price,
      input.wholesale_price || null,
      input.wholesale_min_qty || null,
      input.stock_qty,
      input.min_stock_qty,
      nowIso(),
      id,
    ],
  );
  return getProduct(id);
}

export async function deactivateProduct(id: string) {
  await run('UPDATE products SET is_active = 0, updated_at = ? WHERE id = ?', [nowIso(), id]);
}

export function priceForQty(product: Product, qty: number) {
  if (product.wholesale_price && product.wholesale_min_qty && qty >= product.wholesale_min_qty) {
    return { unit_price: product.wholesale_price, price_type: 'WHOLESALE' as const };
  }
  return { unit_price: product.retail_price, price_type: 'RETAIL' as const };
}
