import { useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { ReceiptPreview } from '@/components/ReceiptPreview';
import { Screen } from '@/components/Screen';
import { shareReceipt, printReceiptPreview, printBluetooth } from '@/services/print.service';
import { generateReceiptText } from '@/services/receipt.service';
import { useRefresh } from '@/hooks/useRefresh';

export default function ReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useRefresh(() => generateReceiptText(id), [id]);
  return (
    <Screen>
      <AppCard title="Preview Struk">
        <ReceiptPreview text={data ?? 'Memuat struk...'} />
      </AppCard>
      <AppButton title="Bagikan Struk" onPress={() => shareReceipt(id).catch((err) => Alert.alert('Gagal bagikan', err.message))} />
      <AppButton title="Cetak Preview" variant="secondary" onPress={() => printReceiptPreview(id).catch((err) => Alert.alert('Gagal cetak', err.message))} />
      <AppButton title="Cetak Bluetooth" variant="ghost" onPress={() => printBluetooth(id).catch((err) => Alert.alert('Belum tersedia', err.message))} />
    </Screen>
  );
}
