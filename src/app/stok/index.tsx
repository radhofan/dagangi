import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { getLowStockProducts } from '@/services/inventory.service';
import { Product } from '@/types/product';
import { colors } from '@/theme';

export default function StockScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  useFocusEffect(useCallback(() => { getLowStockProducts().then(setProducts); }, []));
  return (
    <Screen>
      <Link href="/stok/restock" asChild><AppButton title="Restock / Koreksi Stok" /></Link>
      <AppCard title="Stok Menipis">
        {products.length === 0 ? <Text style={{ color: colors.muted }}>Tidak ada stok menipis.</Text> : null}
        {products.map((product) => (
          <Link key={product.id} href={`/stok/movements/${product.id}`} asChild>
            <Pressable style={{ paddingVertical: 10 }}>
              <Text style={{ fontWeight: '800', color: colors.ink }}>{product.name}</Text>
              <Text style={{ color: colors.danger }}>Stok {product.stock_qty}, minimal {product.min_stock_qty}</Text>
            </Pressable>
          </Link>
        ))}
      </AppCard>
    </Screen>
  );
}
