import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CartItem } from '@/types/sale';
import { AppButton } from '@/components/AppButton';
import { toRupiah } from '@/utils/money';
import { colors, spacing } from '@/theme';

type Props = {
  item: CartItem;
  onQty: (qty: number) => void;
  onRemove: () => void;
};

export function CartItemRow({ item, onQty, onRemove }: Props) {
  const low = item.qty > item.stock_qty;
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.product_name}</Text>
        <Text style={[styles.meta, low && styles.warn]}>
          {item.qty} {item.unit} x {toRupiah(item.unit_price)} ({item.price_type})
        </Text>
        {low ? <Text style={styles.warn}>Stok tidak cukup: {item.stock_qty}</Text> : null}
      </View>
      <View style={styles.qty}>
        <Pressable onPress={() => onQty(Math.max(1, item.qty - 1))} style={styles.qtyBtn}><Text>-</Text></Pressable>
        <Text style={styles.qtyText}>{item.qty}</Text>
        <Pressable onPress={() => onQty(item.qty + 1)} style={styles.qtyBtn}><Text>+</Text></Pressable>
      </View>
      <Text style={styles.total}>{toRupiah(item.subtotal)}</Text>
      <AppButton title="Hapus" variant="ghost" onPress={onRemove} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
  },
  name: { color: colors.ink, fontWeight: '700' },
  meta: { color: colors.muted, marginTop: 3 },
  warn: { color: colors.danger },
  qty: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  qtyBtn: { backgroundColor: colors.soft, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7 },
  qtyText: { fontWeight: '800' },
  total: { color: colors.primaryDark, fontWeight: '800', marginTop: spacing.xs },
});
