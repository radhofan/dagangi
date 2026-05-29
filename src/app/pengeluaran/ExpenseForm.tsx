import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AppButton } from '@/components/AppButton';
import { confirmDialog } from '@/components/ConfirmDialog';
import { EXPENSE_CATEGORIES, normalizeExpenseCategory } from '@/constants/expenseCategories';
import { FormField } from '@/components/FormField';
import { deleteExpense, upsertExpense } from '@/services/expense.service';
import { Expense } from '@/types/expense';
import { colors, spacing } from '@/theme';
import { todayKey } from '@/utils/date';
import { formatRupiahInput, parseRupiahInput, toRupiah } from '@/utils/money';

export function ExpenseForm({ expense }: { expense?: Expense }) {
  const [date, setDate] = useState(expense?.expense_date ?? todayKey());
  const [category, setCategory] = useState(normalizeExpenseCategory(expense?.category ?? 'Restock'));
  const [amount, setAmount] = useState(expense?.amount ? toRupiah(expense.amount) : '');
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
      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Kategori</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={category} onValueChange={setCategory}>
            {EXPENSE_CATEGORIES.map((item) => <Picker.Item key={item} label={item} value={item} />)}
          </Picker>
        </View>
      </View>
      <FormField label="Jumlah" value={amount} onChangeText={(value) => setAmount(formatRupiahInput(value))} keyboardType="numeric" />
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

const styles = StyleSheet.create({
  fieldWrap: { marginBottom: spacing.sm },
  label: { color: colors.ink, fontWeight: '700', marginBottom: 6 },
  pickerWrap: {
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
