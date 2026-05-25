const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export function nowIso() {
  return new Date().toISOString();
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
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
  return todayKey(new Date(year, month, 0));
}
