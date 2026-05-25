import { Text } from 'react-native';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { getDebtSummary } from '@/services/report.service';
import { listDebts } from '@/services/debt.service';
import { useRefresh } from '@/hooks/useRefresh';
import { toRupiah } from '@/utils/money';

export default function DebtReportScreen() {
  const summary = useRefresh(getDebtSummary, []);
  const debts = useRefresh(() => listDebts(), []);
  return (
    <Screen>
      <AppCard title="Ringkasan Hutang">
        <Text>Total belum lunas: {toRupiah(summary.data?.remaining ?? 0)}</Text>
        <Text>Jumlah catatan: {summary.data?.count ?? 0}</Text>
      </AppCard>
      {(debts.data ?? []).map((debt) => (
        <AppCard key={debt.id} title={debt.customer_name}>
          <Text>Sisa: {toRupiah(debt.amount_total - debt.amount_paid)}</Text>
          <Text>Status: {debt.status}</Text>
        </AppCard>
      ))}
    </Screen>
  );
}
