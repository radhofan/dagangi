import { Image, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { ReceiptData } from '@/services/receipt.service';
import { toRupiah } from '@/utils/money';

export function ReceiptPreview({ receipt }: { receipt: ReceiptData | null }) {
  if (!receipt) {
    return (
      <View style={styles.paper}>
        <Text style={styles.loading}>Memuat struk...</Text>
      </View>
    );
  }

  const debtAmount = Math.max(0, receipt.sale.grand_total - receipt.sale.paid_amount);

  return (
    <View style={styles.paper}>
      <View style={styles.header}>
        {receipt.logoUri ? (
          <Image source={{ uri: receipt.logoUri }} style={styles.logo} resizeMode="contain" />
        ) : (
          <View style={styles.defaultLogo}>
            <MaterialCommunityIcons name="storefront-outline" size={34} color="#000" />
          </View>
        )}
        <Text style={styles.shopName}>{receipt.shopName}</Text>
        {!!receipt.shopAddress && <Text style={styles.shopMeta}>{receipt.shopAddress}</Text>}
        {!!receipt.shopPhone && <Text style={styles.shopMeta}>{receipt.shopPhone}</Text>}
      </View>

      <Divider />

      <View style={styles.metaRow}>
        <Text style={styles.muted}>No Struk</Text>
        <Text style={styles.metaValue}>{receipt.sale.invoice_no}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.muted}>Tanggal</Text>
        <Text style={styles.metaValue}>{new Date(receipt.sale.created_at).toLocaleString('id-ID')}</Text>
      </View>

      <Divider />

      {receipt.sale.items.map((item) => (
        <View key={item.id} style={styles.item}>
          <Text style={styles.itemName}>{item.product_name_snapshot}</Text>
          <View style={styles.itemCalc}>
            <Text style={styles.muted}>{item.qty} {item.unit} x {toRupiah(item.unit_price)}</Text>
            <Text style={styles.itemTotal}>{toRupiah(item.subtotal)}</Text>
          </View>
        </View>
      ))}

      <Divider />

      <TotalRow label="Subtotal" value={toRupiah(receipt.sale.subtotal)} />
      <TotalRow label="Diskon" value={toRupiah(receipt.sale.discount_total)} />
      <View style={styles.grandRow}>
        <Text style={styles.grandLabel}>Total</Text>
        <Text style={styles.grandValue}>{toRupiah(receipt.sale.grand_total)}</Text>
      </View>
      <TotalRow label="Bayar" value={toRupiah(receipt.sale.paid_amount)} />
      <TotalRow label="Kembali" value={toRupiah(receipt.sale.change_amount)} />
      {debtAmount > 0 && <TotalRow label="Hutang" value={toRupiah(debtAmount)} />}
      <TotalRow label="Metode" value={paymentLabel(receipt.sale.payment_method)} />

      <Divider />

      <Text style={styles.footer}>{receipt.footer}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.totalRow}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.totalValue}>{value}</Text>
    </View>
  );
}

function paymentLabel(method: string) {
  return {
    CASH: 'Tunai',
    QRIS: 'QRIS',
    TRANSFER: 'Transfer',
    DEBT: 'Hutang',
  }[method] ?? method;
}

const styles = StyleSheet.create({
  paper: {
    backgroundColor: '#fffdf7',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: spacing.lg,
  },
  loading: {
    color: colors.ink,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
  },
  logo: {
    height: 72,
    marginBottom: spacing.sm,
    width: 160,
  },
  defaultLogo: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#000',
    borderRadius: 20,
    borderWidth: 1.5,
    height: 64,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 64,
  },
  shopName: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  shopMeta: {
    color: colors.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  divider: {
    borderColor: '#a9b5af',
    borderStyle: 'dashed',
    borderTopWidth: 1,
    marginVertical: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  metaValue: {
    color: colors.ink,
    flex: 1,
    fontWeight: '700',
    textAlign: 'right',
  },
  muted: {
    color: colors.muted,
  },
  item: {
    marginBottom: spacing.sm,
  },
  itemName: {
    color: colors.ink,
    fontWeight: '800',
  },
  itemCalc: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: 2,
  },
  itemTotal: {
    color: colors.ink,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  totalValue: {
    color: colors.ink,
    fontWeight: '700',
  },
  grandRow: {
    borderColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  grandLabel: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  grandValue: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  footer: {
    color: colors.ink,
    fontWeight: '700',
    textAlign: 'center',
  },
});
