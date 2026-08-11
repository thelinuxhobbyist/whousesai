import { getCloudflareContext } from '@opennextjs/cloudflare';
import { Entity, EntityRevision, EntityType, RevisionContent, AITool, EntityReport, SearchFilterParams } from './types';
import { normalizeEntityType, shouldAutoMigrateType } from './entityTypes';

/** Minimal async SQL interface shared by local SQLite and Cloudflare D1. */
interface SqlDb {
  all<T = any>(sql: string, ...params: any[]): Promise<T[]>;
  get<T = any>(sql: string, ...params: any[]): Promise<T | undefined>;
  run(sql: string, ...params: any[]): Promise<{ lastInsertRowid: number; changes: number }>;
  exec(sql: string): Promise<void>;
}

let localDbPromise: Promise<SqlDb> | null = null;

async function getD1Binding(): Promise<D1Database | null> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as Env;
    return env.whousesai_db ?? null;
  } catch {
    return null;
  }
}

function createD1Adapter(d1: D1Database): SqlDb {
  return {
    async all<T = any>(sql: string, ...params: any[]): Promise<T[]> {
      const result = await d1.prepare(sql).bind(...params).all<T>();
      return result.results ?? [];
    },
    async get<T = any>(sql: string, ...params: any[]): Promise<T | undefined> {
      const row = await d1.prepare(sql).bind(...params).first<T>();
      return row ?? undefined;
    },
    async run(sql: string, ...params: any[]) {
      const result = await d1.prepare(sql).bind(...params).run();
      return {
        lastInsertRowid: Number(result.meta.last_row_id ?? 0),
        changes: Number(result.meta.changes ?? 0),
      };
    },
    async exec(sql: string) {
      await d1.exec(sql);
    },
  };
}

function createSqliteAdapter(sqlite: any): SqlDb {
  return {
    async all<T = any>(sql: string, ...params: any[]): Promise<T[]> {
      return sqlite.prepare(sql).all(...params) as T[];
    },
    async get<T = any>(sql: string, ...params: any[]): Promise<T | undefined> {
      return sqlite.prepare(sql).get(...params) as T | undefined;
    },
    async run(sql: string, ...params: any[]) {
      const result = sqlite.prepare(sql).run(...params);
      return {
        lastInsertRowid: Number(result.lastInsertRowid),
        changes: Number(result.changes),
      };
    },
    async exec(sql: string) {
      sqlite.exec(sql);
    },
  };
}

async function createLocalSqliteDb(): Promise<SqlDb> {
  const Database = require('better-sqlite3');
  const path = require('path');
  const fs = require('fs');

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, 'whousesai.sqlite');
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  const db = createSqliteAdapter(sqlite);
  await initTables(db);
  return db;
}

async function getDb(): Promise<SqlDb> {
  const d1 = await getD1Binding();
  if (d1) {
    return createD1Adapter(d1);
  }

  if (!localDbPromise) {
    localDbPromise = createLocalSqliteDb();
  }
  return localDbPromise;
}

