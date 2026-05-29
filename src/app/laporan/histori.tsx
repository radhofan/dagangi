import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { useRefresh } from '@/hooks/useRefresh';
import { getSalesByDateRange, getSalesHistoryByMonth } from '@/services/report.service';
import { colors, spacing } from '@/theme';
import { dateKey, longDate } from '@/utils/date';
import { toRupiah } from '@/utils/money';

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const weekdays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function SalesHistoryScreen() {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [selectedDate, setSelectedDate] = useState(dateKey(now));
  const history = useRefresh(() => getSalesHistoryByMonth(cursor.year, cursor.month), [cursor.year, cursor.month]);
  const selectedDay = useRefresh(() => getSalesByDateRange(selectedDate, selectedDate), [selectedDate]);
  const days = history.data ?? [];
  const daysByDate = useMemo(() => new Map(days.map((day) => [day.date, day])), [days]);
  const totals = days.reduce(
    (sum, day) => ({
      sales: sum.sales + day.total_sales,
      expenses: sum.expenses + day.expenses,
      net: sum.net + day.net_profit,
      transactions: sum.transactions + day.transaction_count,
    }),
    { sales: 0, expenses: 0, net: 0, transactions: 0 },
  );
  const calendarDays = useMemo(() => buildCalendarDays(cursor.year, cursor.month), [cursor.year, cursor.month]);
  const chartDays = useMemo(() => buildMonthChartDays(cursor.year, cursor.month, daysByDate), [cursor.year, cursor.month, daysByDate]);
  const chartValues = chartDays.flatMap((day) => [day.sales, day.expenses]);
  const chartRange = {
    min: Math.min(0, ...chartValues),
    max: Math.max(1, ...chartValues),
  };
  const selectedSummary = daysByDate.get(selectedDate);
  const selectedRows = selectedDay.data?.rows ?? [];

  useEffect(() => {
    const [selectedYear, selectedMonth] = selectedDate.split('-').map(Number);
    if (selectedYear === cursor.year && selectedMonth === cursor.month) return;
    const nextDate = new Date(cursor.year, cursor.month - 1, 1);
    setSelectedDate(dateKey(nextDate));
  }, [cursor.month, cursor.year, selectedDate]);

  function moveMonth(step: number) {
    const next = new Date(cursor.year, cursor.month - 1 + step, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() + 1 });
  }

  return (
    <Screen>
      <AppCard title="Pilih Bulan">
        <View style={styles.monthRow}>
          <Pressable style={styles.navButton} onPress={() => moveMonth(-1)}><Text style={styles.navText}>Bulan Lalu</Text></Pressable>
          <Text style={styles.monthTitle}>{monthNames[cursor.month - 1]} {cursor.year}</Text>
          <Pressable style={styles.navButton} onPress={() => moveMonth(1)}><Text style={styles.navText}>Bulan Depan</Text></Pressable>
        </View>
      </AppCard>

      <AppCard title="Total Bulan Ini">
        <View style={styles.summaryGrid}>
          <View><Text style={styles.label}>Pendapatan</Text><Text style={styles.value}>{toRupiah(totals.sales)}</Text></View>
          <View><Text style={styles.label}>Pengeluaran</Text><Text style={styles.valueDanger}>{toRupiah(totals.expenses)}</Text></View>
          <View><Text style={styles.label}>Estimasi Bersih</Text><Text style={styles.value}>{toRupiah(totals.net)}</Text></View>
          <View><Text style={styles.label}>Transaksi</Text><Text style={styles.value}>{totals.transactions}</Text></View>
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}><View style={[styles.legendDot, styles.salesLegend]} /><Text style={styles.legendText}>Pendapatan</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, styles.expenseLegend]} /><Text style={styles.legendText}>Pengeluaran</Text></View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
          <View style={[styles.chart, { width: chartDays.length * 28 }]}>
            <LineSeries values={chartDays.map((day) => day.sales)} color={colors.primaryDark} range={chartRange} />
            <LineSeries values={chartDays.map((day) => day.expenses)} color={colors.danger} range={chartRange} />
            <View style={[styles.zeroLine, { top: chartY(0, chartRange) }]} />
            <View style={styles.chartLabels}>
              {chartDays.map((day) => <Text key={day.date} style={styles.chartLabel}>{day.day}</Text>)}
            </View>
          </View>
        </ScrollView>
      </AppCard>

      <AppCard title="Pilih Tanggal">
        <View style={styles.weekRow}>
          {weekdays.map((day) => <Text key={day} style={styles.weekday}>{day}</Text>)}
        </View>
        <View style={styles.calendar}>
          {calendarDays.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.calendarRow}>
              {week.map((day, dayIndex) => {
                if (!day) return <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.dateCell} />;
                const dayHistory = daysByDate.get(day.date);
                const isSelected = day.date === selectedDate;
                return (
                  <Pressable
                    key={day.date}
                    style={[styles.dateCell, isSelected && styles.dateCellSelected]}
                    onPress={() => setSelectedDate(day.date)}
                  >
                    <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>{day.day}</Text>
                    {dayHistory?.transaction_count ? <View style={[styles.salesDot, isSelected && styles.salesDotSelected]} /> : null}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard title={longDate(selectedDate)}>
        <View style={styles.dayGrid}>
          <Text>Pendapatan: <Text style={styles.bold}>{toRupiah(selectedSummary?.total_sales ?? 0)}</Text></Text>
          <Text>Pengeluaran: <Text style={styles.danger}>{toRupiah(selectedSummary?.expenses ?? 0)}</Text></Text>
          <Text>Laba kotor: <Text style={styles.bold}>{toRupiah(selectedSummary?.gross_profit ?? 0)}</Text></Text>
          <Text>Estimasi bersih: <Text style={styles.bold}>{toRupiah(selectedSummary?.net_profit ?? 0)}</Text></Text>
          <Text>Transaksi: <Text style={styles.bold}>{selectedSummary?.transaction_count ?? 0}</Text></Text>
        </View>
      </AppCard>

      {selectedRows.map((sale) => (
        <Link key={sale.id} href={`/jualan/receipt/${sale.id}`} asChild>
          <Pressable>
            <AppCard title={sale.invoice_no}>
              <View style={styles.saleRow}>
                <View style={styles.saleInfo}>
                  <Text style={styles.itemName}>{sale.payment_method} • {sale.payment_status}</Text>
                  <Text style={styles.muted}>Bayar {toRupiah(sale.paid_amount)} • Kembali {toRupiah(sale.change_amount)}</Text>
                </View>
                <Text style={styles.saleTotal}>{toRupiah(sale.grand_total)}</Text>
              </View>
              {sale.note ? <Text style={styles.muted}>{sale.note}</Text> : null}
            </AppCard>
          </Pressable>
        </Link>
      ))}

      {selectedSummary?.sold_products.length ? (
        <AppCard title="Barang Terjual">
          {selectedSummary.sold_products.map((item) => (
            <View key={`${selectedDate}-${item.product_name}`} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.product_name}</Text>
              <Text style={styles.itemMeta}>{item.qty} • {toRupiah(item.total)}</Text>
            </View>
          ))}
        </AppCard>
      ) : null}

    </Screen>
  );
}

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const leadingEmptyDays = firstDay.getDay();
  const cells: Array<{ day: number; date: string } | null> = Array.from({ length: leadingEmptyDays }, () => null);
  for (let day = 1; day <= lastDate; day += 1) {
    cells.push({ day, date: dateKey(new Date(year, month - 1, day)) });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: Array<Array<{ day: number; date: string } | null>> = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }
  return weeks;
}

