import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { FormField } from '@/components/FormField';
import { Screen } from '@/components/Screen';
import { CustomerForm } from '@/app/hutang/customer/CustomerForm';
import { getCustomer } from '@/services/customer.service';
import { createManualDebt } from '@/services/debt.service';
import { useRefresh } from '@/hooks/useRefresh';
import { formatRupiahInput, parseRupiahInput } from '@/utils/money';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useRefresh(() => getCustomer(id), [id]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  async function saveDebt() {
    try {
      await createManualDebt({ customer_id: id, amount_total: parseRupiahInput(amount), note });
      setAmount('');
      setNote('');
      Alert.alert('Berhasil', 'Hutang pelanggan dicatat');
    } catch (err) {
      Alert.alert('Gagal', err instanceof Error ? err.message : 'Cek jumlah hutang');
    }
  }

  return (
    <Screen>
      <AppCard title="Edit Pelanggan">
        {data ? <CustomerForm customer={data} /> : null}
      </AppCard>
      <AppCard title="Catat Hutang Manual">
        <FormField label="Jumlah Hutang" value={amount} onChangeText={(value) => setAmount(formatRupiahInput(value))} keyboardType="numeric" />
        <FormField label="Catatan" value={note} onChangeText={setNote} multiline />
        <AppButton title="Simpan Hutang" onPress={saveDebt} />
      </AppCard>
    </Screen>
  );
}
