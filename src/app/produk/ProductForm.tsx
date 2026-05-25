import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/components/AppButton';
import { FormField } from '@/components/FormField';
import { Product } from '@/types/product';
import { createProduct, deactivateProduct, updateProduct } from '@/services/product.service';
import { confirmDialog } from '@/components/ConfirmDialog';
import { parseRupiahInput } from '@/utils/money';

type Props = { product?: Product };

export function ProductForm({ product }: Props) {
  const [name, setName] = useState(product?.name ?? '');
  const [barcode, setBarcode] = useState(product?.barcode ?? '');
  const [category, setCategory] = useState(product?.category ?? '');
  const [unit, setUnit] = useState(product?.unit ?? 'pcs');
  const [cost, setCost] = useState(String(product?.cost_price ?? 0));
  const [retail, setRetail] = useState(String(product?.retail_price ?? 0));
  const [wholesale, setWholesale] = useState(product?.wholesale_price ? String(product.wholesale_price) : '');
  const [wholesaleMin, setWholesaleMin] = useState(product?.wholesale_min_qty ? String(product.wholesale_min_qty) : '');
  const [stock, setStock] = useState(String(product?.stock_qty ?? 0));
  const [minStock, setMinStock] = useState(String(product?.min_stock_qty ?? 0));

  async function save() {
    try {
      const input = {
        name,
        barcode,
        category,
        unit,
        cost_price: parseRupiahInput(cost),
        retail_price: parseRupiahInput(retail),
        wholesale_price: wholesale ? parseRupiahInput(wholesale) : null,
        wholesale_min_qty: wholesaleMin ? Number(wholesaleMin) : null,
        stock_qty: Number(stock || 0),
        min_stock_qty: Number(minStock || 0),
      };
      if (product) await updateProduct(product.id, input);
      else await createProduct(input);
      router.replace('/produk');
    } catch (err) {
      Alert.alert('Gagal menyimpan', err instanceof Error ? err.message : 'Cek kembali data produk');
    }
  }

  return (
    <>
      <FormField label="Nama Produk" value={name} onChangeText={setName} />
      <FormField label="Barcode" value={barcode} onChangeText={setBarcode} />
      <FormField label="Kategori" value={category} onChangeText={setCategory} />
      <FormField label="Satuan" value={unit} onChangeText={setUnit} />
      <FormField label="Harga Modal" value={cost} onChangeText={setCost} keyboardType="numeric" />
      <FormField label="Harga Eceran" value={retail} onChangeText={setRetail} keyboardType="numeric" />
      <FormField label="Harga Grosir" value={wholesale} onChangeText={setWholesale} keyboardType="numeric" />
      <FormField label="Minimal Qty Grosir" value={wholesaleMin} onChangeText={setWholesaleMin} keyboardType="numeric" />
      <FormField label="Stok Saat Ini" value={stock} onChangeText={setStock} keyboardType="numeric" />
      <FormField label="Minimal Stok" value={minStock} onChangeText={setMinStock} keyboardType="numeric" />
      <AppButton title="Simpan" onPress={save} />
      {product?.is_active ? (
        <AppButton
          title="Nonaktifkan Produk"
          variant="danger"
          onPress={() => confirmDialog('Nonaktifkan produk?', 'Produk tidak muncul di pencarian kasir, tapi riwayat transaksi tetap aman.', async () => {
            await deactivateProduct(product.id);
            router.replace('/produk');
          })}
        />
      ) : null}
    </>
  );
}
