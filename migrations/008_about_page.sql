-- Страница "Об Академии" (одна строка, редактируется из админки)
CREATE TABLE site_pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content_md TEXT,
  image_path TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создаём запись по умолчанию
INSERT INTO site_pages (slug, title) VALUES ('about', 'Об Академии');
