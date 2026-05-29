import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Product } from '@/types/product';
import { listProducts, listRecentlySoldProducts } from '@/services/product.service';
import { colors, spacing } from '@/theme';
import { toRupiah } from '@/utils/money';

export function ProductPicker({ onSelect }: { onSelect: (product: Product) => void }) {
  const [q, setQ] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const query = q.trim();
  const visibleProducts = products.slice(0, query ? 8 : 3);

  useEffect(() => {
    const loader = query ? listProducts(query, true) : listRecentlySoldProducts(3);
    loader.then(setProducts).catch(console.error);
  }, [query]);

  return (
    <View style={styles.wrap}>
      <TextInput value={q} onChangeText={setQ} placeholder="Cari produk atau barcode" style={styles.input} />
      <View style={styles.listHeader}>
        <Text style={styles.sectionLabel}>{query ? 'Hasil Pencarian' : 'Terakhir Dijual'}</Text>
        {!query ? <Text style={styles.sectionMeta}>3 terakhir</Text> : null}
      </View>
      {visibleProducts.length ? (
        <View style={styles.list}>
          {visibleProducts.map((product, index) => (
            <Pressable
              key={product.id}
              onPress={() => onSelect(product)}
              style={[styles.row, index === visibleProducts.length - 1 && styles.lastRow]}
            >
              <View style={styles.productInfo}>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.meta}>Stok {product.stock_qty} {product.unit}</Text>
              </View>
              <Text style={styles.price}>{toRupiah(product.retail_price)}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.xs },
  input: {
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  sectionLabel: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  sectionMeta: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  list: {
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.sm,
  },
  lastRow: { borderBottomWidth: 0 },
  productInfo: { flex: 1 },
  name: { color: colors.ink, fontWeight: '700' },
  meta: { color: colors.muted, marginTop: 2 },
  price: { color: colors.primaryDark, fontWeight: '800' },
});
