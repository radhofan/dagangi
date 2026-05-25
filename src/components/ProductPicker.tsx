import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Product } from '@/types/product';
import { listProducts } from '@/services/product.service';
import { colors, spacing } from '@/theme';
import { toRupiah } from '@/utils/money';

export function ProductPicker({ onSelect }: { onSelect: (product: Product) => void }) {
  const [q, setQ] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    listProducts(q, true).then(setProducts).catch(console.error);
  }, [q]);

  return (
    <View>
      <TextInput value={q} onChangeText={setQ} placeholder="Cari produk atau barcode" style={styles.input} />
      {products.slice(0, 8).map((product) => (
        <Pressable key={product.id} onPress={() => onSelect(product)} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.meta}>Stok {product.stock_qty} {product.unit}</Text>
          </View>
          <Text style={styles.price}>{toRupiah(product.retail_price)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  name: { color: colors.ink, fontWeight: '700' },
  meta: { color: colors.muted, marginTop: 2 },
  price: { color: colors.primaryDark, fontWeight: '800' },
});
