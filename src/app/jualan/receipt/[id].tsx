import { useLocalSearchParams } from 'expo-router';
import { Alert, View } from 'react-native';
import { useRef } from 'react';
import { captureRef } from 'react-native-view-shot';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { ReceiptPreview } from '@/components/ReceiptPreview';
import { Screen } from '@/components/Screen';
import { shareReceipt, printReceiptPreview, printBluetooth } from '@/services/print.service';
import { generateReceiptData } from '@/services/receipt.service';
import { useRefresh } from '@/hooks/useRefresh';

export default function ReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const receiptRef = useRef<View>(null);
  const { data } = useRefresh(() => generateReceiptData(id), [id]);

  async function shareReceiptImage() {
    if (!receiptRef.current || !data) return;
    const imageUri = await captureRef(receiptRef, {
      format: 'jpg',
      quality: 0.95,
      result: 'tmpfile',
    });
    await shareReceipt(id, imageUri);
  }

  return (
    <Screen>
      <AppCard title="Preview Struk">
        <View ref={receiptRef} collapsable={false}>
          <ReceiptPreview receipt={data} />
        </View>
      </AppCard>
      <AppButton title="Bagikan Struk" onPress={() => shareReceiptImage().catch((err) => Alert.alert('Gagal bagikan', err.message))} disabled={!data} />
      <AppButton title="Cetak Preview" variant="secondary" onPress={() => printReceiptPreview(id).catch((err) => Alert.alert('Gagal cetak', err.message))} />
      <AppButton title="Cetak Bluetooth" variant="ghost" onPress={() => printBluetooth(id).catch((err) => Alert.alert('Belum tersedia', err.message))} />
    </Screen>
  );
}
