import { EntityRevision } from './types';

/**
 * Contributor-facing one-liner for a revision in history lists.
 * Keeps implementation fields (action_type, FKs) out of the UI.
 */
export function revisionHistoryLabel(
  rev: EntityRevision,
  byId: (id: number | null | undefined) => EntityRevision | undefined
): string {
  if (rev.action_type !== 'revert') {
    return rev.edit_summary || 'Updated entry';
  }

  const undone = byId(rev.reverted_revision_id);
  const restored = byId(rev.restored_from_revision_id) ||
    (undone ? byId(undone.previous_revision_id) : undefined);

  const undoneWasRevert = undone?.action_type === 'revert';
  const undoneLabel = undone ? `#${undone.revision_number}` : null;
  const restoredLabel = restored ? `#${restored.revision_number}` : null;

  if (undoneWasRevert && undoneLabel && restoredLabel) {
    return `Undid revert ${undoneLabel} → restored state from ${restoredLabel}`;
  }
  if (undoneLabel && restoredLabel) {
    return `Reverted ${undoneLabel} → restored state from ${restoredLabel}`;
  }
  if (undoneLabel) {
    return undoneWasRevert ? `Undid revert ${undoneLabel}` : `Reverted ${undoneLabel}`;
  }
  return rev.edit_summary || 'Revert';
}

/** Short summary stored on new revert rows (also readable in banners/dropdowns). */
export function buildRevertEditSummary(
  undone: EntityRevision,
  restored: EntityRevision
): string {
  if (undone.action_type === 'revert') {
    return `Undid revert #${undone.revision_number} → restored state from #${restored.revision_number}`;
  }
  return `Reverted #${undone.revision_number} → restored state from #${restored.revision_number}`;
}
