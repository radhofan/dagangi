import { Text } from 'react-native';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { getMonthlySummary } from '@/services/report.service';
import { useRefresh } from '@/hooks/useRefresh';
import { toRupiah } from '@/utils/money';

export default function MonthlyReportScreen() {
  const now = new Date();
  const { data } = useRefresh(() => getMonthlySummary(now.getFullYear(), now.getMonth() + 1), []);
  return (
    <Screen>
      <AppCard title={`Bulan ${now.getMonth() + 1}/${now.getFullYear()}`}>
        <Text>Total penjualan: {toRupiah(data?.total_sales ?? 0)}</Text>
        <Text>Total modal: {toRupiah(data?.total_cost ?? 0)}</Text>
        <Text>Laba kotor: {toRupiah(data?.gross_profit ?? 0)}</Text>
        <Text>Pengeluaran: {toRupiah(data?.total_expenses ?? 0)}</Text>
        <Text>Estimasi laba bersih: {toRupiah(data?.net_profit ?? 0)}</Text>
        <Text>Transaksi: {data?.transactions ?? 0}</Text>
      </AppCard>
    </Screen>
  );
}
