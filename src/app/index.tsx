import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppCard } from '@/components/AppCard';
import { MoneyText } from '@/components/MoneyText';
import { Screen } from '@/components/Screen';
import { getDailySummary } from '@/services/report.service';
import { colors, spacing } from '@/theme';
import { todayKey } from '@/utils/date';
import { useRefresh } from '@/hooks/useRefresh';

const menu = [
  ['Mulai Jualan', '/jualan'],
  ['Tambah Produk', '/produk/new'],
  ['Catat Pengeluaran', '/pengeluaran/new'],
  ['Lihat Hutang', '/hutang'],
  ['Laporan Hari Ini', '/laporan/harian'],
  ['Pengaturan', '/settings'],
] as const;

export default function Dashboard() {
  const { data } = useRefresh(() => getDailySummary(todayKey()), []);
  return (
    <Screen>
      <Text style={styles.hero}>Catat penjualan, stok, hutang, dan struk dari satu HP.</Text>
      <View style={styles.grid}>
        <AppCard title="Penjualan Hari Ini">
          <MoneyText value={data?.total_sales ?? 0} style={styles.big} />
          <Text style={styles.muted}>{data?.transaction_count ?? 0} transaksi</Text>
        </AppCard>
        <AppCard title="Laba Kotor Estimasi">
          <MoneyText value={data?.gross_profit ?? 0} style={styles.big} />
          <Text style={styles.muted}>Bersih kira-kira <MoneyText value={data?.net_profit ?? 0} /></Text>
        </AppCard>
        <AppCard title="Hutang Belum Lunas">
          <MoneyText value={data?.unpaid_debt ?? 0} style={styles.big} />
        </AppCard>
        <AppCard title="Stok Menipis">
          <Text style={styles.big}>{data?.low_stock_count ?? 0} produk</Text>
        </AppCard>
      </View>
      <AppCard title="Aksi Cepat">
        {menu.map(([label, href]) => (
          <Link href={href} asChild key={href}>
            <Pressable style={styles.menu}><Text style={styles.menuText}>{label}</Text></Pressable>
          </Link>
        ))}
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { color: colors.ink, fontSize: 24, fontWeight: '900', lineHeight: 31, marginBottom: spacing.md },
  grid: { gap: spacing.sm },
  big: { color: colors.primaryDark, fontSize: 23, fontWeight: '900', marginTop: 4 },
  muted: { color: colors.muted, marginTop: 4 },
  menu: { backgroundColor: colors.soft, borderRadius: 14, marginVertical: 5, padding: spacing.md },
  menuText: { color: colors.primaryDark, fontWeight: '800' },
});
