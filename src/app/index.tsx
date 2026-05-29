import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { AppCard } from '@/components/AppCard';
import { MoneyText } from '@/components/MoneyText';
import { Screen } from '@/components/Screen';
import { getDailySummary } from '@/services/report.service';
import { useSettingsStore } from '@/stores/settings.store';
import { colors, spacing } from '@/theme';
import { todayKey } from '@/utils/date';
import { useRefresh } from '@/hooks/useRefresh';

const menu = [
  { label: 'Mulai Jualan', href: '/jualan', icon: 'cart-plus' },
  { label: 'Produk', href: '/produk', icon: 'package-variant-closed' },
  { label: 'Catat Pengeluaran', href: '/pengeluaran', icon: 'cash-minus' },
  { label: 'Lihat Hutang', href: '/hutang', icon: 'account-cash' },
  { label: 'Histori Laporan', href: '/laporan/histori', icon: 'history' },
  { label: 'Pengaturan', href: '/settings', icon: 'cog-outline' },
] as const;

export default function Dashboard() {
  const { width } = useWindowDimensions();
  const settings = useSettingsStore((state) => state.settings);
  const { data } = useRefresh(() => getDailySummary(todayKey()), []);
  const [activeMetric, setActiveMetric] = useState(0);
  const cardWidth = width - spacing.md * 2;
  const shopName = settings.shop_name || 'Dagangi Kasir';
  const logoUri = settings.receipt_logo_uri || '';
  const metrics = [
    {
      title: 'Penjualan Hari Ini',
      href: '/laporan/harian',
      value: <MoneyText value={data?.total_sales ?? 0} style={styles.metricValue} />,
      detail: `${data?.transaction_count ?? 0} transaksi`,
    },
    {
      title: 'Pengeluaran Hari Ini',
      href: '/pengeluaran',
      value: <MoneyText value={data?.expenses ?? 0} style={styles.metricValue} />,
      detail: 'Total biaya tercatat hari ini',
    },
    {
      title: 'Laba Kotor Estimasi',
      href: '/laporan/harian',
      value: <MoneyText value={data?.gross_profit ?? 0} style={styles.metricValue} />,
      detail: 'Bersih kira-kira',
      detailValue: data?.net_profit ?? 0,
    },
    {
      title: 'Hutang Belum Lunas',
      href: '/laporan/hutang',
      value: <MoneyText value={data?.unpaid_debt ?? 0} style={styles.metricValue} />,
      detail: 'Total piutang aktif',
    },
    {
      title: 'Stok Menipis',
      href: '/laporan/stok-menipis',
      value: <Text style={styles.metricValue}>{data?.low_stock_count ?? 0} produk</Text>,
      detail: 'Perlu restock',
    },
  ] as const;

  function handleMetricScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setActiveMetric(Math.round(event.nativeEvent.contentOffset.x / cardWidth));
  }

  return (
    <Screen>
      <View style={styles.shopHeader}>
        {logoUri ? (
          <Image source={{ uri: logoUri }} style={styles.shopLogo} resizeMode="contain" />
        ) : (
          <View style={styles.defaultShopLogo}>
            <MaterialCommunityIcons name="storefront-outline" size={34} color="#000" />
          </View>
        )}
        <View style={styles.shopText}>
          <Text style={styles.shopName}>{shopName}</Text>
          <Text style={styles.shopSubtitle}>Catat penjualan, stok, hutang, dan struk dari satu HP.</Text>
        </View>
      </View>

      <View style={styles.metricCarousel}>
        <ScrollView
          horizontal
          onMomentumScrollEnd={handleMetricScroll}
          pagingEnabled
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
        >
          {metrics.map((metric) => (
            <View key={metric.title} style={[styles.metricSlide, { width: cardWidth }]}>
              <Link href={metric.href} asChild>
                <Pressable style={styles.metricCard}>
                  <Text style={styles.metricTitle}>{metric.title}</Text>
                  {metric.value}
                  <Text style={styles.metricDetail}>
                    {metric.detail}
                    {'detailValue' in metric ? (
                      <>
                        {' '}
                        <MoneyText value={metric.detailValue} style={styles.metricDetailMoney} />
                      </>
                    ) : null}
                  </Text>
                  <Text style={styles.tapHint}>Tap untuk detail</Text>
                </Pressable>
              </Link>
            </View>
          ))}
        </ScrollView>
        <View style={styles.dots}>
          {metrics.map((metric, index) => (
            <View key={metric.title} style={[styles.dot, index === activeMetric && styles.dotActive]} />
          ))}
        </View>
      </View>

      <AppCard title="Aksi Cepat">
        <View style={styles.menuGrid}>
          {menu.map((item) => (
            <Link href={item.href} asChild key={item.href}>
              <Pressable style={styles.menuTile}>
                <View style={styles.menuIconWrap}>
                  <MaterialCommunityIcons name={item.icon} size={28} color={colors.primaryDark} />
                </View>
                <Text style={styles.menuText}>{item.label}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  shopHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  shopLogo: {
    backgroundColor: '#fff',
    borderColor: '#000',
    borderRadius: 20,
    borderWidth: 1,
    height: 68,
    width: 68,
  },
  defaultShopLogo: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#000',
    borderRadius: 20,
    borderWidth: 1.5,
    height: 68,
    justifyContent: 'center',
    width: 68,
  },
  shopText: {
    flex: 1,
  },
  shopName: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 31,
  },
  shopSubtitle: {
    color: colors.muted,
    fontWeight: '700',
    marginTop: 3,
  },
  metricCarousel: {
    marginBottom: spacing.md,
  },
  metricSlide: {
    paddingBottom: spacing.xs,
  },
  metricCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 172,
    padding: spacing.lg,
  },
  metricTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  metricValue: {
    color: colors.primaryDark,
    fontSize: 29,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  metricDetail: {
    color: colors.muted,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  metricDetailMoney: {
    color: colors.muted,
    fontWeight: '800',
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  dot: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: colors.primaryDark,
    width: 22,
  },
  tapHint: {
    color: colors.primaryDark,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  menuTile: {
    alignItems: 'center',
    backgroundColor: colors.soft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 116,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  menuIconWrap: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 52,
  },
  menuText: {
    color: colors.primaryDark,
    fontWeight: '800',
    textAlign: 'center',
  },
});
