'use client';

import React, { useState } from 'react';
import {
  Flag,
  Send,
  X,
} from 'lucide-react';
import { ReportKind } from '@/lib/types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: number | string;
  revisionId: number | string;
  entityName: string;
  mode?: ReportKind;
  claimIndex?: number | null;
  claimUse?: string | null;
  onSubmitted?: () => void;
}

export default function ReportModal({
  isOpen,
  onClose,
  entityId,
  revisionId,
  entityName,
  mode = 'report',
  claimIndex,
  claimUse,
  onSubmitted,
}: ReportModalProps) {
  const [reason, setReason] = useState(defaultReason(mode));
  const [details, setDetails] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const evidenceNote = evidenceUrl.trim()
      ? `\n\nSupporting source: ${evidenceUrl.trim()}`
      : '';

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_id: entityId,
          revision_id: revisionId,
          reason,
          details: details + evidenceNote,
          kind: mode,
          claim_index: claimIndex ?? null,
          claim_use: claimUse || null,
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit');
      }

      setSubmitted(true);
      onSubmitted?.();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="max-w-md w-full rounded-[8px] bg-white border border-[#E3E5E9] p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#8A93A3] hover:text-[#1E2A3A]"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EEEDFE] text-[#3F4FBF] flex items-center justify-center mx-auto border border-[#3F4FBF]/25">
              <Flag className="w-6 h-6" />
            </div>
            <h3 className="serif text-[20px] font-semibold text-[#1E2A3A]">
              {successTitle(mode)}
            </h3>
            <p className="text-[13.5px] text-[#5B6472]">
              {successBody(mode)}
            </p>
            <button onClick={onClose} className="btn btn-forest text-xs mt-4">
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-[#A85238]">
              <Flag className="w-5 h-5" />
              <h3 className="serif text-[20px] font-semibold text-[#1E2A3A]">
                {formTitle(mode)}: {entityName}
              </h3>
            </div>

            {claimUse && (
              <p className="text-[12.5px] text-[#5B6472] rounded bg-[#F8F9FB] border border-[#E3E5E9] p-2.5">
                About claim: <strong className="text-[#1E2A3A]">{claimUse}</strong>
              </p>
            )}

            {mode === 'challenge' && (
              <p className="text-[12.5px] text-[#5B6472] rounded bg-[#F8F9FB] border border-[#E3E5E9] p-2.5">
                Submit evidence if this claim is inaccurate, outdated or incomplete. The current entry stays visible, and your challenge is recorded for review.
              </p>
            )}

            {mode === 'org_response' && (
              <p className="text-[12.5px] text-[#5B6472] rounded bg-[#F8F9FB] border border-[#E3E5E9] p-2.5">
                This is recorded as a response from the organisation. It becomes part of the public history and does not silently replace the original claim.
              </p>
            )}

            {errorMessage && (
              <div className="text-xs text-[#A85238] bg-[#A85238]/10 border border-[#A85238]/30 p-2.5 rounded">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1 font-sans">
                Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-2 text-xs text-[#1E2A3A] focus:border-[#3F4FBF] focus:outline-none"
              >
                {reasonsFor(mode).map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1 font-sans">
                {mode === 'org_response' ? 'Organisation statement' : 'Evidence and explanation'}
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                required
                placeholder={placeholderFor(mode)}
                className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] p-3 text-xs text-[#1E2A3A] placeholder:text-[#8A93A3] focus:border-[#3F4FBF] focus:outline-none"
              />
            </div>

            {mode !== 'report' && (
              <div>
                <label className="block text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1 font-sans">
                  Supporting source URL (optional)
                </label>
                <input
                  type="url"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-2 text-xs text-[#1E2A3A] placeholder:text-[#8A93A3] focus:border-[#3F4FBF] focus:outline-none"
                />
              </div>
            )}

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
                disabled={submitting}
                className="btn btn-forest text-xs font-semibold disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : submitLabel(mode)}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function defaultReason(mode: ReportKind) {
  if (mode === 'org_response') return 'Organisation disputes this claim';
  if (mode === 'challenge') return 'Inaccurate';
  return 'Inaccurate information';
}

function reasonsFor(mode: ReportKind) {
  if (mode === 'org_response') {
    return [
      'Organisation disputes this claim',
      'Organisation clarification',
      'Organisation correction',
    ];
  }
  if (mode === 'challenge') {
    return [
      'Inaccurate',
      'Outdated',
      'Misleading or incomplete',
      'About the wrong organisation',
      'Not supported by the cited evidence',
      'Other',
    ];
  }
  return [
    'Inaccurate information',
    'Unsubstantiated AI use claim',
    'Vandalism or spam',
    'Outdated information',
    'Other',
  ];
}

function formTitle(mode: ReportKind) {
  if (mode === 'org_response') return 'Organisation response';
  if (mode === 'challenge') return 'Challenge this claim';
  return 'Report revision';
}

function submitLabel(mode: ReportKind) {
  if (mode === 'org_response') return 'Submit response';
  if (mode === 'challenge') return 'Submit challenge';
  return 'Submit report';
}

function successTitle(mode: ReportKind) {
  if (mode === 'org_response') return 'Response recorded';
  if (mode === 'challenge') return 'Challenge submitted';
  return 'Report submitted';
}

function successBody(mode: ReportKind) {
  if (mode === 'org_response') {
    return 'The organisation response is now part of the public record. The original claim remains visible.';
  }
  if (mode === 'challenge') {
    return 'This claim was flagged for review. The current entry was not changed, and the history remains inspectable.';
  }
  return 'Thank you for helping keep WhoUsesAI accurate. Moderation reviews all flagged entries.';
}

function placeholderFor(mode: ReportKind) {
  if (mode === 'org_response') {
    return 'Explain the organisation\'s position and link any supporting evidence…';
  }
  if (mode === 'challenge') {
    return 'Explain why this claim is inaccurate, outdated or incomplete, and include evidence where you can…';
  }
  return 'Explain why this revision should be corrected or reviewed...';
}
