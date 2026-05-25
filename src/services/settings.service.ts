import { all, run } from '@/db/database';
import { nowIso } from '@/utils/date';

export type SettingsMap = Record<string, string>;

export async function getSettings() {
  const rows = await all<{ key: string; value: string }>('SELECT key, value FROM app_settings');
  return rows.reduce<SettingsMap>((map, row) => {
    map[row.key] = row.value;
    return map;
  }, {});
}

export async function setSetting(key: string, value: string) {
  await run(
    'INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)',
    [key, value, nowIso()],
  );
}

export async function setSettings(values: SettingsMap) {
  for (const [key, value] of Object.entries(values)) {
    await setSetting(key, value);
  }
}

export async function allowNegativeStock() {
  const settings = await getSettings();
  return settings.allow_negative_stock === 'true';
}