async function initTables(db: SqlDb) {
  await db.exec(`
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
  `);

  const countRow = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM entities`);
  if ((countRow?.count ?? 0) === 0) {
    await seedLocalDb(db);
  } else {
    await migrateEntityTypes(db);
  }
}

/** Map legacy type values onto the simplified set. Person rows are left for manual review. */
async function migrateEntityTypes(db: SqlDb) {
  const rows = await db.all<{ id: number; type: string }>(`SELECT id, type FROM entities`);

  for (const row of rows) {
    if (!shouldAutoMigrateType(row.type)) continue;

    const nextType = normalizeEntityType(row.type);
    await db.run(`UPDATE entities SET type = ? WHERE id = ?`, nextType, row.id);

    const revisions = await db.all<{ id: number; content_json: string }>(
      `SELECT id, content_json FROM entity_revisions WHERE entity_id = ?`,
      row.id
    );

    for (const rev of revisions) {
      try {
        const content = JSON.parse(rev.content_json);
        if (content.type === row.type || shouldAutoMigrateType(content.type)) {
          content.type = nextType;
          await db.run(`UPDATE entity_revisions SET content_json = ? WHERE id = ?`, JSON.stringify(content), rev.id);
        }
      } catch {
        // Leave malformed revision JSON untouched
      }
    }
  }
}

const INITIAL_AI_TOOLS: AITool[] = [
  { id: 1, name: 'ChatGPT', slug: 'chatgpt', description: 'Conversational AI, code assistance, and content generation model by OpenAI.', category: 'General Assistant', website: 'https://chatgpt.com' },
  { id: 2, name: 'Microsoft Copilot', slug: 'microsoft-copilot', description: 'Enterprise AI assistant integrated across Microsoft 365, Windows, and GitHub.', category: 'Productivity', website: 'https://copilot.microsoft.com' },
  { id: 3, name: 'Claude', slug: 'claude', description: 'Advanced AI assistant focused on deep reasoning, coding, and analysis by Anthropic.', category: 'General Assistant', website: 'https://claude.ai' },
  { id: 4, name: 'Adobe Firefly', slug: 'adobe-firefly', description: 'Generative AI model family for visual creative content and image editing by Adobe.', category: 'Design & Creative', website: 'https://firefly.adobe.com' },
  { id: 5, name: 'Midjourney', slug: 'midjourney', description: 'Generative AI tool for producing high-quality imagery from natural language prompts.', category: 'Design & Creative', website: 'https://midjourney.com' },
  { id: 6, name: 'GitHub Copilot', slug: 'github-copilot', description: 'AI pair programmer providing inline code completions and developer support.', category: 'Development', website: 'https://github.com/features/copilot' },
  { id: 7, name: 'Siemens Industrial Copilot', slug: 'siemens-industrial-copilot', description: 'AI assistant tailored for industrial manufacturing, PLC programming, and automation.', category: 'Industrial Automation', website: 'https://www.siemens.com' },
  { id: 8, name: 'Brainomix e-Stroke', slug: 'brainomix-estroke', description: 'Medical imaging AI software for rapid stroke diagnosis and decision support.', category: 'Healthcare AI', website: 'https://www.brainomix.com' }
];

async function seedLocalDb(db: SqlDb) {
  for (const tool of INITIAL_AI_TOOLS) {
    await db.run(
      `INSERT INTO ai_tools (id, name, slug, description, category, website) VALUES (?, ?, ?, ?, ?, ?)`,
      tool.id,
      tool.name,
      tool.slug,
      tool.description,
      tool.category,
      tool.website
    );
  }

  const bbcId = await insertEntity(db, {
    name: 'BBC',
    slug: 'bbc',
    type: 'organisation',
    industry: 'Media & Broadcasting',
    country: 'United Kingdom',
    created_at: '2026-08-05T10:00:00Z',
    updated_at: '2026-08-10T14:30:00Z'
  });

  const bbcRev1 = await insertRevision(db, {
    entity_id: bbcId,
    revision_number: 1,
    previous_revision_id: null,
    edit_summary: 'Initial entry created',
    editor_id: 'Anonymous Contributor #1042',
    created_at: '2026-08-05T10:00:00Z',
    content: {
      name: 'BBC',
      type: 'organisation',
      industry: 'Media & Broadcasting',
      country: 'United Kingdom',
      description: 'BBC uses AI in areas such as research and content production documented by publicly available sources.',
      ai_uses: ['Research', 'Content Production'],
      ai_tools: ['ChatGPT'],
      sources: [
        { title: 'BBC Media Centre: AI Principles', url: 'https://www.bbc.co.uk/mediacentre/speeches/2023/ai-principles' }
      ]
    }
  });

  const bbcRev2 = await insertRevision(db, {
    entity_id: bbcId,
    revision_number: 2,
    previous_revision_id: bbcRev1,
    edit_summary: 'Added Microsoft Copilot tools',
    editor_id: 'Anonymous Contributor #3391',
    created_at: '2026-08-08T11:20:00Z',
    content: {
      name: 'BBC',
      type: 'organisation',
      industry: 'Media & Broadcasting',
      country: 'United Kingdom',
      description: 'BBC uses AI in areas such as research, content production and productivity tools across teams.',
      ai_uses: ['Research', 'Content Production', 'Productivity'],
      ai_tools: ['ChatGPT', 'Microsoft Copilot'],
      sources: [
        { title: 'BBC Media Centre: AI Principles', url: 'https://www.bbc.co.uk/mediacentre/speeches/2023/ai-principles' },
        { title: 'BBC Tech Blog: Microsoft Copilot Pilot', url: 'https://www.bbc.co.uk/rd/blog/copilot-enterprise' }
      ]
    }
  });

  const bbcRev3 = await insertRevision(db, {
    entity_id: bbcId,
    revision_number: 3,
    previous_revision_id: bbcRev2,
    edit_summary: 'Added accessibility and translation AI uses with Adobe Firefly',
    editor_id: 'Anonymous Contributor #9021',
    created_at: '2026-08-10T14:30:00Z',
    content: {
      name: 'BBC',
      type: 'organisation',
      industry: 'Media & Broadcasting',
      country: 'United Kingdom',
      description: 'BBC uses AI in areas such as accessibility, research, content production, translation and visual asset workflows documented by publicly available sources.',
      ai_uses: ['Accessibility', 'Research', 'Content Production', 'Translation'],
      ai_tools: ['Microsoft Copilot', 'Adobe Firefly', 'ChatGPT'],
      sources: [
        { title: 'BBC Media Centre: AI Principles', url: 'https://www.bbc.co.uk/mediacentre/speeches/2023/ai-principles' },
        { title: 'BBC R&D: Exploring Generative AI for Accessibility', url: 'https://www.bbc.co.uk/rd/projects/ai-accessibility' },
        { title: 'Adobe & BBC: Creative Cloud AI Integration', url: 'https://news.adobe.com/bbc-firefly-workflows' }
      ]
    }
  });

  await db.run(`UPDATE entities SET current_revision_id = ? WHERE id = ?`, bbcRev3, bbcId);
}

async function insertEntity(db: SqlDb, data: any): Promise<number> {
  const res = await db.run(
    `INSERT INTO entities (name, slug, type, industry, country, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    data.name,
    data.slug,
    data.type,
    data.industry,
    data.country,
    data.created_at,
    data.updated_at
  );
  return res.lastInsertRowid;
}

