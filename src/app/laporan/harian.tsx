import { Text } from 'react-native';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { getDailySummary, getTopSellingProducts } from '@/services/report.service';
import { useRefresh } from '@/hooks/useRefresh';
import { todayKey } from '@/utils/date';
import { toRupiah } from '@/utils/money';

export default function DailyReportScreen() {
  const summary = useRefresh(() => getDailySummary(todayKey()), []);
  const top = useRefresh(() => getTopSellingProducts(todayKey(), todayKey()), []);
  return (
    <Screen>
      <AppCard title="Ringkasan Hari Ini">
        <Text>Penjualan: {toRupiah(summary.data?.total_sales ?? 0)}</Text>
        <Text>Laba kotor: {toRupiah(summary.data?.gross_profit ?? 0)}</Text>
        <Text>Pengeluaran: {toRupiah(summary.data?.expenses ?? 0)}</Text>
        <Text>Estimasi bersih: {toRupiah(summary.data?.net_profit ?? 0)}</Text>
        <Text>Transaksi: {summary.data?.transaction_count ?? 0}</Text>
      </AppCard>
      <AppCard title="Produk Terlaris">
        {(top.data ?? []).map((item) => <Text key={item.product_name}>{item.product_name}: {item.qty} ({toRupiah(item.total)})</Text>)}
      </AppCard>
    </Screen>
  );
}
