-- Новости / оповещения
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content_md TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Отслеживание прочитанных новостей
CREATE TABLE news_reads (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  news_id INT REFERENCES news(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, news_id)
);
