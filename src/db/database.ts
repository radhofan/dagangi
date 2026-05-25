import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('dagangi.db');
  }
  return dbPromise;
}

export async function exec(sql: string) {
  const db = await getDb();
  await db.execAsync(sql);
}

export async function run(sql: string, params: SQLite.SQLiteBindParams = []) {
  const db = await getDb();
  return db.runAsync(sql, params);
}

export async function all<T>(sql: string, params: SQLite.SQLiteBindParams = []) {
  const db = await getDb();
  return db.getAllAsync<T>(sql, params);
}

export async function first<T>(sql: string, params: SQLite.SQLiteBindParams = []) {
  const db = await getDb();
  return db.getFirstAsync<T>(sql, params);
}

export async function transaction<T>(work: () => Promise<T>) {
  const db = await getDb();
  let result: T | undefined;
  await db.withTransactionAsync(async () => {
    result = await work();
  });
  return result as T;
}
