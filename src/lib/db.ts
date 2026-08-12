import { getCloudflareContext } from '@opennextjs/cloudflare';
import {
  Entity,
  EntityRevision,
  EntityType,
  RevisionContent,
  AITool,
  EntityReport,
  SearchFilterParams,
  RevisionActionType,
  RevertReason
} from './types';
import { normalizeEntityType, shouldAutoMigrateType } from './entityTypes';
import { buildRevertEditSummary } from './revisionLabels';

export interface CreateRevisionOptions {
  editSummary: string;
  editorId?: string;
  baseRevisionId?: number;
  actionType?: RevisionActionType;
  revertedRevisionId?: number | null;
  restoredFromRevisionId?: number | null;
  revertReason?: RevertReason | string | null;
  revertComment?: string | null;
}

export interface RevertRevisionOptions {
  editorId?: string;
  reason?: RevertReason | string;
  comment?: string;
}

/** Minimal async SQL interface shared by local SQLite and Cloudflare D1. */
interface SqlDb {
  all<T = any>(sql: string, ...params: any[]): Promise<T[]>;
  get<T = any>(sql: string, ...params: any[]): Promise<T | undefined>;
  run(sql: string, ...params: any[]): Promise<{ lastInsertRowid: number; changes: number }>;
  exec(sql: string): Promise<void>;
}

let localDbPromise: Promise<SqlDb> | null = null;
let d1ReadyPromise: Promise<SqlDb> | null = null;

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
    if (!d1ReadyPromise) {
      d1ReadyPromise = (async () => {
        const adapter = createD1Adapter(d1);
        await ensureRevisionActionColumns(adapter);
        return adapter;
      })();
    }
    return d1ReadyPromise;
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
  `);

  await ensureRevisionActionColumns(db);

  const countRow = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM entities`);
  if ((countRow?.count ?? 0) === 0) {
    await seedLocalDb(db);
  } else {
    await migrateEntityTypes(db);
  }
}

