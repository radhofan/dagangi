import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { listExpenses } from '@/services/expense.service';
import { Expense } from '@/types/expense';
import { compactDate } from '@/utils/date';
import { toRupiah } from '@/utils/money';

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  useFocusEffect(useCallback(() => { listExpenses().then(setExpenses); }, []));
  return (
    <Screen>
      <Link href="/pengeluaran/new" asChild><AppButton title="Tambah Pengeluaran" /></Link>
      {expenses.map((expense) => (
        <Link href={`/pengeluaran/${expense.id}`} asChild key={expense.id}>
          <Pressable>
            <AppCard title={expense.category} subtitle={compactDate(expense.expense_date)}>
              <Text style={{ fontWeight: '900' }}>{toRupiah(expense.amount)}</Text>
              {expense.note ? <Text>{expense.note}</Text> : null}
            </AppCard>
          </Pressable>
        </Link>
      ))}
    </Screen>
  );
}
