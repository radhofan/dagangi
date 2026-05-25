import { Alert, Text } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { confirmDialog } from '@/components/ConfirmDialog';
import { Screen } from '@/components/Screen';
import { exportBackup, pickAndRestoreBackup } from '@/services/backup.service';

export default function BackupScreen() {
  return (
    <Screen>
      <AppCard title="Backup JSON">
        <Text>Backup berisi produk, transaksi, hutang, pengeluaran, stok, dan pengaturan.</Text>
        <AppButton title="Export Backup" onPress={() => exportBackup().then(() => Alert.alert('Backup dibuat', 'File backup siap dibagikan/disimpan.')).catch((err) => Alert.alert('Gagal backup', err.message))} />
        <AppButton
          title="Restore Backup"
          variant="danger"
          onPress={() => confirmDialog('Restore backup?', 'Data sekarang akan diganti dengan isi file backup.', () => {
            pickAndRestoreBackup().then(() => Alert.alert('Restore selesai')).catch((err) => Alert.alert('Gagal restore', err.message));
          })}
        />
      </AppCard>
    </Screen>
  );
}