function buildMonthChartDays(year: number, month: number, daysByDate: Map<string, { total_sales: number; expenses: number; net_profit: number }>) {
  const lastDate = new Date(year, month, 0).getDate();
  return Array.from({ length: lastDate }, (_, index) => {
    const day = index + 1;
    const date = dateKey(new Date(year, month - 1, day));
    const summary = daysByDate.get(date);
    return {
      date,
      day,
      sales: summary?.total_sales ?? 0,
      expenses: summary?.expenses ?? 0,
      net: summary?.net_profit ?? 0,
    };
  });
}

function LineSeries({ values, color, range }: { values: number[]; color: string; range: { min: number; max: number } }) {
  const points = values.map((value, index) => ({
    x: index * 28 + 12,
    y: chartY(value, range),
  }));
  return (
    <>
      {points.slice(1).map((point, index) => {
        const previous = points[index];
        const dx = point.x - previous.x;
        const dy = point.y - previous.y;
        const length = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        return (
          <View
            key={`${color}-${index}`}
            style={[
              styles.lineSegment,
              {
                backgroundColor: color,
                left: (previous.x + point.x) / 2 - length / 2,
                top: (previous.y + point.y) / 2,
                transform: [{ rotateZ: `${angle}rad` }],
                width: length,
              },
            ]}
          />
        );
      })}
      {points.map((point, index) => (
        <View key={`${color}-dot-${index}`} style={[styles.lineDot, { backgroundColor: color, left: point.x - 3, top: point.y - 3 }]} />
      ))}
    </>
  );
}

