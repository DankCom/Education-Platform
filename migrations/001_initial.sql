-- Начальная схема БД для Education Platform

-- Пользователи (создаются автоматически при первом входе через Telegram)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT NOT NULL,
  photo_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- Категории курсов (например: n8n, Claude Code и т.д.)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  "order" INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false
);

-- Модули внутри категории
CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false
);

-- Уроки внутри модуля
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  module_id INT REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_path TEXT,       -- путь в MinIO, например: "n8n/module-1/lesson-1.mp4"
  content_md TEXT,       -- markdown-описание урока
  "order" INT DEFAULT 0,
  duration_min INT,
  is_published BOOLEAN DEFAULT false
);

CREATE INDEX idx_modules_category ON modules(category_id);
CREATE INDEX idx_lessons_module ON lessons(module_id);
