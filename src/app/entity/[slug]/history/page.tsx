'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RevisionDiffViewer from '@/components/RevisionDiffViewer';
import RevertModal from '@/components/RevertModal';
import ReportModal from '@/components/ReportModal';
import { Entity, EntityRevision } from '@/lib/types';
import { revisionHistoryLabel } from '@/lib/revisionLabels';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Edit3,
  Eye,
  Flag,
  History,
  RotateCcw,
  UserCheck,
} from 'lucide-react';

export default function EntityHistoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [entity, setEntity] = useState<Entity | null>(null);
  const [revisions, setRevisions] = useState<EntityRevision[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRevA, setSelectedRevA] = useState<EntityRevision | null>(null);
  const [selectedRevB, setSelectedRevB] = useState<EntityRevision | null>(null);

  const [revertTarget, setRevertTarget] = useState<EntityRevision | null>(null);
  const [challengeTarget, setChallengeTarget] = useState<EntityRevision | null>(null);
  const [revertMessage, setRevertMessage] = useState<string | null>(null);

  const revisionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (slug) {
      fetchHistory();
    }
  }, [slug]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/entities/${slug}/revisions`);
      const data = await res.json();
      if (data.success) {
        setEntity(data.entity);
        const revs: EntityRevision[] = data.revisions;
        setRevisions(revs);

        if (revs.length >= 2) {
          setSelectedRevA(revs[1]);
          setSelectedRevB(revs[0]);
        } else if (revs.length === 1) {
          setSelectedRevB(revs[0]);
          setSelectedRevA(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const revisionById = (id: number | null | undefined) =>
    id == null ? undefined : revisions.find((r) => r.id === id);

  const scrollToRevision = (revisionId: number) => {
    const el = revisionRefs.current[revisionId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-[#3F4FBF]');
      window.setTimeout(() => el.classList.remove('ring-2', 'ring-[#3F4FBF]'), 1600);
    }
  };

  const openCompare = (rev: EntityRevision, index: number) => {
    setSelectedRevB(rev);
    if (index < revisions.length - 1) {
      setSelectedRevA(revisions[index + 1]);
    } else {
      setSelectedRevA(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const restoredForTarget = (target: EntityRevision) =>
    revisionById(target.previous_revision_id);

  const optionLabel = (r: EntityRevision) =>
    `Rev #${r.revision_number} — ${revisionHistoryLabel(r, revisionById)} (${new Date(r.created_at).toLocaleDateString()})`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-20 w-full space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-white rounded border border-[#E3E5E9]" />
          <div className="h-40 bg-white rounded border border-[#E3E5E9]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col">
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-24 text-center space-y-4">
          <h2 className="serif text-2xl font-semibold">Entity Not Found</h2>
          <Link href="/" className="btn btn-forest text-sm">
            Return to Directory
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const nextRevisionNumber = (revisions[0]?.revision_number || 0) + 1;
  const revertRestored = revertTarget ? restoredForTarget(revertTarget) : null;

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col font-sans">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full flex-grow">
        <Link
          href={`/entity/${slug}`}
          className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-[#5B6472] hover:text-[#3F4FBF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Entry Page
        </Link>

        <div className="space-y-2">
          <h1 className="serif text-3xl sm:text-4xl font-semibold text-[#1E2A3A] tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-[#3F4FBF]" />
            Revision History: {entity.name}
          </h1>
          <p className="text-[14.5px] text-[#5B6472]">
            Past changes stay visible. You can edit, revert a change, or challenge a claim —
            each action is recorded as a new revision.
          </p>
        </div>

        {revertMessage && (
          <div className="rounded-[6px] bg-[#EEEDFE] border border-[#3F4FBF]/25 p-4 text-[13.5px] text-[#3F4FBF] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{revertMessage}</span>
          </div>
        )}

        {selectedRevB && (
          <div className="rounded-[6px] bg-white border border-[#E3E5E9] p-6 shadow-[0_1px_2px_rgba(30,42,58,0.05)] space-y-6">
            <h2 className="serif text-[22px] font-semibold text-[#1E2A3A] border-b border-[#E3E5E9] pb-3">
              Compare revisions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1 font-sans">
                  Older revision
                </label>
                <select
                  value={selectedRevA?.id || ''}
                  onChange={(e) => {
                    const found = revisions.find((r) => r.id === Number(e.target.value));
                    setSelectedRevA(found || null);
                  }}
                  className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-2 text-xs text-[#1E2A3A] focus:outline-none"
                >
                  <option value="">None (show full revision)</option>
                  {revisions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {optionLabel(r)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1 font-sans">
                  Newer revision
                </label>
                <select
                  value={selectedRevB?.id || ''}
                  onChange={(e) => {
                    const found = revisions.find((r) => r.id === Number(e.target.value));
                    if (found) setSelectedRevB(found);
                  }}
                  className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-2 text-xs text-[#1E2A3A] focus:outline-none"
                >
                  {revisions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {optionLabel(r)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <RevisionDiffViewer oldRevision={selectedRevA} newRevision={selectedRevB} />
          </div>
        )}

        <div className="space-y-4">
          <h2 className="serif text-[22px] font-semibold text-[#1E2A3A]">
            All revisions ({revisions.length})
          </h2>

          <div className="space-y-4">
            {revisions.map((rev, index) => {
              const isCurrent = index === 0;
              const isRevert = rev.action_type === 'revert';
              const reverted = revisionById(rev.reverted_revision_id);
              const restoredFrom =
                revisionById(rev.restored_from_revision_id) ||
                (reverted ? revisionById(reverted.previous_revision_id) : undefined);
              const canRevert = Boolean(rev.previous_revision_id);
              const undoingARevert = isRevert;
              const undoneWasRevert = reverted?.action_type === 'revert';

              return (
                <div
                  key={rev.id}
                  id={`rev-${rev.revision_number}`}
                  ref={(el) => {
                    revisionRefs.current[rev.id] = el;
                  }}
                  className={`rounded-[6px] bg-white border p-5 transition-all shadow-[0_1px_2px_rgba(30,42,58,0.05)] ${
                    isCurrent
                      ? 'border-[#3F4FBF] border-l-4'
                      : isRevert
                        ? 'border-[#A85238]/40 border-l-4 border-l-[#A85238]'
                        : 'border-[#E3E5E9]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="mono text-[12px] font-bold text-[#3F4FBF] bg-[#F8F9FB] border border-[#E3E5E9] px-2.5 py-1 rounded">
                        #{rev.revision_number}
                      </span>
                      {isCurrent && (
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3F4FBF] bg-[#EEEDFE] border border-[#3F4FBF]/25 px-2 py-0.5 rounded-full font-sans">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-[12px] text-[#8A93A3]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#8A93A3]" />
                        {new Date(rev.created_at).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-[#8A93A3]" />
                        {rev.editor_id}
                      </span>
                    </div>
                  </div>

                  {isRevert ? (
                    <div className="space-y-2 mb-3 text-[14px]">
                      <p className="text-[#1E2A3A] font-medium leading-relaxed">
                        {undoneWasRevert ? 'Undid revert ' : 'Reverted '}
                        {reverted ? (
                          <button
                            type="button"
                            onClick={() => scrollToRevision(reverted.id)}
                            className="text-[#A85238] hover:underline font-semibold"
                          >
                            #{reverted.revision_number}
                          </button>
                        ) : (
                          <span>a prior revision</span>
                        )}
                        {restoredFrom ? (
                          <>
                            {' '}
                            → restored state from{' '}
                            <button
                              type="button"
                              onClick={() => scrollToRevision(restoredFrom.id)}
                              className="text-[#3F4FBF] hover:underline font-semibold"
                            >
                              #{restoredFrom.revision_number}
                            </button>
                          </>
                        ) : null}
                      </p>
                      {rev.revert_reason && (
                        <p className="text-[13px] text-[#5B6472]">
                          <span className="font-medium text-[#1E2A3A]">Reason:</span> {rev.revert_reason}
                        </p>
                      )}
                      {rev.revert_comment && (
                        <p className="text-[13px] text-[#5B6472]">
                          <span className="font-medium text-[#1E2A3A]">Comment:</span> {rev.revert_comment}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[14px] text-[#5B6472] mb-3">{rev.edit_summary}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-3 border-t border-[#E3E5E9] text-xs">
                    <button
                      type="button"
                      onClick={() => openCompare(rev, index)}
                      className="inline-flex items-center gap-1 text-[#3F4FBF] hover:underline font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <span className="text-[#E3E5E9]">·</span>
                    <Link
                      href={`/entity/${slug}/edit`}
                      className="inline-flex items-center gap-1 text-[#3F4FBF] hover:underline font-semibold"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    {canRevert && (
                      <>
                        <span className="text-[#E3E5E9]">·</span>
                        <button
                          type="button"
                          onClick={() => setRevertTarget(rev)}
                          className="inline-flex items-center gap-1 text-[#A85238] hover:underline font-semibold"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          {undoingARevert ? 'Undo this revert' : 'Revert this revision'}
                        </button>
                      </>
                    )}
                    <span className="text-[#E3E5E9]">·</span>
                    <button
                      type="button"
                      onClick={() => setChallengeTarget(rev)}
                      className="inline-flex items-center gap-1 text-[#8A93A3] hover:text-[#A85238] hover:underline font-semibold"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      Challenge
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />

      {revertTarget && revertRestored && (
        <RevertModal
          isOpen={Boolean(revertTarget)}
          onClose={() => setRevertTarget(null)}
          slug={slug}
          targetRevision={revertTarget}
          restoredRevision={revertRestored}
          nextRevisionNumber={nextRevisionNumber}
          onSuccess={(newRev) => {
            setRevertMessage(
              `Saved as revision #${newRev.revision_number}. Earlier revisions are still in the history.`
            );
            setRevertTarget(null);
            fetchHistory();
          }}
        />
      )}

      {challengeTarget && entity && (
        <ReportModal
          isOpen={Boolean(challengeTarget)}
          onClose={() => setChallengeTarget(null)}
          entityId={entity.id}
          revisionId={challengeTarget.id}
          entityName={`${entity.name} (#${challengeTarget.revision_number})`}
          mode="challenge"
        />
      )}
    </div>
  );
}
