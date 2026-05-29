export const PRODUCT_CATEGORIES = [
  'Sembako',
  'Makanan Instan',
  'Snack & Camilan',
  'Minuman',
  'Rokok',
  'Bumbu & Masak',
  'Frozen / Dingin',
  'Perawatan Diri',
  'Rumah Tangga',
  'Obat Ringan',
  'Bayi & Anak',
  'Alat Tulis',
  'Pulsa & Digital',
  'Lain-lain',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function normalizeProductCategory(category?: string | null): ProductCategory {
  return PRODUCT_CATEGORIES.includes(category as ProductCategory) ? (category as ProductCategory) : 'Lain-lain';
}
