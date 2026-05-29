import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { AppButton } from '@/components/AppButton';
import { FormField } from '@/components/FormField';
import { PRODUCT_CATEGORIES, normalizeProductCategory } from '@/constants/productCategories';
import { Product } from '@/types/product';
import { createProduct, deactivateProduct, updateProduct } from '@/services/product.service';
import { confirmDialog } from '@/components/ConfirmDialog';
import { parseRupiahInput, toRupiah } from '@/utils/money';
import { colors, spacing } from '@/theme';

type Props = { product?: Product };
type StockFormat = { label: string; value: number };

const STOCK_FORMATS: StockFormat[] = [
  { label: 'pcs', value: 1 },
  { label: 'pak', value: 6 },
  { label: 'dus', value: 12 },
];

export function ProductForm({ product }: Props) {
  const [name, setName] = useState(product?.name ?? '');
  const [barcode, setBarcode] = useState(product?.barcode ?? '');
  const [category, setCategory] = useState(normalizeProductCategory(product?.category));
  const [unit, setUnit] = useState(product?.unit ?? 'pcs');
  const [cost, setCost] = useState(product?.cost_price ? toRupiah(product.cost_price) : '');
  const [retail, setRetail] = useState(product?.retail_price ? toRupiah(product.retail_price) : '');
  const [wholesale, setWholesale] = useState(product?.wholesale_price ? toRupiah(product.wholesale_price) : '');
  const [wholesaleMin, setWholesaleMin] = useState(product?.wholesale_min_qty ? String(product.wholesale_min_qty) : '');
  const [stock, setStock] = useState(String(product?.stock_qty ?? 0));
  const [minStock, setMinStock] = useState(String(product?.min_stock_qty ?? 0));
  const [stockFormats, setStockFormats] = useState(STOCK_FORMATS);
  const [stockFormatLabel, setStockFormatLabel] = useState(STOCK_FORMATS[0].label);
  const [minStockFormats, setMinStockFormats] = useState(STOCK_FORMATS);
  const [minStockFormatLabel, setMinStockFormatLabel] = useState(STOCK_FORMATS[0].label);
  const stockFormat = stockFormats.find((item) => item.label === stockFormatLabel) ?? stockFormats[0];
  const minStockFormat = minStockFormats.find((item) => item.label === minStockFormatLabel) ?? minStockFormats[0];

  function setRupiah(setter: (value: string) => void, value: string) {
    const amount = parseRupiahInput(value);
    setter(amount > 0 ? toRupiah(amount) : '');
  }

  function updateNumber(setter: (value: string) => void, value: string, step: number) {
    setter(String(Math.max(0, Number(value || 0) + step)));
  }

  function updateStockFormatValue(value: string) {
    const amount = Math.max(1, Number(value.replace(/[^0-9]/g, '') || 1));
    setStockFormats((current) => current.map((item) => (
      item.label === stockFormatLabel ? { ...item, value: amount } : item
    )));
  }

  function updateMinStockFormatValue(value: string) {
    const amount = Math.max(1, Number(value.replace(/[^0-9]/g, '') || 1));
    setMinStockFormats((current) => current.map((item) => (
      item.label === minStockFormatLabel ? { ...item, value: amount } : item
    )));
  }

  async function save() {
    try {
      const input = {
        name,
        barcode,
        category,
        unit,
        cost_price: parseRupiahInput(cost),
        retail_price: parseRupiahInput(retail),
        wholesale_price: wholesale ? parseRupiahInput(wholesale) : null,
        wholesale_min_qty: wholesaleMin ? Number(wholesaleMin) : null,
        stock_qty: Number(stock || 0),
        min_stock_qty: Number(minStock || 0),
      };
      if (product) await updateProduct(product.id, input);
      else await createProduct(input);
      router.replace('/produk');
    } catch (err) {
      Alert.alert('Gagal menyimpan', err instanceof Error ? err.message : 'Cek kembali data produk');
    }
  }

  return (
    <>
      <FormField label="Nama Produk" value={name} onChangeText={setName} />
      <FormField label="Barcode" value={barcode} onChangeText={setBarcode} />
      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Kategori</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={category} onValueChange={setCategory}>
            {PRODUCT_CATEGORIES.map((item) => <Picker.Item key={item} label={item} value={item} />)}
          </Picker>
        </View>
      </View>
      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Satuan</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={unit} onValueChange={setUnit}>
            <Picker.Item label="pcs" value="pcs" />
          </Picker>
        </View>
      </View>
      <FormField label="Harga Modal" value={cost} onChangeText={(value) => setRupiah(setCost, value)} keyboardType="numeric" />
      <FormField label="Harga Eceran" value={retail} onChangeText={(value) => setRupiah(setRetail, value)} keyboardType="numeric" />
      <FormField label="Harga Grosir" value={wholesale} onChangeText={(value) => setRupiah(setWholesale, value)} keyboardType="numeric" />
      <FormField label="Minimal Qty Grosir" value={wholesaleMin} onChangeText={setWholesaleMin} keyboardType="numeric" />
      <StockStepper
        label="Stok Saat Ini"
        value={stock}
        onChangeText={setStock}
        onMinus={() => updateNumber(setStock, stock, -stockFormat.value)}
        onPlus={() => updateNumber(setStock, stock, stockFormat.value)}
        selectedFormat={stockFormat}
        formats={stockFormats}
        onSelectFormat={(format) => setStockFormatLabel(format.label)}
        onChangeFormatValue={updateStockFormatValue}
      />
      <StockStepper
        label="Minimal Stok"
        value={minStock}
        onChangeText={setMinStock}
        onMinus={() => updateNumber(setMinStock, minStock, -minStockFormat.value)}
        onPlus={() => updateNumber(setMinStock, minStock, minStockFormat.value)}
        selectedFormat={minStockFormat}
        formats={minStockFormats}
        onSelectFormat={(format) => setMinStockFormatLabel(format.label)}
        onChangeFormatValue={updateMinStockFormatValue}
      />
      <AppButton title="Simpan" onPress={save} />
      {product?.is_active ? (
        <AppButton
          title="Nonaktifkan Produk"
          variant="danger"
          onPress={() => confirmDialog('Nonaktifkan produk?', 'Produk tidak muncul di pencarian kasir, tapi riwayat transaksi tetap aman.', async () => {
            await deactivateProduct(product.id);
            router.replace('/produk');
          })}
        />
      ) : null}
    </>
  );
}

