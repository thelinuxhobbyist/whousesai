CREATE TABLE IF NOT EXISTS entities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  industry TEXT NOT NULL,
  country TEXT NOT NULL,
  current_revision_id INTEGER,
  is_protected INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entity_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id INTEGER NOT NULL,
  revision_number INTEGER NOT NULL,
  previous_revision_id INTEGER,
  content_json TEXT NOT NULL,
  edit_summary TEXT NOT NULL,
  editor_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  -- Append-only action metadata (create / edit / revert). Existing rows stay immutable.
  action_type TEXT NOT NULL DEFAULT 'edit',
  reverted_revision_id INTEGER,
  restored_from_revision_id INTEGER,
  revert_reason TEXT,
  revert_comment TEXT,
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_tools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  website TEXT
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id INTEGER NOT NULL,
  revision_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL,
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);
