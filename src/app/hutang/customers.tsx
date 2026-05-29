import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { listCustomers } from '@/services/customer.service';
import { Customer } from '@/types/debt';
import { colors } from '@/theme';

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const load = useCallback(() => listCustomers().then(setCustomers), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen>
      <Link href="/hutang/customer/new" asChild><AppButton title="Tambah Pelanggan" /></Link>
      {customers.map((customer) => (
        <Link href={`/hutang/customer/${customer.id}`} asChild key={customer.id}>
          <Pressable>
            <AppCard>
              <Text style={{ fontWeight: '900' }}>{customer.name}</Text>
              {customer.phone ? <Text style={{ color: colors.muted }}>{customer.phone}</Text> : null}
              {customer.address ? <Text style={{ color: colors.muted }}>{customer.address}</Text> : null}
            </AppCard>
          </Pressable>
        </Link>
      ))}
    </Screen>
  );
}
