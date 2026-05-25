import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, Text, TextInput } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { createCustomer, listCustomers } from '@/services/customer.service';
import { Customer } from '@/types/debt';
import { colors, spacing } from '@/theme';

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [name, setName] = useState('');
  const load = useCallback(() => listCustomers().then(setCustomers), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function add() {
    try {
      await createCustomer({ name });
      setName('');
      await load();
    } catch (err) {
      Alert.alert('Gagal tambah pelanggan', err instanceof Error ? err.message : 'Nama wajib diisi');
    }
  }

  return (
    <Screen>
      <AppCard title="Tambah Pelanggan">
        <TextInput value={name} onChangeText={setName} placeholder="Nama pelanggan" style={{ backgroundColor: '#fff', borderColor: colors.border, borderRadius: 14, borderWidth: 1, padding: spacing.md }} />
        <AppButton title="Tambah" onPress={add} />
      </AppCard>
      {customers.map((customer) => (
        <Link href={`/hutang/customer/${customer.id}`} asChild key={customer.id}>
          <Pressable><AppCard><Text style={{ fontWeight: '900' }}>{customer.name}</Text><Text>{customer.phone || 'Tanpa nomor HP'}</Text></AppCard></Pressable>
        </Link>
      ))}
    </Screen>
  );
}
