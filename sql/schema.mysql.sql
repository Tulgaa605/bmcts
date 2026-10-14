-- NEBO BMCTS — MySQL 8
-- phpMyAdmin / MySQL Workbench: энэ файлыг бүхлээр нь ажиллуулна.
-- Нэвтрэх (апп): admin / admin123

CREATE DATABASE IF NOT EXISTS nebo_bmcts
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nebo_bmcts;

CREATE TABLE IF NOT EXISTS organizations (
  id INT NOT NULL AUTO_INCREMENT,
  register VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_org_register (register)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  org_id INT NOT NULL,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_org (org_id, username),
  CONSTRAINT fk_users_org FOREIGN KEY (org_id) REFERENCES organizations (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bm_items (
  id INT NOT NULL AUTO_INCREMENT,
  org_id INT NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(20) DEFAULT 'ш',
  initial_qty DOUBLE DEFAULT 0,
  initial_price DOUBLE DEFAULT 0,
  current_qty DOUBLE DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bm_items_code (org_id, code),
  CONSTRAINT fk_items_org FOREIGN KEY (org_id) REFERENCES organizations (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bm_destinations (
  id INT NOT NULL AUTO_INCREMENT,
  kind VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  linked_org_id INT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dest_kind_name (kind, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bm_income (
  id INT NOT NULL AUTO_INCREMENT,
  org_id INT NOT NULL,
  doc_no VARCHAR(50) NOT NULL,
  doc_date DATE NOT NULL,
  item_id INT NOT NULL,
  qty DOUBLE NOT NULL,
  price DOUBLE NOT NULL,
  total DOUBLE NOT NULL,
  supplier VARCHAR(255) NULL,
  note VARCHAR(500) NULL,
  created_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  source_org_id INT NULL,
  source_expense_id INT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_income_org FOREIGN KEY (org_id) REFERENCES organizations (id),
  CONSTRAINT fk_income_item FOREIGN KEY (item_id) REFERENCES bm_items (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bm_expense (
  id INT NOT NULL AUTO_INCREMENT,
  org_id INT NOT NULL,
  doc_no VARCHAR(50) NOT NULL,
  doc_date DATE NOT NULL,
  item_id INT NOT NULL,
  qty DOUBLE NOT NULL,
  price DOUBLE NOT NULL,
  total DOUBLE NOT NULL,
  purpose VARCHAR(255) NULL,
  note VARCHAR(500) NULL,
  created_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  dest_id INT NULL,
  dest_org_id INT NULL,
  is_return TINYINT NOT NULL DEFAULT 0,
  source_expense_id INT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_expense_org FOREIGN KEY (org_id) REFERENCES organizations (id),
  CONSTRAINT fk_expense_item FOREIGN KEY (item_id) REFERENCES bm_items (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bm_sales (
  id INT NOT NULL AUTO_INCREMENT,
  org_id INT NOT NULL,
  doc_no VARCHAR(50) NOT NULL,
  doc_date DATE NOT NULL,
  item_id INT NOT NULL,
  qty DOUBLE NOT NULL,
  price DOUBLE NOT NULL,
  total DOUBLE NOT NULL,
  customer VARCHAR(255) NULL,
  note VARCHAR(500) NULL,
  created_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bm_transfers (
  id INT NOT NULL AUTO_INCREMENT,
  org_id INT NOT NULL,
  doc_no VARCHAR(50) NOT NULL,
  doc_date DATE NOT NULL,
  item_id INT NOT NULL,
  qty DOUBLE NOT NULL,
  from_keeper VARCHAR(255) NOT NULL,
  to_keeper VARCHAR(255) NOT NULL,
  note VARCHAR(500) NULL,
  created_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bm_inventory (
  id INT NOT NULL AUTO_INCREMENT,
  org_id INT NOT NULL,
  doc_no VARCHAR(50) NOT NULL,
  doc_date DATE NOT NULL,
  item_id INT NOT NULL,
  book_qty DOUBLE NOT NULL,
  actual_qty DOUBLE NOT NULL,
  diff_qty DOUBLE NOT NULL,
  note VARCHAR(500) NULL,
  created_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bm_loading (
  id INT NOT NULL AUTO_INCREMENT,
  org_id INT NOT NULL,
  doc_no VARCHAR(50) NOT NULL,
  doc_date DATE NOT NULL,
  item_id INT NOT NULL,
  qty DOUBLE NOT NULL,
  `type` VARCHAR(10) NOT NULL,
  vehicle VARCHAR(100) NULL,
  driver VARCHAR(255) NULL,
  note VARCHAR(500) NULL,
  created_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT chk_loading_type CHECK (`type` IN ('load', 'unload'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO organizations (id, register, name) VALUES (1, '1234567', 'Тест байгууллага');

INSERT IGNORE INTO users (org_id, username, password, full_name)
VALUES (1, 'admin', '$2a$10$7IxhwssDyvQY0glaE1pfPuryHZgXht4cEbqaySVh3eZwBPPkriuoS', 'О.Оюунцэцэг');

INSERT IGNORE INTO bm_destinations (kind, name, linked_org_id) VALUES
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
