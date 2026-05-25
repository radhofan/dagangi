import { create } from 'zustand';
import { getSettings, setSettings, SettingsMap } from '@/services/settings.service';

type SettingsState = {
  settings: SettingsMap;
  load: () => Promise<void>;
  save: (values: SettingsMap) => Promise<void>;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {},
  async load() {
    set({ settings: await getSettings() });
  },
  async save(values) {
    await setSettings(values);
    set({ settings: await getSettings() });
  },
}));
