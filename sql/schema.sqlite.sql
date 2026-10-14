-- NEBO BMCTS — SQLite бааз
-- Апп: DB_MODE=sqlite, файл: nebo.db
-- Нэвтрэх: admin / admin123

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

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
  UNIQUE(org_id, username),
  FOREIGN KEY (org_id) REFERENCES organizations(id)
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
  UNIQUE(org_id, code),
  FOREIGN KEY (org_id) REFERENCES organizations(id)
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
  created_at TEXT DEFAULT (datetime('now','localtime')),
  source_org_id INTEGER,
  source_expense_id INTEGER,
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (item_id) REFERENCES bm_items(id)
);

CREATE TABLE IF NOT EXISTS bm_destinations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  linked_org_id INTEGER,
  UNIQUE(kind, name)
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
  created_at TEXT DEFAULT (datetime('now','localtime')),
  dest_id INTEGER,
  dest_org_id INTEGER,
  is_return INTEGER DEFAULT 0,
  source_expense_id INTEGER,
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (item_id) REFERENCES bm_items(id)
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

INSERT OR IGNORE INTO organizations (id, register, name) VALUES (1, '1234567', 'Тест байгууллага');

INSERT OR IGNORE INTO users (org_id, username, password, full_name)
VALUES (1, 'admin', '$2a$10$7IxhwssDyvQY0glaE1pfPuryHZgXht4cEbqaySVh3eZwBPPkriuoS', 'О.Оюунцэцэг');

INSERT OR IGNORE INTO bm_destinations (kind, name, linked_org_id) VALUES
('duureg', 'Баянзүрх', NULL),
('duureg', 'Сүхбаатар', NULL),
('duureg', 'Чингэлтэй', NULL),
('duureg', 'Хан-Уул', NULL),
('duureg', 'Баянгол', NULL),
('duureg', 'Сонгинохайрхан', NULL),
('duureg', 'Багануур', NULL),
('duureg', 'Налайх', NULL),
('duureg', 'Багахангай', NULL),
('sum', 'Архангай / Цэцэрлэг', NULL),
('sum', 'Баянхонгор / Баянхонгор', NULL),
('sum', 'Булган / Булган', NULL),
('sum', 'Говь-Алтай / Есөнбулаг', NULL),
('sum', 'Дорноговь / Сайншанд', NULL),
('sum', 'Дорнод / Хэрлэн', NULL),
('sum', 'Дундговь / Мандалговь', NULL),
('sum', 'Завхан / Улиастай', NULL),
('sum', 'Өвөрхангай / Арвайхээр', NULL),
('sum', 'Өмнөговь / Даланзадгад', NULL),
('sum', 'Сүхбаатар / Баруун-Урт', NULL),
('sum', 'Сэлэнгэ / Сүхбаатар', NULL),
('sum', 'Төв / Зуунмод', NULL),
('sum', 'Увс / Улаангом', NULL),
('sum', 'Ховд / Жаргалант', NULL),
('sum', 'Хөвсгөл / Мөрөн', NULL),
('sum', 'Хэнтий / Чингис', NULL),
('sum', 'Орхон / Баян-Өндөр', NULL),
('sum', 'Дархан-Уул / Дархан', NULL),
('sum', 'Говьсүмбэр / Сүмбэр', NULL);
