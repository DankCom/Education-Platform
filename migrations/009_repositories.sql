CREATE TABLE repositories (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_md TEXT,
  github_url TEXT NOT NULL,
  "order" INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_repositories_published ON repositories(is_published, "order");
