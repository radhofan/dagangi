import { Alert, Text } from 'react-native';
import Constants from 'expo-constants';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { confirmDialog } from '@/components/ConfirmDialog';
import { Screen } from '@/components/Screen';
import { migrate, resetDatabase } from '@/db/migrations';
import { seedSampleData } from '@/db/seed';
import { all } from '@/db/database';
import { tableNames } from '@/db/schema';
import { exportBackup, pickAndRestoreBackup } from '@/services/backup.service';
import { useState } from 'react';

const isDev = __DEV__;

export default function DeveloperScreen() {
  const [counts, setCounts] = useState<string[]>([]);

  async function showCounts() {
    const next: string[] = [];
    for (const table of tableNames) {
      const row = await all<{ count: number }>(`SELECT COUNT(*) as count FROM ${table}`);
      next.push(`${table}: ${row[0]?.count ?? 0}`);
    }
    setCounts(next);
  }

  return (
    <Screen>
      <AppCard title="Info">
        <Text>Mode: {isDev ? 'Development' : 'Production'}</Text>
        <Text>Expo SDK: {Constants.expoConfig?.sdkVersion ?? '-'}</Text>
      </AppCard>
      <AppCard title="Tools Aman">
        <AppButton title="Run Migrations" onPress={() => migrate().then(() => Alert.alert('Migrasi selesai'))} />
        <AppButton title="Show Table Counts" onPress={showCounts} />
        <AppButton title="Export Backup JSON" onPress={() => exportBackup()} />
        <AppButton title="Restore Backup JSON" variant="secondary" onPress={() => pickAndRestoreBackup()} />
        {counts.map((line) => <Text key={line}>{line}</Text>)}
      </AppCard>
      {isDev ? (
        <AppCard title="Tools Development">
          <AppButton title="Seed Sample Data" onPress={() => seedSampleData().then(() => Alert.alert('Data contoh dibuat'))} />
          <AppButton title="Reset Database" variant="danger" onPress={() => confirmDialog('Reset database?', 'Semua data lokal akan dihapus.', async () => {
            await resetDatabase();
            Alert.alert('Database direset');
          })} />
        </AppCard>
      ) : null}
    </Screen>
  );
}
