import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { listProducts } from '@/services/product.service';
import { Product } from '@/types/product';
import { colors, spacing } from '@/theme';
import { toRupiah } from '@/utils/money';

export default function ProductsScreen() {
  const [q, setQ] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const load = useCallback(() => listProducts(q).then(setProducts), [q]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen>
      <Link href="/produk/new" asChild><AppButton title="Tambah Produk" /></Link>
      <TextInput value={q} onChangeText={setQ} placeholder="Cari produk, barcode, kategori" style={styles.search} />
      {products.length === 0 ? <EmptyState title="Belum ada produk" body="Tambahkan produk pertama untuk mulai jualan." /> : null}
      {products.map((product) => (
        <Link key={product.id} href={`/produk/${product.id}`} asChild>
          <Pressable>
            <AppCard>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, !product.is_active && styles.inactive]}>{product.name}</Text>
                  <Text style={styles.meta}>{product.category || 'Tanpa kategori'} • Stok {product.stock_qty} {product.unit}</Text>
                  {product.stock_qty <= product.min_stock_qty ? <Text style={styles.warn}>Stok menipis</Text> : null}
                </View>
                <View>
                  <Text style={styles.price}>{toRupiah(product.retail_price)}</Text>
                  {product.wholesale_price ? <Text style={styles.meta}>Grosir {toRupiah(product.wholesale_price)}</Text> : null}
                </View>
              </View>
            </AppCard>
          </Pressable>
        </Link>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { backgroundColor: '#fff', borderColor: colors.border, borderRadius: 14, borderWidth: 1, marginBottom: spacing.md, padding: spacing.md },
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  name: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  inactive: { color: colors.muted, textDecorationLine: 'line-through' },
  meta: { color: colors.muted, marginTop: 3 },
  price: { color: colors.primaryDark, fontWeight: '900', textAlign: 'right' },
  warn: { color: colors.danger, marginTop: 4, fontWeight: '700' },
});
