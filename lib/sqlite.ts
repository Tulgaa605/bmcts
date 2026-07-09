import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'nebo.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    register TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    UNIQUE(org_id, username)
  );
  CREATE TABLE IF NOT EXISTS bm_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    unit TEXT DEFAULT 'ш',
    initial_qty REAL DEFAULT 0,
    initial_price REAL DEFAULT 0,
    current_qty REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    UNIQUE(org_id, code)
  );
  CREATE TABLE IF NOT EXISTS bm_income (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    doc_no TEXT NOT NULL,
    doc_date TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    qty REAL NOT NULL,
    price REAL NOT NULL,
    total REAL NOT NULL,
    supplier TEXT,
    note TEXT,
    created_by INTEGER,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
  CREATE TABLE IF NOT EXISTS bm_expense (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    doc_no TEXT NOT NULL,
    doc_date TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    qty REAL NOT NULL,
    price REAL NOT NULL,
    total REAL NOT NULL,
    purpose TEXT,
    note TEXT,
    created_by INTEGER,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
  CREATE TABLE IF NOT EXISTS bm_sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    doc_no TEXT NOT NULL,
    doc_date TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    qty REAL NOT NULL,
    price REAL NOT NULL,
    total REAL NOT NULL,
    customer TEXT,
    note TEXT,
    created_by INTEGER,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
  CREATE TABLE IF NOT EXISTS bm_transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    doc_no TEXT NOT NULL,
    doc_date TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    qty REAL NOT NULL,
    from_keeper TEXT NOT NULL,
    to_keeper TEXT NOT NULL,
    note TEXT,
    created_by INTEGER,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
  CREATE TABLE IF NOT EXISTS bm_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    doc_no TEXT NOT NULL,
    doc_date TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    book_qty REAL NOT NULL,
    actual_qty REAL NOT NULL,
    diff_qty REAL NOT NULL,
    note TEXT,
    created_by INTEGER,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
  CREATE TABLE IF NOT EXISTS bm_loading (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER NOT NULL,
    doc_no TEXT NOT NULL,
    doc_date TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    qty REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('load','unload')),
    vehicle TEXT,
    driver TEXT,
    note TEXT,
    created_by INTEGER,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
`);

function seedData() {
  const orgCount = db.prepare('SELECT COUNT(*) as c FROM organizations').get() as { c: number };
  if (orgCount.c > 0) return;
  const orgResult = db.prepare('INSERT INTO organizations (register, name) VALUES (?, ?)').run('1234567', 'Тест байгууллага');
  const orgId = orgResult.lastInsertRowid;
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (org_id, username, password, full_name) VALUES (?, ?, ?, ?)').run(orgId, 'admin', hash, 'О.Оюунцэцэг');
  const items = [
    ['BM001', 'Цаас A4', 'багц', 100, 8500],
    ['BM002', 'Үзэг хар', 'ш', 500, 500],
    ['BM003', 'Бохирын цаас', 'ш', 50, 12000],
    ['BM004', 'Бэх', 'ш', 30, 25000],
    ['BM005', 'Файл', 'ш', 200, 1500],
  ];
  const insertItem = db.prepare('INSERT INTO bm_items (org_id, code, name, unit, initial_qty, initial_price, current_qty) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const [code, name, unit, qty, price] of items) {
    insertItem.run(orgId, code, name, unit, qty, price, qty);
  }
}
seedData();

export function sqliteGet<T>(sql: string, params: unknown[] = []): T | undefined {
  return db.prepare(sql).get(...params) as T | undefined;
}

export function sqliteQuery<T>(sql: string, params: unknown[] = []): T[] {
  return db.prepare(sql).all(...params) as T[];
}

export function sqliteRun(sql: string, params: unknown[] = []): void {
  db.prepare(sql).run(...params);
}

export function sqliteExec(sql: string): void {
  db.exec(sql);
}

export { db as sqliteDb };
