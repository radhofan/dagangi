import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { migrate } from '@/db/migrations';
import { useSettingsStore } from '@/stores/settings.store';
import { colors } from '@/theme';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadSettings = useSettingsStore((state) => state.load);

  useEffect(() => {
    migrate()
      .then(loadSettings)
      .then(() => setReady(true))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, [loadSettings]);

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: colors.danger, fontWeight: '700' }}>Gagal membuka database</Text>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.muted }}>Menyiapkan Dagangi...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '800' } }}>
        <Stack.Screen name="index" options={{ title: 'Dagangi Kasir' }} />
        <Stack.Screen name="jualan/index" options={{ title: 'Jualan' }} />
        <Stack.Screen name="jualan/receipt/[id]" options={{ title: 'Struk' }} />
        <Stack.Screen name="produk/index" options={{ title: 'Produk' }} />
        <Stack.Screen name="produk/new" options={{ title: 'Tambah Produk' }} />
        <Stack.Screen name="produk/[id]" options={{ title: 'Edit Produk' }} />
        <Stack.Screen name="stok/index" options={{ title: 'Stok' }} />
        <Stack.Screen name="stok/restock" options={{ title: 'Restock' }} />
        <Stack.Screen name="stok/movements/[productId]" options={{ title: 'Riwayat Stok' }} />
        <Stack.Screen name="hutang/index" options={{ title: 'Hutang' }} />
        <Stack.Screen name="hutang/customers" options={{ title: 'Pelanggan' }} />
        <Stack.Screen name="hutang/customer/new" options={{ title: 'Tambah Pelanggan' }} />
        <Stack.Screen name="hutang/customer/[id]" options={{ title: 'Detail Pelanggan' }} />
        <Stack.Screen name="hutang/debt/[id]" options={{ title: 'Bayar Hutang' }} />
        <Stack.Screen name="pengeluaran/index" options={{ title: 'Pengeluaran' }} />
        <Stack.Screen name="pengeluaran/new" options={{ title: 'Tambah Pengeluaran' }} />
        <Stack.Screen name="pengeluaran/[id]" options={{ title: 'Edit Pengeluaran' }} />
        <Stack.Screen name="laporan/index" options={{ title: 'Laporan' }} />
        <Stack.Screen name="laporan/harian" options={{ title: 'Penjualan Hari Ini' }} />
        <Stack.Screen name="laporan/histori" options={{ title: 'Histori Penjualan' }} />
        <Stack.Screen name="laporan/bulanan" options={{ title: 'Laporan Bulanan' }} />
        <Stack.Screen name="laporan/stok-menipis" options={{ title: 'Stok Menipis' }} />
        <Stack.Screen name="laporan/hutang" options={{ title: 'Laporan Hutang' }} />
        <Stack.Screen name="settings/index" options={{ title: 'Pengaturan' }} />
        <Stack.Screen name="settings/toko" options={{ title: 'Toko' }} />
        <Stack.Screen name="settings/backup" options={{ title: 'Backup Data Toko' }} />
        <Stack.Screen name="settings/printer" options={{ title: 'Printer' }} />
        <Stack.Screen name="settings/import-products" options={{ title: 'Import Produk' }} />
        <Stack.Screen name="settings/developer" options={{ title: 'Developer Tools' }} />
      </Stack>
    </>
  );
}
