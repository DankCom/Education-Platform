CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_md TEXT,
  file_path TEXT NOT NULL,
  "order" INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skills_published ON skills(is_published, "order");
