'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RevisionDiffViewer from '@/components/RevisionDiffViewer';
import { Entity, EntityRevision } from '@/lib/types';
import Link from 'next/link';
import Fa from '@/components/Fa';
import {
  faClockRotateLeft,
  faArrowLeft,
  faRotateLeft,
  faCalendar,
  faUserCheck,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';

export default function EntityHistoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [entity, setEntity] = useState<Entity | null>(null);
  const [revisions, setRevisions] = useState<EntityRevision[]>([]);
  const [loading, setLoading] = useState(true);

  // Compare diff selections
  const [selectedRevA, setSelectedRevA] = useState<EntityRevision | null>(null);
  const [selectedRevB, setSelectedRevB] = useState<EntityRevision | null>(null);

  // Revert action state
  const [revertingId, setRevertingId] = useState<number | null>(null);
  const [revertMessage, setRevertMessage] = useState<string | null>(null);

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
          setSelectedRevA(revs[1]); // Previous revision
          setSelectedRevB(revs[0]); // Current revision
        } else if (revs.length === 1) {
          setSelectedRevB(revs[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (revisionId: number, revisionNumber: number) => {
    if (!confirm(`Are you sure you want to revert to Revision #${revisionNumber}? This will create a new Revision #${(revisions[0]?.revision_number || 1) + 1}.`)) {
      return;
    }

    setRevertingId(revisionId);
    setRevertMessage(null);

    try {
      const res = await fetch(`/api/entities/${slug}/revert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_revision_id: revisionId,
          editor_id: 'Moderator / Community Revert'
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to revert revision');
      }

      setRevertMessage(`Successfully created Revision #${data.revision.revision_number} reverting back to Revision #${revisionNumber}.`);
      await fetchHistory();
    } catch (err: any) {
      setRevertMessage(err.message || 'Error executing revert action.');
    } finally {
      setRevertingId(null);
    }
  };

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
          <Link href="/" className="btn btn-forest text-sm">Return to Directory</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col font-sans">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full flex-grow">
        <Link
          href={`/entity/${slug}`}
          className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-[#5B6472] hover:text-[#3F4FBF] transition-colors"
        >
          <Fa icon={faArrowLeft} className="w-4 h-4" /> Back to Entry Page
        </Link>

        <div className="space-y-2">
          <h1 className="serif text-3xl sm:text-4xl font-semibold text-[#1E2A3A] tracking-tight flex items-center gap-3">
            <Fa icon={faClockRotateLeft} className="w-8 h-8 text-[#3F4FBF]" />
            Revision History: {entity.name}
          </h1>
          <p className="text-[14.5px] text-[#5B6472]">
            Every edit is stored in an append-only ledger. You can inspect exact word-by-word diffs or revert to any previous revision.
          </p>
        </div>

        {revertMessage && (
          <div className="rounded-[6px] bg-[#EEEDFE] border border-[#3F4FBF]/25 p-4 text-[13.5px] text-[#3F4FBF] flex items-center gap-2">
            <Fa icon={faCircleCheck} className="w-5 h-5 flex-shrink-0" />
            <span>{revertMessage}</span>
          </div>
        )}

        {/* Diff Comparison Section */}
        {selectedRevB && (
          <div className="rounded-[6px] bg-white border border-[#E3E5E9] p-6 shadow-[0_1px_2px_rgba(30,42,58,0.05)] space-y-6">
            <h2 className="serif text-[22px] font-semibold text-[#1E2A3A] border-b border-[#E3E5E9] pb-3">
              Revision Comparison
            </h2>

            {/* Select revision dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1 font-sans">
                  Base Revision (Older):
                </label>
                <select
                  value={selectedRevA?.id || ''}
                  onChange={(e) => {
                    const found = revisions.find((r) => r.id === Number(e.target.value));
                    setSelectedRevA(found || null);
                  }}
                  className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-2 text-xs text-[#1E2A3A] focus:outline-none"
                >
                  <option value="">None (Show full revision)</option>
                  {revisions.map((r) => (
                    <option key={r.id} value={r.id}>
                      Rev #{r.revision_number} — {r.edit_summary} ({new Date(r.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1 font-sans">
                  Target Revision (Newer):
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
                      Rev #{r.revision_number} — {r.edit_summary} ({new Date(r.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visual Word-by-Word Diff component */}
            <RevisionDiffViewer oldRevision={selectedRevA} newRevision={selectedRevB} />
          </div>
        )}

        {/* Timeline Log of All Revisions */}
        <div className="space-y-4">
          <h2 className="serif text-[22px] font-semibold text-[#1E2A3A]">
            Timeline Ledger ({revisions.length} Revisions)
          </h2>

          <div className="space-y-4">
            {revisions.map((rev, index) => {
              const isCurrent = index === 0;
              return (
                <div
                  key={rev.id}
                  className={`rounded-[6px] bg-white border p-5 transition-all shadow-[0_1px_2px_rgba(30,42,58,0.05)] ${
                    isCurrent ? 'border-[#3F4FBF] border-l-4' : 'border-[#E3E5E9]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="mono text-[12px] font-bold text-[#3F4FBF] bg-[#F8F9FB] border border-[#E3E5E9] px-2.5 py-1 rounded">
                        Rev #{rev.revision_number}
                      </span>
                      {isCurrent && (
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3F4FBF] bg-[#EEEDFE] border border-[#3F4FBF]/25 px-2 py-0.5 rounded-full font-sans">
                          Current Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-[12px] text-[#8A93A3]">
                      <span className="flex items-center gap-1">
                        <Fa icon={faCalendar} className="w-3.5 h-3.5 text-[#8A93A3]" />
                        {new Date(rev.created_at).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Fa icon={faUserCheck} className="w-3.5 h-3.5 text-[#8A93A3]" />
                        {rev.editor_id}
                      </span>
                    </div>
                  </div>

                  <p className="text-[14px] text-[#1E2A3A] font-medium mb-3">
                    Summary: <span className="font-normal text-[#5B6472]">{rev.edit_summary}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#E3E5E9] text-xs">
                    <button
                      onClick={() => {
                        setSelectedRevB(rev);
                        if (index < revisions.length - 1) {
                          setSelectedRevA(revisions[index + 1]);
                        } else {
                          setSelectedRevA(null);
                        }
                      }}
                      className="text-[#3F4FBF] hover:underline font-semibold"
                    >
                      Compare against previous
                    </button>

                    {!isCurrent && (
                      <button
                        onClick={() => handleRevert(rev.id, rev.revision_number)}
                        disabled={revertingId === rev.id}
                        className="ml-auto inline-flex items-center gap-1 text-[12px] font-semibold text-[#A85238] hover:underline disabled:opacity-50"
                      >
                        <Fa icon={faRotateLeft} className="w-3.5 h-3.5" />
                        <span>{revertingId === rev.id ? 'Reverting...' : `Revert to Rev #${rev.revision_number}`}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
