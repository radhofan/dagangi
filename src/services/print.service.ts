import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateReceiptHtml } from '@/services/receipt.service';

export async function shareReceipt(saleId: string, imageUri: string) {
  const targetUri = `${FileSystem.documentDirectory}struk-${saleId}.jpg`;
  const existing = await FileSystem.getInfoAsync(targetUri);
  if (existing.exists) {
    await FileSystem.deleteAsync(targetUri);
  }
  await FileSystem.copyAsync({ from: imageUri, to: targetUri });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(targetUri, { mimeType: 'image/jpeg', dialogTitle: 'Bagikan Struk' });
  }
  return targetUri;
}

export async function printReceiptPreview(saleId: string) {
  const html = await generateReceiptHtml(saleId);
  return Print.printAsync({ html });
}

export async function printBluetooth(_saleId: string) {
  throw new Error('Bluetooth printer belum aktif di Expo Go. Gunakan bagikan/cetak preview dulu.');
}

export async function testPrinter() {
  throw new Error('Test printer Bluetooth adalah stub untuk development build nanti.');
}
