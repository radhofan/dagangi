import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateReceiptHtml, generateReceiptText } from '@/services/receipt.service';

export async function shareReceipt(saleId: string) {
  const text = await generateReceiptText(saleId);
  const uri = `${FileSystem.documentDirectory}struk-${saleId}.txt`;
  await FileSystem.writeAsStringAsync(uri, text);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'text/plain', dialogTitle: 'Bagikan Struk' });
  }
  return uri;
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
