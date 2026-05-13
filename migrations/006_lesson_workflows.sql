-- Таблица для хранения нескольких workflow JSON файлов на урок
CREATE TABLE lesson_workflows (
  id SERIAL PRIMARY KEY,
  lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  json_path TEXT NOT NULL,
  "order" INT DEFAULT 0
);

-- Мигрируем существующие workflow_path из lessons в новую таблицу
INSERT INTO lesson_workflows (lesson_id, title, json_path, "order")
SELECT id, title, workflow_path, 0
FROM lessons
WHERE workflow_path IS NOT NULL;

-- Удаляем старый столбец
ALTER TABLE lessons DROP COLUMN IF EXISTS workflow_path;
