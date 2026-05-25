import { useLocalSearchParams } from 'expo-router';
import { Alert, Text } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { FormField } from '@/components/FormField';
import { Screen } from '@/components/Screen';
import { getCustomer } from '@/services/customer.service';
import { createManualDebt } from '@/services/debt.service';
import { useRefresh } from '@/hooks/useRefresh';
import { useState } from 'react';
import { parseRupiahInput } from '@/utils/money';

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
      <AppCard title={data?.name ?? 'Pelanggan'}>
        <Text>{data?.phone || 'Nomor HP belum diisi'}</Text>
        <Text>{data?.address || ''}</Text>
      </AppCard>
      <AppCard title="Catat Hutang Manual">
        <FormField label="Jumlah Hutang" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <FormField label="Catatan" value={note} onChangeText={setNote} multiline />
        <AppButton title="Simpan Hutang" onPress={saveDebt} />
      </AppCard>
    </Screen>
  );
}
