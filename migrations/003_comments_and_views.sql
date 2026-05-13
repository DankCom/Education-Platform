-- Просмотры уроков (прогресс + статистика)
CREATE TABLE lesson_views (
  id SERIAL PRIMARY KEY,
  lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lesson_id, user_id)
);

-- Комментарии к урокам
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lesson_views_lesson ON lesson_views(lesson_id);
CREATE INDEX idx_lesson_views_user ON lesson_views(user_id);
CREATE INDEX idx_comments_lesson ON comments(lesson_id);
