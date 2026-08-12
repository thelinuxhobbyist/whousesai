'use client';

import React, { useState } from 'react';
import { Flag, X, Send } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: number | string;
  revisionId: number | string;
  entityName: string;
  /** When true, copy presents Challenge (flag without changing state). */
  mode?: 'report' | 'challenge';
}

export default function ReportModal({
  isOpen,
  onClose,
  entityId,
  revisionId,
  entityName,
  mode = 'report'
}: ReportModalProps) {
  const [reason, setReason] = useState('Inaccurate information');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isChallenge = mode === 'challenge';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_id: entityId,
          revision_id: revisionId,
          reason,
          details
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit report');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting report.');
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
              {isChallenge ? 'Challenge Submitted' : 'Report Submitted'}
            </h3>
            <p className="text-[13.5px] text-[#5B6472]">
              {isChallenge
                ? 'This revision was flagged for review. The current entry was not changed.'
                : 'Thank you for helping keep WhoUsesAI accurate. Moderation reviews all flagged entries.'}
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
                {isChallenge ? 'Challenge Revision' : 'Report Entry'}: {entityName}
              </h3>
            </div>

            {isChallenge && (
              <p className="text-[12.5px] text-[#5B6472] rounded bg-[#F8F9FB] border border-[#E3E5E9] p-2.5">
                Challenge flags this revision for review. It does not change the current state — use
                Edit or Revert if you want to create a new revision.
              </p>
            )}

            {errorMessage && (
              <div className="text-xs text-[#A85238] bg-[#A85238]/10 border border-[#A85238]/30 p-2.5 rounded">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1 font-sans">
                Reason for {isChallenge ? 'challenge' : 'report'}:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-2 text-xs text-[#1E2A3A] focus:border-[#3F4FBF] focus:outline-none"
              >
                <option value="Inaccurate information">Inaccurate information</option>
                <option value="Unsubstantiated AI use claim">Unsubstantiated AI use claim</option>
                <option value="Vandalism or spam">Vandalism or spam</option>
                <option value="Outdated information">Outdated information</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1 font-sans">
                Additional Details:
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                required
                placeholder={
                  isChallenge
                    ? 'Explain why this revision should be reviewed…'
                    : 'Explain why this revision should be corrected or reviewed...'
                }
                className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] p-3 text-xs text-[#1E2A3A] placeholder:text-[#8A93A3] focus:border-[#3F4FBF] focus:outline-none"
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
                disabled={submitting}
                className="btn btn-forest text-xs font-semibold disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {submitting
                    ? 'Submitting...'
                    : isChallenge
                      ? 'Submit Challenge'
                      : 'Submit Report'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
