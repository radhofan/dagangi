import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { getDailySummary, getSoldProductItemsByDate } from '@/services/report.service';
import { useRefresh } from '@/hooks/useRefresh';
import { todayKey } from '@/utils/date';
import { toRupiah } from '@/utils/money';
import { colors, spacing } from '@/theme';

export default function DailyReportScreen() {
  const today = todayKey();
  const summary = useRefresh(() => getDailySummary(today), [today]);
  const soldItems = useRefresh(() => getSoldProductItemsByDate(today), [today]);
  return (
    <Screen>
      <AppCard title="Ringkasan Hari Ini">
        <Text>Penjualan: {toRupiah(summary.data?.total_sales ?? 0)}</Text>
        <Text>Laba kotor: {toRupiah(summary.data?.gross_profit ?? 0)}</Text>
        <Text>Pengeluaran: {toRupiah(summary.data?.expenses ?? 0)}</Text>
        <Text>Estimasi bersih: {toRupiah(summary.data?.net_profit ?? 0)}</Text>
        <Text>Transaksi: {summary.data?.transaction_count ?? 0}</Text>
      </AppCard>
      <AppCard title="Produk Terjual Hari Ini">
        {(soldItems.data ?? []).map((item) => (
          <Link key={item.id} href={`/jualan/receipt/${item.sale_id}`} asChild>
            <Pressable style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.itemMeta}>{new Date(item.sold_at).toLocaleString('id-ID')}</Text>
                <Text style={styles.itemMeta}>{item.invoice_no} • {item.qty} {item.unit} x {toRupiah(item.unit_price)}</Text>
              </View>
              <Text style={styles.itemTotal}>{toRupiah(item.total)}</Text>
            </Pressable>
          </Link>
        ))}
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  itemRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  itemInfo: { flex: 1 },
  itemName: { color: colors.ink, fontWeight: '700' },
  itemMeta: { color: colors.muted, marginTop: 2 },
  itemTotal: { color: colors.primaryDark, fontWeight: '900', textAlign: 'right' },
});
