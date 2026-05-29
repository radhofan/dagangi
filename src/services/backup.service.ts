import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { all, exec, run, transaction } from '@/db/database';
import { tableNames } from '@/db/schema';
import { nowIso } from '@/utils/date';

type Backup = {
  app: 'Dagangi';
  version: 1;
  exported_at: string;
  data: Record<string, unknown[]>;
};

export async function exportBackup() {
  const data: Backup['data'] = {};
  for (const table of tableNames) {
    data[table] = await all(`SELECT * FROM ${table}`);
  }
  const backup: Backup = { app: 'Dagangi', version: 1, exported_at: nowIso(), data };
  const uri = `${FileSystem.documentDirectory}dagangi-backup-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(backup, null, 2));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Simpan Backup Dagangi' });
  }
  return uri;
}

export async function exportExcelBackup() {
  const sheets: Array<{ name: string; columns: string[]; rows: Record<string, unknown>[] }> = [];
  for (const table of tableNames) {
    const rows = await all<Record<string, unknown>>(`SELECT * FROM ${table}`);
    const schema = await all<{ name: string }>(`PRAGMA table_info(${table})`);
    const schemaColumns = schema.map((column) => column.name);
    const rowColumns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
    sheets.push({
      name: table,
      columns: schemaColumns.length ? schemaColumns : rowColumns,
      rows,
    });
  }

  const workbook = buildExcelXmlWorkbook(sheets);
  const uri = `${FileSystem.documentDirectory}dagangi-data-${Date.now()}.xls`;
  await FileSystem.writeAsStringAsync(uri, workbook);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/vnd.ms-excel',
      dialogTitle: 'Simpan Excel Dagangi',
    });
  }
  return uri;
}

export async function pickAndRestoreBackup() {
  const picked = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
  if (picked.canceled) return;
  await restoreBackup(picked.assets[0].uri);
}

export async function restoreBackup(fileUri: string) {
  const raw = await FileSystem.readAsStringAsync(fileUri);
  const backup = JSON.parse(raw) as Backup;
  if (backup.app !== 'Dagangi' || backup.version !== 1 || !backup.data) {
    throw new Error('Format backup tidak valid');
  }
  await transaction(async () => {
    await exec('PRAGMA foreign_keys = OFF;');
    for (const table of [...tableNames].reverse()) {
      await run(`DELETE FROM ${table}`);
    }
    for (const table of tableNames) {
      const rows = backup.data[table] ?? [];
      for (const row of rows as Record<string, unknown>[]) {
        const keys = Object.keys(row);
        const placeholders = keys.map(() => '?').join(', ');
        await run(
          `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
          keys.map((key) => row[key]) as any[],
        );
      }
    }
    await exec('PRAGMA foreign_keys = ON;');
  });
}

function buildExcelXmlWorkbook(sheets: Array<{ name: string; columns: string[]; rows: Record<string, unknown>[] }>) {
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0F766E" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 ${sheets.map(buildWorksheetXml).join('\n')}
</Workbook>`;
}

function buildWorksheetXml(sheet: { name: string; columns: string[]; rows: Record<string, unknown>[] }) {
  const columns = sheet.columns.length ? sheet.columns : ['empty'];
  const header = `<Row>${columns.map((column) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(column)}</Data></Cell>`).join('')}</Row>`;
  const rows = sheet.rows.map((row) => (
    `<Row>${columns.map((column) => buildCellXml(row[column])).join('')}</Row>`
  ));
  return `<Worksheet ss:Name="${escapeXml(sheetName(sheet.name))}">
  <Table>
   ${columns.map(() => '<Column ss:AutoFitWidth="1" ss:Width="140"/>').join('\n   ')}
   ${header}
   ${rows.join('\n   ')}
  </Table>
 </Worksheet>`;
}

function buildCellXml(value: unknown) {
  if (value === null || value === undefined) return '<Cell><Data ss:Type="String"></Data></Cell>';
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`;
  }
  return `<Cell><Data ss:Type="String">${escapeXml(String(value))}</Data></Cell>`;
}

function sheetName(value: string) {
  return value.replace(/[\\/?*[\]:]/g, '_').slice(0, 31) || 'Sheet';
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (char) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
  }[char] ?? char));
}
