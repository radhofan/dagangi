import { Alert, Text } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { testPrinter } from '@/services/print.service';

export default function PrinterScreen() {
  return (
    <Screen>
      <AppCard title="Printer Thermal">
        <Text>Untuk V1 di Expo Go, Dagangi menyiapkan preview, cetak sistem, dan bagikan struk. Bluetooth ESC/POS asli disiapkan sebagai stub untuk development build nanti.</Text>
        <AppButton title="Test Printer Bluetooth" variant="ghost" onPress={() => testPrinter().catch((err) => Alert.alert('Stub printer', err.message))} />
      </AppCard>
    </Screen>
  );
}
