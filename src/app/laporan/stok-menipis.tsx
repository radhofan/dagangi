import { Text } from 'react-native';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { getLowStockProducts } from '@/services/inventory.service';
import { useRefresh } from '@/hooks/useRefresh';

export default function LowStockReportScreen() {
  const { data } = useRefresh(getLowStockProducts, []);
  return (
    <Screen>
      {(data ?? []).map((product) => (
        <AppCard key={product.id} title={product.name}>
          <Text>Stok: {product.stock_qty} {product.unit}</Text>
          <Text>Minimal: {product.min_stock_qty}</Text>
        </AppCard>
      ))}
    </Screen>
  );
}
