import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { getStockMovements } from '@/services/inventory.service';
import { useRefresh } from '@/hooks/useRefresh';
import { colors } from '@/theme';
import { compactDate } from '@/utils/date';

export default function StockMovementsScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { data } = useRefresh(() => getStockMovements(productId), [productId]);
  return (
    <Screen>
      {(data ?? []).map((movement) => (
        <AppCard key={movement.id}>
          <Text style={{ color: colors.ink, fontWeight: '800' }}>{movement.type} ({movement.qty})</Text>
          <Text style={{ color: colors.muted }}>{movement.before_qty} → {movement.after_qty} • {compactDate(movement.created_at)}</Text>
          {movement.note ? <Text>{movement.note}</Text> : null}
        </AppCard>
      ))}
    </Screen>
  );
}
