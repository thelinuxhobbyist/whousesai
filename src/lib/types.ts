export type EntityType =
  | 'company'
  | 'organisation'
  | 'government'
  | 'university_research'
  | 'other';

export interface SourceItem {
  url: string;
  title: string;
}

/**
 * A single evidenced AI claim: one use case + optional tool + optional note,
 * each with its own attached sources.
 */
export interface Claim {
  use: string;          // e.g. "Customer Service Automation"
  tool?: string;        // e.g. "TOBi AI" (optional)
  note?: string;        // one-sentence description of what this does
  sources: SourceItem[];
}

export interface RevisionContent {
  name: string;
  type: EntityType;
  industry: string;
  country: string;
  description: string;
  /** Structured, evidenced claims — the primary data model going forward */
  claims?: Claim[];
  /**
   * Legacy flat arrays kept for backwards-compatibility with old revisions.
   * Readers should prefer `claims` when present.
   */
  ai_uses: string[];
  ai_tools: string[];
  sources: SourceItem[];
}

export interface EntityRevision {
  id: number;
  entity_id: number;
  revision_number: number;
  previous_revision_id: number | null;
  content: RevisionContent;
  edit_summary: string;
  editor_id: string; // e.g. "Anonymous Contributor #4a91" or "Verified Admin"
  created_at: string;
}

export interface Entity {
  id: number;
  slug: string;
  name: string;
  type: EntityType;
  industry: string;
  country: string;
  current_revision_id: number;
  is_protected?: boolean;
  created_at: string;
  updated_at: string;
  current_revision?: EntityRevision;
}

export interface AITool {
  id: number;
  name: string;
  slug: string;
  description: string;
  category?: string;
  website?: string;
}

export interface EntityReport {
  id: number;
  entity_id: number;
  revision_id: number;
  reason: 'incorrect' | 'spam' | 'defamation' | 'copyright' | 'malicious' | 'other';
  details: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
  entity_name?: string;
  entity_slug?: string;
}

export interface SearchFilterParams {
  query?: string;
  type?: EntityType | 'all';
  industry?: string;
  tool?: string;
  useCase?: string;
  country?: string;
}
