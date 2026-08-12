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

/** How a revision was produced. Challenge flags a revision without creating one. */
export type RevisionActionType = 'create' | 'edit' | 'revert';

/** Short reasons offered when creating a revert revision. */
export type RevertReason =
  | 'Incorrect information'
  | 'Unsupported claim'
  | "Source doesn't support the claim"
  | 'Duplicate/unnecessary change'
  | 'Other';

export const REVERT_REASONS: RevertReason[] = [
  'Incorrect information',
  'Unsupported claim',
  "Source doesn't support the claim",
  'Duplicate/unnecessary change',
  'Other'
];

export interface EntityRevision {
  id: number;
  entity_id: number;
  revision_number: number;
  previous_revision_id: number | null;
  content: RevisionContent;
  edit_summary: string;
  editor_id: string; // e.g. "Anonymous Contributor #4a91" or "Verified Admin"
  created_at: string;
  /** Discriminator for create / edit / revert. Older rows default to edit (or create for #1). */
  action_type: RevisionActionType;
  /** When action_type is revert: the revision that was undone (not deleted). */
  reverted_revision_id: number | null;
  /**
   * When action_type is revert: the revision whose content was copied into this
   * revision as the restored state (typically the predecessor of the undone revision).
   */
  restored_from_revision_id: number | null;
  /** When action_type is revert: selected short reason. */
  revert_reason: RevertReason | string | null;
  /** When action_type is revert: optional free-text comment. */
  revert_comment: string | null;
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
