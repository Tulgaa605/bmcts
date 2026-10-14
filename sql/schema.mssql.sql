-- NEBO BMCTS — Microsoft SQL Server
-- SSMS: шинэ бааз үүсгээд энэ файлыг ажиллуулна.
-- Нэвтрэх (апп): admin / admin123

IF DB_ID(N'nebo_bmcts') IS NULL
  CREATE DATABASE nebo_bmcts;
GO
USE nebo_bmcts;
GO

IF OBJECT_ID(N'dbo.organizations', N'U') IS NULL
CREATE TABLE dbo.organizations (
  id INT IDENTITY(1,1) PRIMARY KEY,
  register NVARCHAR(50) NOT NULL UNIQUE,
  name NVARCHAR(255) NOT NULL
);

IF OBJECT_ID(N'dbo.users', N'U') IS NULL
CREATE TABLE dbo.users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  org_id INT NOT NULL,
  username NVARCHAR(100) NOT NULL,
  password NVARCHAR(255) NOT NULL,
  full_name NVARCHAR(255) NOT NULL,
  CONSTRAINT uq_users_org UNIQUE (org_id, username),
  CONSTRAINT fk_users_org FOREIGN KEY (org_id) REFERENCES dbo.organizations(id)
);

IF OBJECT_ID(N'dbo.bm_items', N'U') IS NULL
CREATE TABLE dbo.bm_items (
  id INT IDENTITY(1,1) PRIMARY KEY,
  org_id INT NOT NULL,
  code NVARCHAR(50) NOT NULL,
  name NVARCHAR(255) NOT NULL,
  unit NVARCHAR(20) DEFAULT N'ш',
  initial_qty FLOAT DEFAULT 0,
  initial_price FLOAT DEFAULT 0,
  current_qty FLOAT DEFAULT 0,
  created_at DATETIME2 DEFAULT SYSDATETIME(),
  CONSTRAINT uq_bm_items_code UNIQUE (org_id, code),
  CONSTRAINT fk_items_org FOREIGN KEY (org_id) REFERENCES dbo.organizations(id)
);

IF OBJECT_ID(N'dbo.bm_destinations', N'U') IS NULL
CREATE TABLE dbo.bm_destinations (
  id INT IDENTITY(1,1) PRIMARY KEY,
  kind NVARCHAR(20) NOT NULL,
  name NVARCHAR(255) NOT NULL,
  linked_org_id INT NULL,
  CONSTRAINT uq_dest_kind_name UNIQUE (kind, name)
);

IF OBJECT_ID(N'dbo.bm_income', N'U') IS NULL
CREATE TABLE dbo.bm_income (
  id INT IDENTITY(1,1) PRIMARY KEY,
  org_id INT NOT NULL,
  doc_no NVARCHAR(50) NOT NULL,
  doc_date DATE NOT NULL,
  item_id INT NOT NULL,
  qty FLOAT NOT NULL,
  price FLOAT NOT NULL,
  total FLOAT NOT NULL,
  supplier NVARCHAR(255) NULL,
  note NVARCHAR(500) NULL,
  created_by INT NULL,
  created_at DATETIME2 DEFAULT SYSDATETIME(),
  source_org_id INT NULL,
  source_expense_id INT NULL,
  CONSTRAINT fk_income_org FOREIGN KEY (org_id) REFERENCES dbo.organizations(id),
  CONSTRAINT fk_income_item FOREIGN KEY (item_id) REFERENCES dbo.bm_items(id)
);

IF OBJECT_ID(N'dbo.bm_expense', N'U') IS NULL
CREATE TABLE dbo.bm_expense (
  id INT IDENTITY(1,1) PRIMARY KEY,
  org_id INT NOT NULL,
  doc_no NVARCHAR(50) NOT NULL,
  doc_date DATE NOT NULL,
  item_id INT NOT NULL,
  qty FLOAT NOT NULL,
  price FLOAT NOT NULL,
  total FLOAT NOT NULL,
  purpose NVARCHAR(255) NULL,
  note NVARCHAR(500) NULL,
  created_by INT NULL,
  created_at DATETIME2 DEFAULT SYSDATETIME(),
  dest_id INT NULL,
  dest_org_id INT NULL,
  is_return INT DEFAULT 0,
  source_expense_id INT NULL,
  CONSTRAINT fk_expense_org FOREIGN KEY (org_id) REFERENCES dbo.organizations(id),
  CONSTRAINT fk_expense_item FOREIGN KEY (item_id) REFERENCES dbo.bm_items(id)
);

IF OBJECT_ID(N'dbo.bm_sales', N'U') IS NULL
CREATE TABLE dbo.bm_sales (
  id INT IDENTITY(1,1) PRIMARY KEY,
  org_id INT NOT NULL,
  doc_no NVARCHAR(50) NOT NULL,
  doc_date DATE NOT NULL,
  item_id INT NOT NULL,
  qty FLOAT NOT NULL,
  price FLOAT NOT NULL,
  total FLOAT NOT NULL,
  customer NVARCHAR(255) NULL,
  note NVARCHAR(500) NULL,
  created_by INT NULL,
  created_at DATETIME2 DEFAULT SYSDATETIME()
);

