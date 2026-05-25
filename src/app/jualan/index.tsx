import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { CartItemRow } from '@/components/CartItemRow';
import { EmptyState } from '@/components/EmptyState';
import { ProductPicker } from '@/components/ProductPicker';
import { Screen } from '@/components/Screen';
import { createCustomer, listCustomers } from '@/services/customer.service';
import { createSale } from '@/services/sales.service';
import { useCartStore } from '@/stores/cart.store';
import { Customer } from '@/types/debt';
import { PaymentMethod } from '@/types/sale';
import { colors, spacing } from '@/theme';
import { parseRupiahInput, toRupiah } from '@/utils/money';

export default function CashierScreen() {
  const { items, discount, addProduct, setQty, remove, clear, setDiscount } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paid, setPaid] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<string>('');
  const [newCustomer, setNewCustomer] = useState('');
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const grandTotal = Math.max(0, subtotal - discount);
  const paidAmount = parseRupiahInput(paid);

  useEffect(() => {
    listCustomers().then(setCustomers).catch(console.error);
  }, []);

  async function saveSale() {
    try {
      let finalCustomerId = customerId || null;
      if (!finalCustomerId && newCustomer.trim()) {
        const customer = await createCustomer({ name: newCustomer.trim() });
        finalCustomerId = customer?.id ?? null;
      }
      const sale = await createSale({
        items,
        discount_total: discount,
        payment_method: paymentMethod,
        paid_amount: paidAmount,
        customer_id: finalCustomerId,
      });
      clear();
      router.replace(`/jualan/receipt/${sale.id}`);
    } catch (err) {
      Alert.alert('Transaksi gagal', err instanceof Error ? err.message : 'Cek kembali transaksi');
    }
  }

  return (
    <Screen>
      <AppCard title="Pilih Produk">
        <ProductPicker onSelect={addProduct} />
      </AppCard>

      <AppCard title="Keranjang">
        {items.length === 0 ? <EmptyState title="Keranjang kosong" body="Cari produk lalu tap untuk menambahkan." /> : null}
        {items.map((item) => (
          <CartItemRow key={item.product_id} item={item} onQty={(qty) => setQty(item.product_id, qty)} onRemove={() => remove(item.product_id)} />
        ))}
        {items.length ? <AppButton title="Kosongkan Keranjang" variant="ghost" onPress={clear} /> : null}
      </AppCard>

      <AppCard title="Pembayaran">
        <View style={styles.line}><Text>Subtotal</Text><Text style={styles.bold}>{toRupiah(subtotal)}</Text></View>
        <TextInput
          value={String(discount || '')}
          onChangeText={(value) => setDiscount(parseRupiahInput(value))}
          placeholder="Diskon"
          keyboardType="numeric"
          style={styles.input}
        />
        <View style={styles.line}><Text>Total</Text><Text style={styles.total}>{toRupiah(grandTotal)}</Text></View>
        <View style={styles.pills}>
          {(['CASH', 'QRIS', 'TRANSFER', 'DEBT'] as PaymentMethod[]).map((method) => (
            <Pressable key={method} onPress={() => setPaymentMethod(method)} style={[styles.pill, paymentMethod === method && styles.pillActive]}>
              <Text style={[styles.pillText, paymentMethod === method && styles.pillTextActive]}>{method}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput value={paid} onChangeText={setPaid} placeholder="Jumlah dibayar" keyboardType="numeric" style={styles.input} />
        <Text style={styles.meta}>Kembali: {toRupiah(Math.max(0, paidAmount - grandTotal))}</Text>
        {(paymentMethod === 'DEBT' || paidAmount < grandTotal) ? (
          <>
            <Text style={styles.bold}>Pelanggan untuk hutang</Text>
            <Picker selectedValue={customerId} onValueChange={setCustomerId}>
              <Picker.Item label="Pilih pelanggan lama" value="" />
              {customers.map((customer) => <Picker.Item key={customer.id} label={customer.name} value={customer.id} />)}
            </Picker>
            <TextInput value={newCustomer} onChangeText={setNewCustomer} placeholder="Atau nama pelanggan baru" style={styles.input} />
          </>
        ) : null}
        <AppButton title="Simpan Transaksi" onPress={saveSale} disabled={!items.length} />
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: '#fff', borderColor: colors.border, borderRadius: 14, borderWidth: 1, marginVertical: spacing.sm, padding: spacing.md },
  line: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.xs },
  bold: { color: colors.ink, fontWeight: '800' },
  total: { color: colors.primaryDark, fontSize: 22, fontWeight: '900' },
  meta: { color: colors.muted, marginBottom: spacing.sm },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.sm },
  pill: { backgroundColor: colors.soft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  pillActive: { backgroundColor: colors.primary },
  pillText: { color: colors.primaryDark, fontWeight: '800' },
  pillTextActive: { color: '#fff' },
});
