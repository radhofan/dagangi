import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { useRefresh } from '@/hooks/useRefresh';
import { listDebts } from '@/services/debt.service';
import { colors, spacing } from '@/theme';
import { dateKey, longDate } from '@/utils/date';
import { toRupiah } from '@/utils/money';

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const weekdays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function DebtScreen() {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [selectedDate, setSelectedDate] = useState(dateKey(now));
  const debts = useRefresh(() => listDebts('ALL'), []);
  const rows = debts.data ?? [];
  const monthRows = rows.filter((debt) => isSameMonth(debt.created_at, cursor.year, cursor.month));
  const rowsByDate = useMemo(() => new Map(monthRows.map((debt) => [dateKey(new Date(debt.created_at)), true])), [monthRows]);
  const selectedRows = monthRows.filter((debt) => dateKey(new Date(debt.created_at)) === selectedDate);
  const monthRemaining = monthRows.reduce((sum, debt) => sum + debt.amount_total - debt.amount_paid, 0);
  const selectedRemaining = selectedRows.reduce((sum, debt) => sum + debt.amount_total - debt.amount_paid, 0);
  const calendarDays = useMemo(() => buildCalendarDays(cursor.year, cursor.month), [cursor.year, cursor.month]);

  useEffect(() => {
    const [selectedYear, selectedMonth] = selectedDate.split('-').map(Number);
    if (selectedYear === cursor.year && selectedMonth === cursor.month) return;
    setSelectedDate(dateKey(new Date(cursor.year, cursor.month - 1, 1)));
  }, [cursor.month, cursor.year, selectedDate]);

  function moveMonth(step: number) {
    const next = new Date(cursor.year, cursor.month - 1 + step, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() + 1 });
  }

  return (
    <Screen>
      <Link href="/hutang/customers" asChild><AppButton title="Pelanggan" /></Link>

      <AppCard title="Pilih Bulan">
        <View style={styles.monthRow}>
          <Pressable style={styles.navButton} onPress={() => moveMonth(-1)}><Text style={styles.navText}>Bulan Lalu</Text></Pressable>
          <Text style={styles.monthTitle}>{monthNames[cursor.month - 1]} {cursor.year}</Text>
          <Pressable style={styles.navButton} onPress={() => moveMonth(1)}><Text style={styles.navText}>Bulan Depan</Text></Pressable>
        </View>
      </AppCard>

      <AppCard title="Sisa Hutang Bulan Ini">
        <Text style={styles.valueDanger}>{toRupiah(monthRemaining)}</Text>
        <Text style={styles.muted}>{monthRows.length} riwayat hutang</Text>
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
                const isSelected = day.date === selectedDate;
                return (
                  <Pressable key={day.date} style={[styles.dateCell, isSelected && styles.dateCellSelected]} onPress={() => setSelectedDate(day.date)}>
                    <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>{day.day}</Text>
                    {rowsByDate.get(day.date) ? <View style={[styles.dot, isSelected && styles.dotSelected]} /> : null}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard title={longDate(selectedDate)}>
        <Text style={styles.valueDanger}>{toRupiah(selectedRemaining)}</Text>
        <Text style={styles.muted}>{selectedRows.length} riwayat hutang</Text>
      </AppCard>

      {selectedRows.map((debt) => (
        <Link key={debt.id} href={`/hutang/debt/${debt.id}`} asChild>
          <Pressable>
            <AppCard>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{debt.customer_name}</Text>
                  <Text
                    style={[
                      styles.status,
                      debt.status === 'PAID' && styles.statusPaid,
                      debt.status === 'UNPAID' && styles.statusUnpaid,
                    ]}
                  >
                    {debt.status}
                  </Text>
                  <Text style={styles.muted}>{longDate(new Date(debt.created_at))}</Text>
                </View>
                <Text style={styles.itemTotal}>{toRupiah(debt.amount_total - debt.amount_paid)}</Text>
              </View>
            </AppCard>
          </Pressable>
        </Link>
      ))}
    </Screen>
  );
}

function isSameMonth(value: string, year: number, month: number) {
  const date = new Date(value);
  return date.getFullYear() === year && date.getMonth() + 1 === month;
}

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const cells: Array<{ day: number; date: string } | null> = Array.from({ length: firstDay.getDay() }, () => null);
  for (let day = 1; day <= lastDate; day += 1) cells.push({ day, date: dateKey(new Date(year, month - 1, day)) });
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: Array<Array<{ day: number; date: string } | null>> = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  return weeks;
}

const styles = StyleSheet.create({
  monthRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  navButton: { backgroundColor: colors.soft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  navText: { color: colors.primaryDark, fontWeight: '800' },
  monthTitle: { color: colors.ink, flex: 1, fontSize: 17, fontWeight: '900', textAlign: 'center' },
  valueDanger: { color: colors.danger, fontSize: 22, fontWeight: '900' },
  muted: { color: colors.muted, marginTop: 2 },
  weekRow: { flexDirection: 'row', marginBottom: spacing.xs },
  weekday: { color: colors.muted, flex: 1, fontSize: 12, fontWeight: '800', textAlign: 'center' },
  calendar: { gap: 4 },
  calendarRow: { flexDirection: 'row', gap: 4 },
  dateCell: { alignItems: 'center', aspectRatio: 1, flex: 1, justifyContent: 'center', padding: 4 },
  dateCellSelected: { backgroundColor: colors.primary, borderRadius: 12 },
  dateText: { color: colors.ink, fontWeight: '800' },
  dateTextSelected: { color: '#fff' },
  dot: { backgroundColor: colors.primaryDark, borderRadius: 999, height: 5, marginTop: 4, width: 5 },
  dotSelected: { backgroundColor: '#fff' },
  itemRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' },
  itemInfo: { flex: 1 },
  itemName: { color: colors.ink, fontWeight: '700' },
  status: { color: colors.primaryDark, fontWeight: '800', marginTop: 2 },
  statusPaid: { color: colors.primary },
  statusUnpaid: { color: colors.danger },
  itemTotal: { color: colors.danger, fontWeight: '900', textAlign: 'right' },
});
