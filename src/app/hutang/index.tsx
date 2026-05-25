import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { listDebts } from '@/services/debt.service';
import { Debt } from '@/types/debt';
import { colors } from '@/theme';
import { toRupiah } from '@/utils/money';

export default function DebtScreen() {
  const [debts, setDebts] = useState<Debt[]>([]);
  useFocusEffect(useCallback(() => { listDebts().then(setDebts); }, []));
  return (
    <Screen>
      <Link href="/hutang/customers" asChild><AppButton title="Pelanggan" /></Link>
      {debts.map((debt) => (
        <Link key={debt.id} href={`/hutang/debt/${debt.id}`} asChild>
          <Pressable>
            <AppCard>
              <Text style={{ color: colors.ink, fontWeight: '900' }}>{debt.customer_name}</Text>
              <Text>Sisa: {toRupiah(debt.amount_total - debt.amount_paid)}</Text>
              <Text style={{ color: colors.muted }}>{debt.status}</Text>
            </AppCard>
          </Pressable>
        </Link>
      ))}
    </Screen>
  );
}
