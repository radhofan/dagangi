import { Alert, Text } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { confirmDialog } from '@/components/ConfirmDialog';
import { Screen } from '@/components/Screen';
import { exportBackup, exportExcelBackup, pickAndRestoreBackup } from '@/services/backup.service';

export default function BackupScreen() {
  return (
    <Screen>
      <AppCard title="Backup Data Toko">
        <Text>Backup berisi produk, transaksi, hutang, pengeluaran, stok, dan pengaturan.</Text>
        <AppButton title="Export Data" onPress={() => exportBackup().then(() => Alert.alert('Backup dibuat', 'File backup siap dibagikan/disimpan.')).catch((err) => Alert.alert('Gagal backup', err.message))} />
        <AppButton title="Export Excel" variant="secondary" onPress={() => exportExcelBackup().then(() => Alert.alert('Excel dibuat', 'File Excel siap dibagikan/disimpan.')).catch((err) => Alert.alert('Gagal export Excel', err.message))} />
        <AppButton
          title="Import Data"
          variant="danger"
          onPress={() => confirmDialog('Restore dari backup?', 'Data sekarang akan diganti dengan isi file JSON backup yang dipilih.', () => {
            pickAndRestoreBackup().then(() => Alert.alert('Restore selesai', 'Data toko sudah diganti dari file backup.')).catch((err) => Alert.alert('Gagal restore', err.message));
          })}
        />
      </AppCard>
    </Screen>
  );
}