IF OBJECT_ID(N'dbo.bm_transfers', N'U') IS NULL
CREATE TABLE dbo.bm_transfers (
  id INT IDENTITY(1,1) PRIMARY KEY,
  org_id INT NOT NULL,
  doc_no NVARCHAR(50) NOT NULL,
  doc_date DATE NOT NULL,
  item_id INT NOT NULL,
  qty FLOAT NOT NULL,
  from_keeper NVARCHAR(255) NOT NULL,
  to_keeper NVARCHAR(255) NOT NULL,
  note NVARCHAR(500) NULL,
  created_by INT NULL,
  created_at DATETIME2 DEFAULT SYSDATETIME()
);

IF OBJECT_ID(N'dbo.bm_inventory', N'U') IS NULL
CREATE TABLE dbo.bm_inventory (
  id INT IDENTITY(1,1) PRIMARY KEY,
  org_id INT NOT NULL,
  doc_no NVARCHAR(50) NOT NULL,
  doc_date DATE NOT NULL,
  item_id INT NOT NULL,
  book_qty FLOAT NOT NULL,
  actual_qty FLOAT NOT NULL,
  diff_qty FLOAT NOT NULL,
  note NVARCHAR(500) NULL,
  created_by INT NULL,
  created_at DATETIME2 DEFAULT SYSDATETIME()
);

IF OBJECT_ID(N'dbo.bm_loading', N'U') IS NULL
CREATE TABLE dbo.bm_loading (
  id INT IDENTITY(1,1) PRIMARY KEY,
  org_id INT NOT NULL,
  doc_no NVARCHAR(50) NOT NULL,
  doc_date DATE NOT NULL,
  item_id INT NOT NULL,
  qty FLOAT NOT NULL,
  type NVARCHAR(10) NOT NULL CHECK (type IN (N'load', N'unload')),
  vehicle NVARCHAR(100) NULL,
  driver NVARCHAR(255) NULL,
  note NVARCHAR(500) NULL,
  created_by INT NULL,
  created_at DATETIME2 DEFAULT SYSDATETIME()
);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.organizations WHERE register = N'1234567')
  INSERT INTO dbo.organizations (register, name) VALUES (N'1234567', N'Тест байгууллага');

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE username = N'admin')
  INSERT INTO dbo.users (org_id, username, password, full_name)
  SELECT id, N'admin', N'$2a$10$7IxhwssDyvQY0glaE1pfPuryHZgXht4cEbqaySVh3eZwBPPkriuoS', N'О.Оюунцэцэг'
  FROM dbo.organizations WHERE register = N'1234567';

MERGE dbo.bm_destinations AS t
USING (VALUES
  (N'duureg', N'Баянзүрх'),
  (N'duureg', N'Сүхбаатар'),
  (N'duureg', N'Чингэлтэй'),
  (N'duureg', N'Хан-Уул'),
  (N'duureg', N'Баянгол'),
  (N'duureg', N'Сонгинохайрхан'),
  (N'duureg', N'Багануур'),
  (N'duureg', N'Налайх'),
  (N'duureg', N'Багахангай'),
  (N'sum', N'Архангай / Цэцэрлэг'),
  (N'sum', N'Баянхонгор / Баянхонгор'),
  (N'sum', N'Булган / Булган'),
  (N'sum', N'Говь-Алтай / Есөнбулаг'),
  (N'sum', N'Дорноговь / Сайншанд'),
  (N'sum', N'Дорнод / Хэрлэн'),
  (N'sum', N'Дундговь / Мандалговь'),
  (N'sum', N'Завхан / Улиастай'),
  (N'sum', N'Өвөрхангай / Арвайхээр'),
  (N'sum', N'Өмнөговь / Даланзадгад'),
  (N'sum', N'Сүхбаатар / Баруун-Урт'),
  (N'sum', N'Сэлэнгэ / Сүхбаатар'),
  (N'sum', N'Төв / Зуунмод'),
  (N'sum', N'Увс / Улаангом'),
  (N'sum', N'Ховд / Жаргалант'),
  (N'sum', N'Хөвсгөл / Мөрөн'),
  (N'sum', N'Хэнтий / Чингис'),
  (N'sum', N'Орхон / Баян-Өндөр'),
  (N'sum', N'Дархан-Уул / Дархан'),
  (N'sum', N'Говьсүмбэр / Сүмбэр')
) AS s(kind, name)
ON t.kind = s.kind AND t.name = s.name
WHEN NOT MATCHED THEN
  INSERT (kind, name, linked_org_id) VALUES (s.kind, s.name, NULL);
GO