async function insertRevision(db: SqlDb, data: any): Promise<number> {
  const res = await db.run(
    `INSERT INTO entity_revisions (entity_id, revision_number, previous_revision_id, content_json, edit_summary, editor_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    data.entity_id,
    data.revision_number,
    data.previous_revision_id,
    JSON.stringify(data.content),
    data.edit_summary,
    data.editor_id,
    data.created_at
  );
  return res.lastInsertRowid;
}

// PUBLIC UNIFIED API

export async function getEntities(params: SearchFilterParams = {}): Promise<Entity[]> {
  const db = await getDb();
  let query = `
    SELECT e.*, er.content_json, er.revision_number, er.created_at as rev_created_at, er.edit_summary, er.editor_id, er.previous_revision_id
    FROM entities e
    LEFT JOIN entity_revisions er ON e.current_revision_id = er.id
    WHERE 1=1
  `;
  const sqlParams: any[] = [];

  if (params.type && params.type !== 'all') {
    const raw = String(params.type);
    const resolved =
      raw === 'university' || raw === 'university_research'
        ? 'university_research'
        : raw === 'non-profit'
          ? 'organisation'
          : raw;
    query += ` AND e.type = ?`;
    sqlParams.push(resolved);
  }

  if (params.industry) {
    query += ` AND LOWER(e.industry) LIKE ?`;
    sqlParams.push(`%${params.industry.toLowerCase()}%`);
  }

  if (params.country) {
    query += ` AND LOWER(e.country) LIKE ?`;
    sqlParams.push(`%${params.country.toLowerCase()}%`);
  }

  if (params.query) {
    const q = `%${params.query.toLowerCase()}%`;
    query += ` AND (LOWER(e.name) LIKE ? OR LOWER(e.industry) LIKE ? OR LOWER(e.country) LIKE ? OR LOWER(er.content_json) LIKE ?)`;
    sqlParams.push(q, q, q, q);
  }

  query += ` ORDER BY e.updated_at DESC`;
  const rows = await db.all(query, ...sqlParams);
  let result = rows.map(mapEntityRow);

  if (params.tool) {
    const toolLower = params.tool.toLowerCase();
    result = result.filter((e) => {
      const content = e.current_revision?.content;
      if (!content) return false;
      if (content.claims?.some((c) => c.tool && (c.tool.toLowerCase().includes(toolLower) || slugify(c.tool) === toolLower))) {
        return true;
      }
      return content.ai_tools?.some((t) => t.toLowerCase().includes(toolLower) || slugify(t) === toolLower);
    });
  }

  if (params.useCase) {
    const useCaseLower = params.useCase.toLowerCase();
    result = result.filter((e) => {
      const content = e.current_revision?.content;
      if (!content) return false;
      if (content.claims?.some((c) => c.use.toLowerCase().includes(useCaseLower) || slugify(c.use) === useCaseLower)) {
        return true;
      }
      return content.ai_uses?.some((u) => u.toLowerCase().includes(useCaseLower) || slugify(u) === useCaseLower);
    });
  }

  return result;
}

export async function getEntityBySlug(slug: string): Promise<Entity | null> {
  const db = await getDb();
  const row = await db.get(
    `
    SELECT e.*, er.content_json, er.revision_number, er.created_at as rev_created_at, er.edit_summary, er.editor_id, er.previous_revision_id
    FROM entities e
    LEFT JOIN entity_revisions er ON e.current_revision_id = er.id
    WHERE e.slug = ?
  `,
    slug
  );

  if (!row) return null;
  return mapEntityRow(row);
}

export async function getEntityRevisions(entityId: number): Promise<EntityRevision[]> {
  const db = await getDb();
  const rows = await db.all(
    `
    SELECT * FROM entity_revisions
    WHERE entity_id = ?
    ORDER BY revision_number DESC
  `,
    entityId
  );

  return rows.map(mapRevisionRow);
}

export async function getRevisionById(revisionId: number): Promise<EntityRevision | null> {
  const db = await getDb();
  const row = await db.get(`SELECT * FROM entity_revisions WHERE id = ?`, revisionId);
  if (!row) return null;
  return mapRevisionRow(row);
}

export async function createRevision(
  entityId: number,
  content: RevisionContent,
  editSummary: string,
  editorId: string = 'Anonymous Contributor',
  baseRevisionId?: number
): Promise<{ success: boolean; revision?: EntityRevision; conflict?: boolean; currentEntity?: Entity }> {
  const db = await getDb();
  const entityRow = await db.get<any>(`SELECT * FROM entities WHERE id = ?`, entityId);
  if (!entityRow) throw new Error('Entity not found');

  const currentEntity = await getEntityBySlug(entityRow.slug);
  if (!currentEntity) throw new Error('Entity not found');

  if (baseRevisionId !== undefined && baseRevisionId !== entityRow.current_revision_id) {
    return { success: false, conflict: true, currentEntity };
  }

  const maxRevRow = await db.get<{ max_rev: number | null }>(
    `SELECT MAX(revision_number) as max_rev FROM entity_revisions WHERE entity_id = ?`,
    entityId
  );
  const nextRevNumber = (maxRevRow?.max_rev || 0) + 1;
  const now = new Date().toISOString();

  const revId = await insertRevision(db, {
    entity_id: entityId,
    revision_number: nextRevNumber,
    previous_revision_id: entityRow.current_revision_id,
    edit_summary: editSummary || `Revision ${nextRevNumber} update`,
    editor_id: editorId,
    created_at: now,
    content
  });

  await db.run(
    `
    UPDATE entities 
    SET current_revision_id = ?, name = ?, type = ?, industry = ?, country = ?, updated_at = ?
    WHERE id = ?
  `,
    revId,
    content.name,
    content.type,
    content.industry,
    content.country,
    now,
    entityId
  );

  const newRevision = await getRevisionById(revId);
  if (!newRevision) throw new Error('Failed to load new revision');
  return { success: true, revision: newRevision };
}

export async function createEntity(
  content: RevisionContent,
  editSummary: string = 'Created entry',
  editorId: string = 'Anonymous Contributor'
): Promise<Entity> {
  const db = await getDb();
  const now = new Date().toISOString();
  let baseSlug = slugify(content.name);
  let slug = baseSlug;
  let counter = 1;
  while (await db.get(`SELECT id FROM entities WHERE slug = ?`, slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const entityId = await insertEntity(db, {
    name: content.name,
    slug,
    type: content.type,
    industry: content.industry,
    country: content.country,
    created_at: now,
    updated_at: now
  });

  const revId = await insertRevision(db, {
    entity_id: entityId,
    revision_number: 1,
    previous_revision_id: null,
    edit_summary: editSummary,
    editor_id: editorId,
    created_at: now,
    content
  });

  await db.run(`UPDATE entities SET current_revision_id = ? WHERE id = ?`, revId, entityId);
  const entity = await getEntityBySlug(slug);
  if (!entity) throw new Error('Failed to load created entity');
  return entity;
}

export async function revertToRevision(
  entityId: number,
  targetRevisionId: number,
  editorId: string = 'Anonymous Contributor'
): Promise<EntityRevision> {
  const targetRev = await getRevisionById(targetRevisionId);
  if (!targetRev) throw new Error('Target revision does not exist');

  const summary = `Reverted to Revision ${targetRev.revision_number}`;
  const res = await createRevision(entityId, targetRev.content, summary, editorId);
  if (!res.success || !res.revision) {
    throw new Error('Failed to create revert revision');
  }
  return res.revision;
}

export async function getAITools(): Promise<AITool[]> {
  const db = await getDb();
  return db.all<AITool>(`SELECT * FROM ai_tools ORDER BY name ASC`);
}

export async function getAIToolBySlug(slug: string): Promise<AITool | null> {
  const db = await getDb();
  return (await db.get<AITool>(`SELECT * FROM ai_tools WHERE slug = ?`, slug)) || null;
}

export async function createReport(
  entityId: number,
  revisionId: number,
  reason: EntityReport['reason'],
  details: string
): Promise<EntityReport> {
  const db = await getDb();
  const now = new Date().toISOString();
  const res = await db.run(
    `
    INSERT INTO reports (entity_id, revision_id, reason, details, status, created_at)
    VALUES (?, ?, ?, ?, 'pending', ?)
  `,
    entityId,
    revisionId,
    reason,
    details,
    now
  );

  return {
    id: res.lastInsertRowid,
    entity_id: entityId,
    revision_id: revisionId,
    reason,
    details,
    status: 'pending',
    created_at: now
  };
}

export async function getReports(): Promise<EntityReport[]> {
  const db = await getDb();
  return db.all<EntityReport>(`
    SELECT r.*, e.name as entity_name, e.slug as entity_slug
    FROM reports r
    JOIN entities e ON r.entity_id = e.id
    ORDER BY r.created_at DESC
  `);
}

export async function updateReportStatus(reportId: number, status: 'pending' | 'reviewed' | 'dismissed') {
  const db = await getDb();
  await db.run(`UPDATE reports SET status = ? WHERE id = ?`, status, reportId);
}

// UTILS

function mapEntityRow(row: any): Entity {
  const rawType = String(row.type || 'other');
  const type: EntityType =
    rawType === 'person' ? (rawType as EntityType) : normalizeEntityType(rawType);

  let content: RevisionContent = {
    name: row.name,
    type,
    industry: row.industry,
    country: row.country,
    description: '',
    ai_uses: [],
    ai_tools: [],
    sources: []
  };

  if (row.content_json) {
    try {
      content = JSON.parse(row.content_json);
      const contentType = String(content.type || rawType);
      content.type =
        contentType === 'person' ? (contentType as EntityType) : normalizeEntityType(contentType);
    } catch (e) {
      console.error('Failed to parse content_json', e);
    }
  }

  const current_revision: EntityRevision | undefined = row.current_revision_id
    ? {
        id: row.current_revision_id,
        entity_id: row.id,
        revision_number: row.revision_number || 1,
        previous_revision_id: row.previous_revision_id || null,
        content,
        edit_summary: row.edit_summary || '',
        editor_id: row.editor_id || 'Anonymous Contributor',
        created_at: row.rev_created_at || row.updated_at
      }
    : undefined;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type,
    industry: row.industry,
    country: row.country,
    current_revision_id: row.current_revision_id,
    is_protected: Boolean(row.is_protected),
    created_at: row.created_at,
    updated_at: row.updated_at,
    current_revision
  };
}

function mapRevisionRow(row: any): EntityRevision {
  let content: RevisionContent = {
    name: '',
    type: 'company',
    industry: '',
    country: '',
    description: '',
    ai_uses: [],
    ai_tools: [],
    sources: []
  };

  try {
    content = JSON.parse(row.content_json);
    const contentType = String(content.type || 'company');
    content.type =
      contentType === 'person' ? (contentType as EntityType) : normalizeEntityType(contentType);
  } catch (e) {
    console.error('Failed to parse content_json', e);
  }

  return {
    id: row.id,
    entity_id: row.entity_id,
    revision_number: row.revision_number,
    previous_revision_id: row.previous_revision_id,
    content,
    edit_summary: row.edit_summary,
    editor_id: row.editor_id,
    created_at: row.created_at
  };
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}
