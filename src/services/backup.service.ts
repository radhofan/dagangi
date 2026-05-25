import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { all, exec, run, transaction } from '@/db/database';
import { tableNames } from '@/db/schema';
import { nowIso } from '@/utils/date';

type Backup = {
  app: 'Dagangi';
  version: 1;
  exported_at: string;
  data: Record<string, unknown[]>;
};

export async function exportBackup() {
  const data: Backup['data'] = {};
  for (const table of tableNames) {
    data[table] = await all(`SELECT * FROM ${table}`);
  }
  const backup: Backup = { app: 'Dagangi', version: 1, exported_at: nowIso(), data };
  const uri = `${FileSystem.documentDirectory}dagangi-backup-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(backup, null, 2));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Simpan Backup Dagangi' });
  }
  return uri;
}

export async function pickAndRestoreBackup() {
  const picked = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
  if (picked.canceled) return;
  await restoreBackup(picked.assets[0].uri);
}

export async function restoreBackup(fileUri: string) {
  const raw = await FileSystem.readAsStringAsync(fileUri);
  const backup = JSON.parse(raw) as Backup;
  if (backup.app !== 'Dagangi' || backup.version !== 1 || !backup.data) {
    throw new Error('Format backup tidak valid');
  }
  await transaction(async () => {
    await exec('PRAGMA foreign_keys = OFF;');
    for (const table of [...tableNames].reverse()) {
      await run(`DELETE FROM ${table}`);
    }
    for (const table of tableNames) {
      const rows = backup.data[table] ?? [];
      for (const row of rows as Record<string, unknown>[]) {
        const keys = Object.keys(row);
        const placeholders = keys.map(() => '?').join(', ');
        await run(
          `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
          keys.map((key) => row[key]) as any[],
        );
      }
    }
    await exec('PRAGMA foreign_keys = ON;');
  });
}
