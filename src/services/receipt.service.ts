import { getSettings, SettingsMap } from '@/services/settings.service';
import { getSaleById } from '@/services/sales.service';
import { SaleWithItems } from '@/types/sale';
import { toRupiah } from '@/utils/money';
import * as FileSystem from 'expo-file-system/legacy';

export type ReceiptData = {
  sale: SaleWithItems;
  settings: SettingsMap;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  footer: string;
  logoUri: string;
};

export async function generateReceiptData(saleId: string): Promise<ReceiptData> {
  const sale = await getSaleById(saleId);
  if (!sale) throw new Error('Struk tidak ditemukan');
  const settings = await getSettings();
  return {
    sale,
    settings,
    shopName: settings.shop_name || 'Dagangi Kasir',
    shopAddress: settings.shop_address || '',
    shopPhone: settings.shop_phone || '',
    footer: settings.receipt_footer || 'Terima kasih',
    logoUri: settings.receipt_logo_uri || '',
  };
}

export async function generateReceiptText(saleId: string) {
  const receipt = await generateReceiptData(saleId);
  const { sale } = receipt;
  const lines = [
    receipt.shopName,
    receipt.shopAddress,
    receipt.shopPhone,
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
    `Metode   : ${paymentLabel(sale.payment_method)}`,
    sale.payment_status !== 'PAID' ? `Hutang   : ${toRupiah(sale.grand_total - sale.paid_amount)}` : '',
    '------------------------------',
    receipt.footer,
  ];
  return lines.filter(Boolean).join('\n');
}

export async function generateReceiptHtml(saleId: string) {
  const receipt = await generateReceiptData(saleId);
  const logoSrc = await logoDataUri(receipt.logoUri);
  const debtAmount = Math.max(0, receipt.sale.grand_total - receipt.sale.paid_amount);
  const rows = receipt.sale.items
    .map(
      (item) => `
        <tr class="item-name"><td colspan="3">${escapeHtml(item.product_name_snapshot)}</td></tr>
        <tr>
          <td>${escapeHtml(`${item.qty} ${item.unit}`)}</td>
          <td>${escapeHtml(toRupiah(item.unit_price))}</td>
          <td class="money">${escapeHtml(toRupiah(item.subtotal))}</td>
        </tr>
      `,
    )
    .join('');

  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      @page { size: 80mm auto; margin: 8mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #f6f7f4;
        color: #17231f;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 11px;
      }
      .page {
        display: flex;
        justify-content: center;
        padding: 12px;
      }
      .receipt {
        width: 72mm;
        background: #fffefa;
        border: 1px solid #e1ded4;
        padding: 16px;
      }
      .header { text-align: center; }
      .logo {
        display: block;
        max-width: 42mm;
        max-height: 22mm;
        object-fit: contain;
        margin: 0 auto 8px;
      }
      .default-logo {
        display: block;
        height: 18mm;
        margin-bottom: 8px;
        margin-left: auto;
        margin-right: auto;
        width: 18mm;
      }
      h1 {
        font-size: 16px;
        line-height: 1.2;
        margin: 0 0 4px;
      }
      p { margin: 2px 0; }
      .muted { color: #66736f; }
      .divider {
        border-top: 1px dashed #9da8a3;
        margin: 12px 0;
      }
      .meta, .totals, .items {
        width: 100%;
        border-collapse: collapse;
      }
      td {
        padding: 2px 0;
        vertical-align: top;
      }
      .meta td:first-child, .totals td:first-child { color: #66736f; }
      .meta td:last-child, .totals td:last-child {
        text-align: right;
        font-weight: 700;
      }
      .item-name td {
        font-weight: 700;
        padding-top: 6px;
      }
      .items td:nth-child(2) { text-align: center; }
      .money { text-align: right; font-weight: 700; }
      .grand td {
        border-top: 1px solid #d8ddd9;
        font-size: 13px;
        padding-top: 8px;
      }
      .footer {
        text-align: center;
        white-space: pre-line;
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="receipt">
        <header class="header">
          ${logoSrc ? `<img class="logo" src="${logoSrc}" />` : defaultLogoSvg()}
          <h1>${escapeHtml(receipt.shopName)}</h1>
          ${receipt.shopAddress ? `<p class="muted">${escapeHtml(receipt.shopAddress)}</p>` : ''}
          ${receipt.shopPhone ? `<p class="muted">${escapeHtml(receipt.shopPhone)}</p>` : ''}
        </header>
        <div class="divider"></div>
        <table class="meta">
          <tr><td>No Struk</td><td>${escapeHtml(receipt.sale.invoice_no)}</td></tr>
          <tr><td>Tanggal</td><td>${escapeHtml(new Date(receipt.sale.created_at).toLocaleString('id-ID'))}</td></tr>
          <tr><td>Metode</td><td>${escapeHtml(paymentLabel(receipt.sale.payment_method))}</td></tr>
        </table>
        <div class="divider"></div>
        <table class="items">${rows}</table>
        <div class="divider"></div>
        <table class="totals">
          <tr><td>Subtotal</td><td>${escapeHtml(toRupiah(receipt.sale.subtotal))}</td></tr>
          <tr><td>Diskon</td><td>${escapeHtml(toRupiah(receipt.sale.discount_total))}</td></tr>
          <tr class="grand"><td>Total</td><td>${escapeHtml(toRupiah(receipt.sale.grand_total))}</td></tr>
          <tr><td>Bayar</td><td>${escapeHtml(toRupiah(receipt.sale.paid_amount))}</td></tr>
          <tr><td>Kembali</td><td>${escapeHtml(toRupiah(receipt.sale.change_amount))}</td></tr>
          ${debtAmount > 0 ? `<tr><td>Hutang</td><td>${escapeHtml(toRupiah(debtAmount))}</td></tr>` : ''}
        </table>
        <div class="divider"></div>
        <p class="footer">${escapeHtml(receipt.footer)}</p>
      </section>
    </main>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char] ?? char));
}

function paymentLabel(method: string) {
  return {
    CASH: 'Tunai',
    QRIS: 'QRIS',
    TRANSFER: 'Transfer',
    DEBT: 'Hutang',
  }[method] ?? method;
}

function defaultLogoSvg() {
  return `<svg class="default-logo" viewBox="0 0 80 80" role="img" aria-label="Logo toko">
    <rect x="8" y="8" width="64" height="64" rx="20" fill="#ffffff" stroke="#000000" stroke-width="3"/>
    <path d="M22 34h36l-4-14H26l-4 14Z" fill="#ffffff" stroke="#000000" stroke-width="3" stroke-linejoin="round"/>
    <path d="M24 34v24h32V34" fill="#ffffff" stroke="#000000" stroke-width="3" stroke-linejoin="round"/>
    <path d="M31 58V43h18v15" fill="#ffffff" stroke="#000000" stroke-width="3" stroke-linejoin="round"/>
    <path d="M20 34h40" stroke="#000000" stroke-width="3" stroke-linecap="round"/>
    <path d="M29 20l-2 14M40 20v14M51 20l2 14" stroke="#000000" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

async function logoDataUri(uri: string) {
  if (!uri) return '';
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return '';
    const ext = uri.split('.').pop()?.toLowerCase();
    const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' as FileSystem.EncodingType });
    return `data:${mimeType};base64,${base64}`;
  } catch {
    return '';
  }
}
