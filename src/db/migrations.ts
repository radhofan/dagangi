import { exec, first, run, transaction } from '@/db/database';
import { nowIso } from '@/utils/date';

const CURRENT_SCHEMA_VERSION = 2;

export async function migrate() {
  await exec('PRAGMA foreign_keys = ON;');
  await exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const row = await first<{ version: number }>('SELECT MAX(version) as version FROM schema_migrations');
  const version = row?.version ?? 0;
  if (version < 1) {
    await migration001();
  }
  if (version < 2) {
    await migration002();
  }
}

async function migration001() {
  await transaction(async () => {
    await exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        barcode TEXT,
        category TEXT,
        unit TEXT NOT NULL DEFAULT 'pcs',
        cost_price INTEGER NOT NULL DEFAULT 0,
        retail_price INTEGER NOT NULL DEFAULT 0,
        wholesale_price INTEGER,
        wholesale_min_qty INTEGER,
        stock_qty INTEGER NOT NULL DEFAULT 0,
        min_stock_qty INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        note TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        invoice_no TEXT NOT NULL UNIQUE,
        sale_date TEXT NOT NULL,
        subtotal INTEGER NOT NULL DEFAULT 0,
        discount_total INTEGER NOT NULL DEFAULT 0,
        grand_total INTEGER NOT NULL DEFAULT 0,
        paid_amount INTEGER NOT NULL DEFAULT 0,
        change_amount INTEGER NOT NULL DEFAULT 0,
        payment_method TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        customer_id TEXT,
        debt_id TEXT,
        note TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );

      CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT NOT NULL,
        product_id TEXT,
        product_name_snapshot TEXT NOT NULL,
        qty INTEGER NOT NULL,
        unit TEXT NOT NULL DEFAULT 'pcs',
        unit_price INTEGER NOT NULL,
        cost_price_snapshot INTEGER NOT NULL DEFAULT 0,
        subtotal INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS debts (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        sale_id TEXT,
        amount_total INTEGER NOT NULL,
        amount_paid INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        due_date TEXT,
        note TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (sale_id) REFERENCES sales(id)
      );

      CREATE TABLE IF NOT EXISTS debt_payments (
        id TEXT PRIMARY KEY,
        debt_id TEXT NOT NULL,
        payment_date TEXT NOT NULL,
        amount INTEGER NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (debt_id) REFERENCES debts(id)
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        expense_date TEXT NOT NULL,
        category TEXT NOT NULL,
        amount INTEGER NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS stock_movements (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        type TEXT NOT NULL,
        qty INTEGER NOT NULL,
        before_qty INTEGER NOT NULL,
        after_qty INTEGER NOT NULL,
        reference_type TEXT,
        reference_id TEXT,
        note TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_products_search ON products(name, barcode, is_active);
      CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
      CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
      CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id, created_at);
    `);

    const settings = {
      shop_name: 'Dagangi Kasir',
      shop_address: '',
      shop_phone: '',
      receipt_footer: 'Terima kasih sudah berbelanja',
      receipt_logo_uri: '',
      allow_negative_stock: 'false',
      currency_symbol: 'Rp',
      printer_address: '',
      printer_paper_width: '58',
    };

    for (const [key, value] of Object.entries(settings)) {
      await run('INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)', [key, value, nowIso()]);
    }

    await run('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)', [1, nowIso()]);
  });
}

async function migration002() {
  await transaction(async () => {
    await run('INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)', ['receipt_logo_uri', '', nowIso()]);
    await run('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)', [2, nowIso()]);
  });
}

export async function resetDatabase() {
  await transaction(async () => {
    await exec(`
      DROP TABLE IF EXISTS stock_movements;
      DROP TABLE IF EXISTS debt_payments;
      DROP TABLE IF EXISTS debts;
      DROP TABLE IF EXISTS sale_items;
      DROP TABLE IF EXISTS sales;
      DROP TABLE IF EXISTS expenses;
      DROP TABLE IF EXISTS customers;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS app_settings;
      DROP TABLE IF EXISTS schema_migrations;
    `);
  });
  await migrate();
}
