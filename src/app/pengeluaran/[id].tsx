import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { ExpenseForm } from '@/app/pengeluaran/ExpenseForm';
import { getExpense } from '@/services/expense.service';
import { useRefresh } from '@/hooks/useRefresh';

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading } = useRefresh(() => getExpense(id), [id]);
  if (loading) return <Screen><Text>Memuat...</Text></Screen>;
  if (!data) return <Screen><Text>Pengeluaran tidak ditemukan.</Text></Screen>;
  return <Screen><ExpenseForm expense={data} /></Screen>;
}
