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
import { formatRupiahInput, parseRupiahInput, toRupiah } from '@/utils/money';

const NEW_CUSTOMER = '__new_customer__';

export default function CashierScreen() {
  const { items, discount, addProduct, setQty, remove, clear, setDiscount } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paid, setPaid] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<string>(NEW_CUSTOMER);
  const [newCustomer, setNewCustomer] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountPercent = subtotal > 0 ? (discount / subtotal) * 100 : 0;
  const grandTotal = Math.max(0, subtotal - discount);
  const paidAmount = parseRupiahInput(paid);
  const isDebtPayment = paymentMethod === 'DEBT';
  const isUnderpaid = paidAmount < grandTotal;
  const debtTotal = Math.max(0, grandTotal - paidAmount);
  const debtPaidOff = isDebtPayment && paidAmount >= grandTotal;

  useEffect(() => {
    listCustomers().then(setCustomers).catch(console.error);
  }, []);

  function selectCustomer(value: string) {
    const nextCustomerId = String(value);
    setCustomerId(nextCustomerId);
    if (nextCustomerId !== NEW_CUSTOMER) {
      setNewCustomer('');
      setNewCustomerPhone('');
    }
  }

  function selectPaymentMethod(method: PaymentMethod) {
    setPaymentMethod(method);
    if (method === 'DEBT') setPaid(toRupiah(0));
  }

  function setDiscountPercent(value: string) {
    const percent = Math.min(100, Number(value.replace(/[^0-9.]/g, '') || 0));
    setDiscount(Math.round(subtotal * (percent / 100)));
  }

  async function saveSale() {
    try {
      if ((!isDebtPayment && isUnderpaid) || debtPaidOff) return;

      let finalCustomerId = isDebtPayment && customerId !== NEW_CUSTOMER ? customerId || null : null;
      if (isDebtPayment && customerId === NEW_CUSTOMER) {
        const customer = await createCustomer({ name: newCustomer.trim(), phone: newCustomerPhone });
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
          value={discount ? formatPercent(discountPercent) : ''}
          onChangeText={setDiscountPercent}
          placeholder="Diskon (%)"
          keyboardType="numeric"
          style={styles.input}
        />
        <Text style={styles.meta}>Diskon: {toRupiah(discount)}</Text>
        <View style={styles.line}><Text>Total</Text><Text style={styles.total}>{toRupiah(grandTotal)}</Text></View>
        <View style={styles.pills}>
          {(['CASH', 'QRIS', 'TRANSFER', 'DEBT'] as PaymentMethod[]).map((method) => (
            <Pressable key={method} onPress={() => selectPaymentMethod(method)} style={[styles.pill, paymentMethod === method && styles.pillActive]}>
              <Text style={[styles.pillText, paymentMethod === method && styles.pillTextActive]}>{method}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.paidRow}>
          <TextInput value={paid} onChangeText={(value) => setPaid(formatRupiahInput(value))} placeholder="Jumlah dibayar" keyboardType="numeric" style={[styles.input, styles.paidInput]} />
          <Pressable style={styles.exactButton} onPress={() => setPaid(toRupiah(grandTotal))}>
            <Text style={styles.exactButtonText}>Uang Pas</Text>
          </Pressable>
        </View>
        <Text style={styles.meta}>Kembali: {toRupiah(Math.max(0, paidAmount - grandTotal))}</Text>
        {!isDebtPayment && isUnderpaid ? <Text style={styles.warning}>Jumlah bayar kurang dari total.</Text> : null}
        {isDebtPayment ? (
          <>
            <Text style={styles.fieldLabel}>Pelanggan Hutang</Text>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={customerId} onValueChange={selectCustomer}>
                <Picker.Item label="Pelanggan baru" value={NEW_CUSTOMER} />
                {customers.map((customer) => <Picker.Item key={customer.id} label={customer.name} value={customer.id} />)}
              </Picker>
            </View>
            {customerId === NEW_CUSTOMER ? (
              <>
                <Text style={styles.fieldLabel}>Nama</Text>
                <TextInput value={newCustomer} onChangeText={setNewCustomer} placeholder="Nama pelanggan" style={styles.input} />
                <Text style={styles.fieldLabel}>Nomor HP</Text>
                <TextInput value={newCustomerPhone} onChangeText={setNewCustomerPhone} placeholder="08..." keyboardType="phone-pad" style={styles.input} />
              </>
            ) : null}
            <View style={styles.line}>
              <Text>Total Hutang</Text>
              <Text style={styles.debtTotal}>{toRupiah(debtTotal)}</Text>
            </View>
            {debtPaidOff ? <Text style={styles.warning}>Untuk transaksi lunas, pilih CASH, QRIS, atau TRANSFER.</Text> : null}
          </>
        ) : null}
        <AppButton title="Simpan Transaksi" onPress={saveSale} disabled={!items.length || (!isDebtPayment && isUnderpaid) || debtPaidOff} />
      </AppCard>
    </Screen>
  );
}

function formatPercent(value: number) {
  if (!value) return '';
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '');
}

const styles = StyleSheet.create({
  input: { backgroundColor: '#fff', borderColor: colors.border, borderRadius: 14, borderWidth: 1, marginVertical: spacing.sm, padding: spacing.md },
  paidRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.sm },
  paidInput: { flex: 1, marginVertical: 0 },
  exactButton: {
    alignItems: 'center',
    backgroundColor: colors.soft,
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  exactButtonText: { color: colors.primaryDark, fontWeight: '900' },
  line: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.xs },
  bold: { color: colors.ink, fontWeight: '800' },
  total: { color: colors.primaryDark, fontSize: 22, fontWeight: '900' },
  debtTotal: { color: colors.danger, fontSize: 18, fontWeight: '900' },
  warning: { color: colors.danger, marginBottom: spacing.sm },
  meta: { color: colors.muted, marginBottom: spacing.sm },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.sm },
  pill: { backgroundColor: colors.soft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  pillActive: { backgroundColor: colors.primary },
  pillText: { color: colors.primaryDark, fontWeight: '800' },
  pillTextActive: { color: '#fff' },
  fieldLabel: { color: colors.ink, marginTop: spacing.sm },
  pickerWrap: {
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: spacing.sm,
    overflow: 'hidden',
  },
});
