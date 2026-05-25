import { getSettings } from '@/services/settings.service';
import { getSaleById } from '@/services/sales.service';
import { toRupiah } from '@/utils/money';

export async function generateReceiptText(saleId: string) {
  const sale = await getSaleById(saleId);
  if (!sale) throw new Error('Struk tidak ditemukan');
  const settings = await getSettings();
  const lines = [
    settings.shop_name || 'Dagangi Kasir',
    settings.shop_address || '',
    settings.shop_phone || '',
    '------------------------------',
    `No: ${sale.invoice_no}`,
    `Tanggal: ${new Date(sale.created_at).toLocaleString('id-ID')}`,
    '------------------------------',
    ...sale.items.flatMap((item) => [
      item.product_name_snapshot,
      `${item.qty} ${item.unit} x ${toRupiah(item.unit_price)} = ${toRupiah(item.subtotal)}`,
    ]),
    '------------------------------',
    `Subtotal : ${toRupiah(sale.subtotal)}`,
    `Diskon   : ${toRupiah(sale.discount_total)}`,
    `Total    : ${toRupiah(sale.grand_total)}`,
    `Bayar    : ${toRupiah(sale.paid_amount)}`,
    `Kembali  : ${toRupiah(sale.change_amount)}`,
    `Metode   : ${sale.payment_method}`,
    sale.payment_status !== 'PAID' ? `Hutang   : ${toRupiah(sale.grand_total - sale.paid_amount)}` : '',
    '------------------------------',
    settings.receipt_footer || 'Terima kasih',
  ];
  return lines.filter(Boolean).join('\n');
}

export async function generateReceiptHtml(saleId: string) {
  const text = await generateReceiptText(saleId);
  return `<!doctype html><html><body><pre style="font-family: monospace; font-size: 13px;">${escapeHtml(text)}</pre></body></html>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char] ?? char));
}
