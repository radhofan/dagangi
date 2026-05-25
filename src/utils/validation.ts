import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  barcode: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1).default('pcs'),
  cost_price: z.number().min(0),
  retail_price: z.number().min(0),
  wholesale_price: z.number().nullable().optional(),
  wholesale_min_qty: z.number().nullable().optional(),
  stock_qty: z.number(),
  min_stock_qty: z.number().min(0),
}).refine((value) => !value.wholesale_price || (value.wholesale_min_qty ?? 0) > 1, {
  message: 'Minimal grosir harus lebih dari 1 jika harga grosir diisi',
  path: ['wholesale_min_qty'],
});

export const expenseSchema = z.object({
  expense_date: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().positive(),
  note: z.string().optional(),
});
