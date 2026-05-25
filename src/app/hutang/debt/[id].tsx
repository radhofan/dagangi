import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { FormField } from '@/components/FormField';
import { Screen } from '@/components/Screen';
import { getDebt, getDebtPayments, recordDebtPayment } from '@/services/debt.service';
import { useRefresh } from '@/hooks/useRefresh';
import { parseRupiahInput, toRupiah } from '@/utils/money';

export default function DebtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const debt = useRefresh(() => getDebt(id), [id]);
  const payments = useRefresh(() => getDebtPayments(id), [id]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  async function pay() {
    try {
      await recordDebtPayment(id, parseRupiahInput(amount), note);
      setAmount('');
      setNote('');
      await debt.refresh();
      await payments.refresh();
    } catch (err) {
      Alert.alert('Gagal bayar hutang', err instanceof Error ? err.message : 'Cek jumlah bayar');
    }
  }

  const remaining = debt.data ? debt.data.amount_total - debt.data.amount_paid : 0;
  return (
    <Screen>
      <AppCard title={debt.data?.customer_name ?? 'Hutang'}>
        <Text>Total: {toRupiah(debt.data?.amount_total ?? 0)}</Text>
        <Text>Terbayar: {toRupiah(debt.data?.amount_paid ?? 0)}</Text>
        <Text>Sisa: {toRupiah(remaining)}</Text>
      </AppCard>
      {remaining > 0 ? (
        <AppCard title="Catat Pembayaran">
          <FormField label="Jumlah Bayar" value={amount} onChangeText={setAmount} keyboardType="numeric" />
          <FormField label="Catatan" value={note} onChangeText={setNote} />
          <AppButton title="Bayar" onPress={pay} />
        </AppCard>
      ) : null}
      <AppCard title="Riwayat Pembayaran">
        {(payments.data ?? []).map((payment) => <Text key={payment.id}>{payment.payment_date}: {toRupiah(payment.amount)} {payment.note || ''}</Text>)}
      </AppCard>
    </Screen>
  );
}
