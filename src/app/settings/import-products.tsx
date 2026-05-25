import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { ImportRow, importProducts, pickCsvRows } from '@/services/import.service';

export default function ImportProductsScreen() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  async function pick() {
    const parsed = await pickCsvRows();
    setRows(parsed);
  }
  async function save() {
    try {
      const count = await importProducts(rows, true);
      Alert.alert('Import selesai', `${count} produk berhasil diimport.`);
    } catch (err) {
      Alert.alert('Gagal import', err instanceof Error ? err.message : 'Cek file CSV');
    }
  }
  return (
    <Screen>
      <AppCard title="Format CSV">
        <Text>Header: name,barcode,category,unit,cost_price,retail_price,wholesale_price,wholesale_min_qty,stock_qty,min_stock_qty</Text>
        <AppButton title="Pilih CSV" onPress={pick} />
      </AppCard>
      {rows.length ? (
        <AppCard title={`Preview ${rows.length} baris`}>
          {rows.slice(0, 12).map((row, index) => <Text key={`${row.name}-${index}`}>{row.valid ? 'OK' : 'ERROR'} - {row.name} {row.error || ''}</Text>)}
          <AppButton title="Import Baris Valid" onPress={save} />
        </AppCard>
      ) : null}
    </Screen>
  );
}
