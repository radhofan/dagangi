const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export function nowIso() {
  return new Date().toISOString();
}

export function todayKey(date = new Date()) {
  return dateKey(date);
}

export function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function localDayUtcRange(dateKeyValue: string) {
  const [year, month, day] = dateKeyValue.split('-').map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

export function compactDate(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function longDate(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function startOfMonth(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

export function endOfMonth(year: number, month: number) {
  return dateKey(new Date(year, month, 0));
}
