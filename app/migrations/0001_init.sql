-- BlogWien schema (additive only).
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'wien-leben',
  author_name TEXT NOT NULL DEFAULT 'Redaktion BlogWien',
  author_email TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  website_url TEXT NOT NULL DEFAULT '',
  backlink INTEGER NOT NULL DEFAULT 0,
  premium INTEGER NOT NULL DEFAULT 0,
  is_news INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  cover_image TEXT NOT NULL DEFAULT '',
  views INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status, published_at);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  post_id INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 2900,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'open',
  provider TEXT NOT NULL DEFAULT 'demo',
  customer_email TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