/** Add append-only revert metadata columns on existing local/D1 databases. */
async function ensureRevisionActionColumns(db: SqlDb) {
  try {
    const cols = await db.all<{ name: string }>(`PRAGMA table_info(entity_revisions)`);
    const names = new Set(cols.map((c) => c.name));

    if (!names.has('action_type')) {
      await db.run(`ALTER TABLE entity_revisions ADD COLUMN action_type TEXT NOT NULL DEFAULT 'edit'`);
    }
    if (!names.has('reverted_revision_id')) {
      await db.run(`ALTER TABLE entity_revisions ADD COLUMN reverted_revision_id INTEGER`);
    }
    if (!names.has('restored_from_revision_id')) {
      await db.run(`ALTER TABLE entity_revisions ADD COLUMN restored_from_revision_id INTEGER`);
    }
    if (!names.has('revert_reason')) {
      await db.run(`ALTER TABLE entity_revisions ADD COLUMN revert_reason TEXT`);
    }
    if (!names.has('revert_comment')) {
      await db.run(`ALTER TABLE entity_revisions ADD COLUMN revert_comment TEXT`);
    }
  } catch (err) {
    console.error('ensureRevisionActionColumns failed', err);
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

async function insertRevision(db: SqlDb, data: {
  entity_id: number;
  revision_number: number;
  previous_revision_id: number | null;
  content: RevisionContent;
  edit_summary: string;
  editor_id: string;
  created_at: string;
  action_type?: RevisionActionType;
  reverted_revision_id?: number | null;
  restored_from_revision_id?: number | null;
  revert_reason?: string | null;
  revert_comment?: string | null;
}): Promise<number> {
  const res = await db.run(
    `INSERT INTO entity_revisions (
      entity_id, revision_number, previous_revision_id, content_json,
      edit_summary, editor_id, created_at,
      action_type, reverted_revision_id, restored_from_revision_id, revert_reason, revert_comment
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.entity_id,
    data.revision_number,
    data.previous_revision_id,
    JSON.stringify(data.content),
    data.edit_summary,
    data.editor_id,
    data.created_at,
    data.action_type ?? (data.revision_number === 1 ? 'create' : 'edit'),
    data.reverted_revision_id ?? null,
    data.restored_from_revision_id ?? null,
    data.revert_reason ?? null,
    data.revert_comment ?? null
  );
  return res.lastInsertRowid;
}

// PUBLIC UNIFIED API

export async function getEntities(params: SearchFilterParams = {}): Promise<Entity[]> {
  const db = await getDb();
  let query = `
    SELECT e.*, er.content_json, er.revision_number, er.created_at as rev_created_at, er.edit_summary, er.editor_id, er.previous_revision_id,
           er.action_type, er.reverted_revision_id, er.restored_from_revision_id, er.revert_reason, er.revert_comment
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
    SELECT e.*, er.content_json, er.revision_number, er.created_at as rev_created_at, er.edit_summary, er.editor_id, er.previous_revision_id,
           er.action_type, er.reverted_revision_id, er.restored_from_revision_id, er.revert_reason, er.revert_comment
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
  editSummaryOrOptions: string | CreateRevisionOptions,
  editorIdArg: string = 'Anonymous Contributor',
  baseRevisionIdArg?: number
): Promise<{ success: boolean; revision?: EntityRevision; conflict?: boolean; currentEntity?: Entity }> {
  const options: CreateRevisionOptions =
    typeof editSummaryOrOptions === 'string'
      ? {
          editSummary: editSummaryOrOptions,
          editorId: editorIdArg,
          baseRevisionId: baseRevisionIdArg
        }
      : editSummaryOrOptions;

  const {
    editSummary,
    editorId = 'Anonymous Contributor',
    baseRevisionId,
    actionType = 'edit',
    revertedRevisionId = null,
    restoredFromRevisionId = null,
    revertReason = null,
    revertComment = null
  } = options;

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
    content,
    action_type: actionType,
    reverted_revision_id: revertedRevisionId,
    restored_from_revision_id: restoredFromRevisionId,
    revert_reason: revertReason,
    revert_comment: revertComment
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
    content,
    action_type: 'create'
  });

  await db.run(`UPDATE entities SET current_revision_id = ? WHERE id = ?`, revId, entityId);
  const entity = await getEntityBySlug(slug);
  if (!entity) throw new Error('Failed to load created entity');
  return entity;
}

/**
 * Append-only undo of a specific revision.
 *
 * - `reverted_revision_id` always points at the revision being undone.
 * - The new row's `content` is the restored/resulting state (copied from the
 *   predecessor of the undone revision, recorded as `restored_from_revision_id`).
 * - Nothing in existing history is mutated.
 */
export async function revertToRevision(
  entityId: number,
  targetRevisionId: number,
  options: RevertRevisionOptions | string = { reason: 'Other' }
): Promise<EntityRevision> {
  const opts: RevertRevisionOptions =
    typeof options === 'string'
      ? { editorId: options, reason: 'Other' }
      : options;

  const editorId = opts.editorId || 'Anonymous Contributor';
  const reason = opts.reason || 'Other';
  const comment = opts.comment?.trim() || null;

  const targetRev = await getRevisionById(targetRevisionId);
  if (!targetRev) throw new Error('Target revision does not exist');
  if (targetRev.entity_id !== entityId) {
    throw new Error('Target revision does not belong to this entity');
  }
  if (!targetRev.previous_revision_id) {
    throw new Error('Cannot revert the first revision — there is no prior state to restore');
  }

  // Restored state = content that was current before the undone revision was applied
  const restoredRev = await getRevisionById(targetRev.previous_revision_id);
  if (!restoredRev) {
    throw new Error('Previous revision to restore could not be found');
  }

  const summary = buildRevertEditSummary(targetRev, restoredRev);

  const res = await createRevision(entityId, restoredRev.content, {
    editSummary: summary,
    editorId,
    actionType: 'revert',
    // Always the specific revision being undone — never the restored-from revision
    revertedRevisionId: targetRev.id,
    restoredFromRevisionId: restoredRev.id,
    revertReason: reason,
    revertComment: comment
  });

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
        created_at: row.rev_created_at || row.updated_at,
        action_type: resolveActionType(row),
        reverted_revision_id: row.reverted_revision_id ?? null,
        restored_from_revision_id: row.restored_from_revision_id ?? null,
        revert_reason: row.revert_reason ?? null,
        revert_comment: row.revert_comment ?? null
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

function resolveActionType(row: any): RevisionActionType {
  const raw = row.action_type as RevisionActionType | null | undefined;
  if (raw === 'create' || raw === 'edit' || raw === 'revert') {
    // Legacy rows may still be default 'edit' for revision #1 or old revert summaries
    if (raw === 'edit' && Number(row.revision_number) === 1) return 'create';
    if (
      raw === 'edit' &&
      typeof row.edit_summary === 'string' &&
      (/^Reverted to Revision \d+$/.test(row.edit_summary) ||
        /^Reverted Revision #\d+$/.test(row.edit_summary) ||
        /^Reverted #\d+/.test(row.edit_summary) ||
        /^Undid revert/.test(row.edit_summary))
    ) {
      return 'revert';
    }
    return raw;
  }
  if (Number(row.revision_number) === 1) return 'create';
  if (
    typeof row.edit_summary === 'string' &&
    (/^Reverted to Revision \d+$/.test(row.edit_summary) ||
      /^Reverted Revision #\d+$/.test(row.edit_summary) ||
      /^Reverted #\d+/.test(row.edit_summary) ||
      /^Undid revert/.test(row.edit_summary))
  ) {
    return 'revert';
  }
  return 'edit';
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
    created_at: row.created_at,
    action_type: resolveActionType(row),
    reverted_revision_id: row.reverted_revision_id ?? null,
    restored_from_revision_id: row.restored_from_revision_id ?? null,
    revert_reason: row.revert_reason ?? null,
    revert_comment: row.revert_comment ?? null
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