function StockStepper({
  label,
  value,
  onChangeText,
  onMinus,
  onPlus,
  selectedFormat,
  formats,
  onSelectFormat,
  onChangeFormatValue,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  onMinus: () => void;
  onPlus: () => void;
  selectedFormat?: StockFormat;
  formats?: StockFormat[];
  onSelectFormat?: (format: StockFormat) => void;
  onChangeFormatValue?: (value: string) => void;
}) {
  return (
    <View style={styles.stepperWrap}>
      <Text style={styles.label}>{label}</Text>
      {selectedFormat && formats && onSelectFormat && onChangeFormatValue ? (
        <View style={styles.formatRow}>
          <View style={styles.formatOptions}>
            {formats.map((format) => {
              const active = format.label === selectedFormat.label;
              return (
                <Pressable
                  key={format.label}
                  onPress={() => onSelectFormat(format)}
                  style={[styles.formatButton, active && styles.formatButtonActive]}
                >
                  <Text style={[styles.formatText, active && styles.formatTextActive]}>{format.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.formatStepWrap}>
            <Text style={styles.formatStepPrefix}>+/-</Text>
            <TextInput
              value={String(selectedFormat.value)}
              onChangeText={onChangeFormatValue}
              keyboardType="numeric"
              style={styles.formatStepInput}
            />
            <Text style={styles.formatStepSuffix}>pcs</Text>
          </View>
        </View>
      ) : null}
      <View style={styles.stepperRow}>
        <Pressable style={styles.stepperButton} onPress={onMinus}>
          <Text style={styles.stepperText}>-</Text>
        </Pressable>
        <TextInput
          value={value}
          onChangeText={(text) => onChangeText(String(Math.max(0, Number(text.replace(/[^0-9]/g, '') || 0))))}
          keyboardType="numeric"
          style={styles.stepperInput}
        />
        <Pressable style={styles.stepperButton} onPress={onPlus}>
          <Text style={styles.stepperText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepperWrap: {
    marginBottom: spacing.sm,
  },
  fieldWrap: {
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.ink,
    fontWeight: '700',
    marginBottom: 6,
  },
  pickerWrap: {
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  formatRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  formatOptions: {
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  formatButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 10,
  },
  formatButtonActive: {
    backgroundColor: colors.ink,
  },
  formatText: {
    color: colors.muted,
    fontWeight: '800',
  },
  formatTextActive: {
    color: '#fff',
  },
  formatStepWrap: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 42,
    paddingHorizontal: spacing.xs,
  },
  formatStepPrefix: {
    color: colors.muted,
    fontWeight: '700',
    marginHorizontal: 2,
  },
  formatStepInput: {
    color: colors.ink,
    fontWeight: '900',
    minWidth: 36,
    paddingHorizontal: 4,
    paddingVertical: 8,
    textAlign: 'center',
  },
  formatStepSuffix: {
    color: colors.muted,
    fontWeight: '700',
    marginHorizontal: 2,
  },
  stepperRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stepperButton: {
    alignItems: 'center',
    backgroundColor: colors.soft,
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 46,
    width: 52,
  },
  stepperText: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: '900',
  },
  stepperInput: {
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.ink,
    flex: 1,
    fontWeight: '800',
    minHeight: 46,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
  },
});