function chartY(value: number, range: { min: number; max: number }) {
  const chartHeight = 96;
  const span = Math.max(1, range.max - range.min);
  return Math.round(chartHeight - ((value - range.min) / span) * chartHeight) + 6;
}

const styles = StyleSheet.create({
  monthRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  navButton: { backgroundColor: colors.soft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  navText: { color: colors.primaryDark, fontWeight: '800' },
  monthTitle: { color: colors.ink, flex: 1, fontSize: 17, fontWeight: '900', textAlign: 'center' },
  summaryGrid: { gap: spacing.sm },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  legendItem: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  legendDot: { borderRadius: 999, height: 8, width: 8 },
  salesLegend: { backgroundColor: colors.primaryDark },
  expenseLegend: { backgroundColor: colors.danger },
  legendText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  chartScroll: { marginTop: spacing.sm },
  chart: {
    height: 138,
    position: 'relative',
  },
  zeroLine: {
    backgroundColor: colors.border,
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  lineSegment: {
    borderRadius: 999,
    height: 2.5,
    position: 'absolute',
  },
  lineDot: {
    borderColor: '#fff',
    borderRadius: 999,
    borderWidth: 1,
    height: 6,
    position: 'absolute',
    width: 6,
  },
  chartLabels: {
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  chartLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', textAlign: 'center', width: 28 },
  label: { color: colors.muted, fontWeight: '700' },
  value: { color: colors.primaryDark, fontSize: 18, fontWeight: '900', marginTop: 2 },
  valueDanger: { color: colors.danger, fontSize: 18, fontWeight: '900', marginTop: 2 },
  weekRow: { flexDirection: 'row', marginBottom: spacing.xs },
  weekday: { color: colors.muted, flex: 1, fontSize: 12, fontWeight: '800', textAlign: 'center' },
  calendar: { gap: 4 },
  calendarRow: { flexDirection: 'row', gap: 4 },
  dateCell: {
    alignItems: 'center',
    aspectRatio: 1,
    flex: 1,
    justifyContent: 'center',
    padding: 4,
  },
  dateCellSelected: { backgroundColor: colors.primary, borderRadius: 12 },
  dateText: { color: colors.ink, fontWeight: '800' },
  dateTextSelected: { color: '#fff' },
  salesDot: { backgroundColor: colors.primaryDark, borderRadius: 999, height: 5, marginTop: 4, width: 5 },
  salesDotSelected: { backgroundColor: '#fff' },
  dayGrid: { gap: 5 },
  bold: { color: colors.ink, fontWeight: '900' },
  danger: { color: colors.danger, fontWeight: '900' },
  muted: { color: colors.muted },
  itemRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemName: { color: colors.ink, flex: 1, fontWeight: '700' },
  itemMeta: { color: colors.primaryDark, fontWeight: '800' },
  saleRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' },
  saleInfo: { flex: 1 },
  saleTotal: { color: colors.primaryDark, fontSize: 16, fontWeight: '900', textAlign: 'right' },
});
