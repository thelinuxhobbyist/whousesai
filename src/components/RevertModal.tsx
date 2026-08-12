'use client';

import React, { useEffect, useState } from 'react';
import { RotateCcw, X, AlertCircle } from 'lucide-react';
import { EntityRevision, REVERT_REASONS, RevertReason, RevisionContent } from '@/lib/types';

interface RevertModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  targetRevision: EntityRevision;
  restoredRevision: EntityRevision;
  nextRevisionNumber: number;
  onSuccess: (newRevision: EntityRevision) => void;
}

function contentPreview(content: RevisionContent): string {
  const claims =
    content.claims
      ?.map((c) => [c.use, c.tool].filter(Boolean).join(' · '))
      .filter(Boolean)
      .slice(0, 3) || [];
  if (claims.length > 0) return claims.join('; ');
  if (content.ai_uses?.length) return content.ai_uses.slice(0, 3).join('; ');
  return content.description?.slice(0, 160) || 'No description';
}

export default function RevertModal({
  isOpen,
  onClose,
  slug,
  targetRevision,
  restoredRevision,
  nextRevisionNumber,
  onSuccess
}: RevertModalProps) {
  const undoingARevert = targetRevision.action_type === 'revert';
  const [reason, setReason] = useState<RevertReason>('Incorrect information');
  const [comment, setComment] = useState('');
  const [editorId, setEditorId] = useState('Anonymous Contributor');
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('Incorrect information');
      setComment('');
      setAcknowledged(false);
      setErrorMessage(null);
      setSubmitting(false);
    }
  }, [isOpen, targetRevision.id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (undoingARevert && !acknowledged) {
      setErrorMessage('Please confirm before continuing.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/entities/${slug}/revert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_revision_id: targetRevision.id,
          editor_id: editorId.trim() || 'Anonymous Contributor',
          reason,
          comment: comment.trim() || undefined
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create revert revision');
      }

      onSuccess(data.revision as EntityRevision);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="max-w-lg w-full rounded-[8px] bg-white border border-[#E3E5E9] p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#8A93A3] hover:text-[#1E2A3A]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 pr-8">
          <RotateCcw className="w-5 h-5 text-[#A85238]" />
          <h3 className="serif text-[20px] font-semibold text-[#1E2A3A]">
            {undoingARevert
              ? `Undo revert #${targetRevision.revision_number}`
              : `Revert #${targetRevision.revision_number}`}
          </h3>
        </div>

        <div className="rounded-[6px] bg-[#F8F9FB] border border-[#E3E5E9] p-3.5 space-y-2 text-[13px] text-[#5B6472]">
          <p className="flex items-start gap-2 text-[#1E2A3A]">
            <AlertCircle className="w-4 h-4 mt-0.5 text-[#A85238] flex-shrink-0" />
            <span>
              This creates a <strong>new</strong> revision #{nextRevisionNumber}. The old one stays
              in the history — nothing is deleted.
            </span>
          </p>

          {undoingARevert && (
            <p className="text-[12.5px] text-[#A85238]">
              #{targetRevision.revision_number} was itself a revert. Undoing it will bring back the
              state from before that revert.
            </p>
          )}

          <p>
            {undoingARevert ? 'Undoing' : 'Reverting'}{' '}
            <strong className="text-[#1E2A3A]">#{targetRevision.revision_number}</strong>
            {' → '}
            restored state from{' '}
            <strong className="text-[#1E2A3A]">#{restoredRevision.revision_number}</strong>
          </p>
          <p className="text-[12.5px] border-t border-[#E3E5E9] pt-2">
            <span className="font-medium text-[#1E2A3A]">Preview:</span>{' '}
            {contentPreview(restoredRevision.content)}
          </p>
        </div>

        {errorMessage && (
          <div className="text-xs text-[#A85238] bg-[#A85238]/10 border border-[#A85238]/30 p-2.5 rounded">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {undoingARevert && (
            <label className="flex items-start gap-2.5 text-[12.5px] text-[#1E2A3A] cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5"
                required
              />
              <span>
                I understand this undoes a revert and keeps #{targetRevision.revision_number} in the
                history.
              </span>
            </label>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1 font-sans">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as RevertReason)}
              required
              className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-2 text-xs text-[#1E2A3A] focus:border-[#3F4FBF] focus:outline-none"
            >
              {REVERT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1 font-sans">
              Comment <span className="normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="e.g. The cited source refers to ChatGPT, not Claude."
              className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] p-3 text-xs text-[#1E2A3A] placeholder:text-[#8A93A3] focus:border-[#3F4FBF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1 font-sans">
              Your name / alias
            </label>
            <input
              type="text"
              value={editorId}
              onChange={(e) => setEditorId(e.target.value)}
              className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-2 text-xs text-[#1E2A3A] focus:border-[#3F4FBF] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#5B6472] hover:text-[#1E2A3A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (undoingARevert && !acknowledged)}
              className="btn btn-forest text-xs font-semibold disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving…' : `Save as revision #${nextRevisionNumber}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
