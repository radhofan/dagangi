import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { first, run, transaction } from '@/db/database';
import { Product } from '@/types/product';
import { createId } from '@/utils/id';
import { nowIso } from '@/utils/date';

export type ImportRow = {
  name: string;
  barcode?: string;
  category?: string;
  unit?: string;
  cost_price: number;
  retail_price: number;
  wholesale_price?: number | null;
  wholesale_min_qty?: number | null;
  stock_qty: number;
  min_stock_qty: number;
  valid: boolean;
  error?: string;
};

const headers = ['name', 'barcode', 'category', 'unit', 'cost_price', 'retail_price', 'wholesale_price', 'wholesale_min_qty', 'stock_qty', 'min_stock_qty'];

export async function pickCsvRows() {
  const picked = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'text/comma-separated-values', '*/*'], copyToCacheDirectory: true });
  if (picked.canceled) return [];
  const raw = await FileSystem.readAsStringAsync(picked.assets[0].uri);
  return parseProductCsv(raw);
}

export function parseProductCsv(raw: string) {
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const firstLine = splitCsvLine(lines[0] ?? '');
  const hasHeader = firstLine.map((h) => h.trim()).join(',') === headers.join(',');
  const dataLines = hasHeader ? lines.slice(1) : lines;
  return dataLines.map<ImportRow>((line) => {
    const cols = splitCsvLine(line);
    const row = Object.fromEntries(headers.map((h, index) => [h, cols[index]?.trim() ?? '']));
    const item: ImportRow = {
      name: String(row.name || ''),
      barcode: String(row.barcode || ''),
      category: String(row.category || ''),
      unit: String(row.unit || 'pcs'),
      cost_price: Number(row.cost_price || 0),
      retail_price: Number(row.retail_price || 0),
      wholesale_price: row.wholesale_price ? Number(row.wholesale_price) : null,
      wholesale_min_qty: row.wholesale_min_qty ? Number(row.wholesale_min_qty) : null,
      stock_qty: Number(row.stock_qty || 0),
      min_stock_qty: Number(row.min_stock_qty || 0),
      valid: true,
    };
    if (!item.name) return { ...item, valid: false, error: 'Nama wajib diisi' };
    if (Number.isNaN(item.retail_price)) return { ...item, valid: false, error: 'Harga eceran tidak valid' };
    return item;
  });
}

export async function importProducts(rows: ImportRow[], skipInvalid = true) {
  const now = nowIso();
  const validRows = skipInvalid ? rows.filter((row) => row.valid) : rows;
  if (validRows.some((row) => !row.valid)) throw new Error('Masih ada baris tidak valid');
  await transaction(async () => {
    for (const row of validRows) {
      const existing = row.barcode ? await first<Product>('SELECT * FROM products WHERE barcode = ?', [row.barcode]) : null;
      if (existing) {
        await run(
          `UPDATE products SET name = ?, category = ?, unit = ?, cost_price = ?, retail_price = ?, wholesale_price = ?,
           wholesale_min_qty = ?, stock_qty = ?, min_stock_qty = ?, is_active = 1, updated_at = ? WHERE id = ?`,
          [row.name, row.category || null, row.unit || 'pcs', row.cost_price, row.retail_price, row.wholesale_price ?? null, row.wholesale_min_qty ?? null, row.stock_qty, row.min_stock_qty, now, existing.id],
        );
      } else {
        await run(
          `INSERT INTO products
          (id, name, barcode, category, unit, cost_price, retail_price, wholesale_price, wholesale_min_qty, stock_qty, min_stock_qty, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
          [createId('prd'), row.name, row.barcode || null, row.category || null, row.unit || 'pcs', row.cost_price, row.retail_price, row.wholesale_price ?? null, row.wholesale_min_qty ?? null, row.stock_qty, row.min_stock_qty, now, now],
        );
      }
    }
  });
  return validRows.length;
}

function splitCsvLine(line: string) {
  const out: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) {
      out.push(current);
      current = '';
    } else current += char;
  }
  out.push(current);
  return out;
}
