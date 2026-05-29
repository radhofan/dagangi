export function toRupiah(value: number | null | undefined) {
  const amount = Number(value ?? 0);
  return `Rp${amount.toLocaleString('id-ID')}`;
}

export function parseRupiahInput(value: string) {
  const cleaned = value.replace(/[^0-9]/g, '');
  return cleaned ? Number(cleaned) : 0;
}

export function formatRupiahInput(value: string) {
  const amount = parseRupiahInput(value);
  return amount > 0 ? toRupiah(amount) : '';
}
