import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { confirmDialog } from '@/components/ConfirmDialog';
import { FormField } from '@/components/FormField';
import { deleteExpense, upsertExpense } from '@/services/expense.service';
import { Expense } from '@/types/expense';
import { todayKey } from '@/utils/date';
import { parseRupiahInput } from '@/utils/money';

export function ExpenseForm({ expense }: { expense?: Expense }) {
  const [date, setDate] = useState(expense?.expense_date ?? todayKey());
  const [category, setCategory] = useState(expense?.category ?? 'Lainnya');
  const [amount, setAmount] = useState(String(expense?.amount ?? ''));
  const [note, setNote] = useState(expense?.note ?? '');

  async function save() {
    try {
      await upsertExpense({ id: expense?.id, expense_date: date, category, amount: parseRupiahInput(amount), note });
      router.replace('/pengeluaran');
    } catch (err) {
      Alert.alert('Gagal simpan pengeluaran', err instanceof Error ? err.message : 'Cek data pengeluaran');
    }
  }

  return (
    <>
      <FormField label="Tanggal (YYYY-MM-DD)" value={date} onChangeText={setDate} />
      <FormField label="Kategori" value={category} onChangeText={setCategory} />
      <FormField label="Jumlah" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <FormField label="Catatan" value={note} onChangeText={setNote} multiline />
      <AppButton title="Simpan" onPress={save} />
      {expense ? (
        <AppButton title="Hapus" variant="danger" onPress={() => confirmDialog('Hapus pengeluaran?', 'Data pengeluaran ini akan dihapus.', async () => {
          await deleteExpense(expense.id);
          router.replace('/pengeluaran');
        })} />
      ) : null}
    </>
  );
}
