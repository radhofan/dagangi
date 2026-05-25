import { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { FormField } from '@/components/FormField';
import { Screen } from '@/components/Screen';
import { adjustStock, restockProduct } from '@/services/inventory.service';
import { listProducts } from '@/services/product.service';
import { Product } from '@/types/product';

export default function RestockScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => { listProducts('', true).then((rows) => { setProducts(rows); setProductId(rows[0]?.id ?? ''); }); }, []);

  async function save(mode: 'RESTOCK' | 'ADJUST') {
    try {
      if (mode === 'RESTOCK') await restockProduct(productId, Number(qty), note);
      else await adjustStock(productId, Number(qty), note);
      router.replace('/stok');
    } catch (err) {
      Alert.alert('Gagal simpan stok', err instanceof Error ? err.message : 'Cek jumlah stok');
    }
  }

  return (
    <Screen>
      <AppCard title="Produk">
        <Picker selectedValue={productId} onValueChange={setProductId}>
          {products.map((product) => <Picker.Item key={product.id} value={product.id} label={`${product.name} (stok ${product.stock_qty})`} />)}
        </Picker>
        <Text>Untuk restock isi jumlah tambahan. Untuk koreksi isi stok akhir.</Text>
      </AppCard>
      <FormField label="Jumlah" value={qty} onChangeText={setQty} keyboardType="numeric" />
      <FormField label="Catatan" value={note} onChangeText={setNote} multiline />
      <AppButton title="Simpan Restock" onPress={() => save('RESTOCK')} />
      <AppButton title="Simpan Koreksi Stok" variant="secondary" onPress={() => save('ADJUST')} />
    </Screen>
  );
}
