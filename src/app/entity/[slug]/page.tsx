'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReportModal from '@/components/ReportModal';
import ClaimCard from '@/components/ClaimCard';
import { getTypeBadge } from '@/components/EntityCard';
import { Claim, Entity, EntityReport, ReportKind } from '@/lib/types';
import {
  formatLongDate,
  inferEvidenceStatus,
  revisionActorLabel,
} from '@/lib/evidence';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Edit3,
  Flag,
  History,
  Info,
  Share2,
} from 'lucide-react';

export default function EntityDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [entity, setEntity] = useState<Entity | null>(null);
  const [reports, setReports] = useState<EntityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportMode, setReportMode] = useState<ReportKind>('report');
  const [claimTarget, setClaimTarget] = useState<{ index: number; use: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchEntity();
    }
  }, [slug]);

  const fetchEntity = async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await fetch(`/api/entities/${slug}`);
      const data = await res.json();
      if (data.success) {
        setEntity(data.entity);
        if (data.entity?.id) {
          const reportRes = await fetch(`/api/reports?entity_id=${data.entity.id}`);
          const reportData = await reportRes.json();
          if (reportData.success) {
            setReports(reportData.reports);
          }
        }
      } else {
        setEntity(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openClaimAction = (mode: ReportKind, index: number, use: string) => {
    setReportMode(mode);
    setClaimTarget({ index, use });
    setReportModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col">
        <Navbar />
        <div className="max-w-[840px] mx-auto px-6 py-20 w-full space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-white rounded border border-[#E3E5E9]" />
          <div className="h-12 w-3/4 bg-white rounded border border-[#E3E5E9]" />
          <div className="h-40 bg-white rounded border border-[#E3E5E9]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!entity || !entity.current_revision) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col">
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-24 text-center space-y-4">
          <h2 className="serif text-2xl font-semibold">Entity Not Found</h2>
          <p className="text-sm text-[#5B6472]">
            We couldn&apos;t find an entry for &quot;{slug}&quot;. It might have been renamed or moved.
          </p>
          <Link href="/" className="btn btn-forest text-sm">
            <ArrowLeft className="w-4 h-4" /> Return to Directory
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const rev = entity.current_revision;
  const content = rev.content;
  const typeInfo = getTypeBadge(entity.type);
  const TypeIcon = typeInfo.icon;
  const activeReports = reports.filter(
    (report) => report.status !== 'dismissed' && report.revision_id === rev.id
  );

  const claimReports = (index: number, use: string) =>
    activeReports.filter((report) => {
      if (report.claim_index === index) return true;
      if (report.claim_use && report.claim_use === use) return true;
      return false;
    });

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-[840px] mx-auto px-6 py-10 space-y-8 w-full flex-grow">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-[#5B6472] hover:text-[#3F4FBF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>

        <div className="rounded-[6px] bg-white border border-[#E3E5E9] border-l-4 border-l-[#3F4FBF] p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <span className="mono inline-block px-2 py-0.5 rounded bg-[#F8F9FB] border border-[#E3E5E9] font-semibold text-[#3F4FBF] text-[12.5px]">
              Revision #{rev.revision_number} — Current
            </span>
            <p className="text-[13.5px] text-[#1E2A3A]">{rev.edit_summary}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-[#8A93A3]">
              <span>{revisionActorLabel(rev.editor_id, rev.action_type)}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatLongDate(rev.created_at)}
              </span>
            </div>
            {rev.action_type === 'revert' && rev.revert_reason && (
              <p className="text-[12.5px] text-[#5B6472]">
                Reason: {rev.revert_reason}
                {rev.revert_comment ? ` — ${rev.revert_comment}` : ''}
              </p>
            )}
          </div>

          <Link href={`/entity/${slug}/history`} className="btn btn-outline text-sm shrink-0">
            <History className="w-4 h-4 text-[#3F4FBF]" />
            View History
          </Link>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold border ${typeInfo.color}`}>
              <TypeIcon className="w-4 h-4" />
              {typeInfo.label}
            </span>
            <span className="text-[12px] text-[#5B6472] font-medium px-3 py-1 rounded-full bg-white border border-[#E3E5E9]">
              Industry: {entity.industry}
            </span>
            <span className="text-[12px] text-[#5B6472] font-medium px-3 py-1 rounded-full bg-white border border-[#E3E5E9]">
              Region: {entity.country}
            </span>
          </div>

          <h1 className="serif text-4xl sm:text-5xl font-semibold text-[#1E2A3A] tracking-tight">
            Documented AI use at {entity.name}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-y border-[#E3E5E9] py-4">
          <Link href={`/entity/${slug}/edit`} className="btn btn-forest text-sm">
            <Edit3 className="w-4 h-4" />
            Edit Entry
          </Link>

          <Link href={`/entity/${slug}/history`} className="btn btn-outline text-sm">
            <History className="w-4 h-4 text-[#3F4FBF]" />
            Compare versions
          </Link>

          <button onClick={handleShare} className="btn btn-outline text-sm">
            <Share2 className="w-4 h-4 text-[#3F4FBF]" />
            <span>{copied ? 'Copied Link!' : 'Share'}</span>
          </button>

          <button
            onClick={() => {
              setReportMode('report');
              setClaimTarget(null);
              setReportModalOpen(true);
            }}
            className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-[#8A93A3] hover:text-[#A85238] px-3 py-2 rounded transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report Revision</span>
          </button>
        </div>

        <section className="space-y-4 rounded-[6px] bg-white border border-[#E3E5E9] p-6 sm:p-8 shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
          <h2 className="serif text-[22px] font-semibold text-[#1E2A3A] border-b border-[#E3E5E9] pb-3">
            Introduction
          </h2>
          <p className="text-[15px] text-[#1E2A3A] leading-relaxed whitespace-pre-line">
            {content.description}
          </p>
          <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[#8A93A3] pt-2 border-t border-[#E3E5E9]">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#8A93A3]" aria-hidden="true" />
            <span>
              <strong className="font-semibold text-[#5B6472]">
                Claims are based on publicly available evidence and may be challenged or updated.
              </strong>{' '}
              WhoUsesAI does not represent the organisations listed or imply their endorsement.
            </span>
          </p>
        </section>

        <section className="space-y-4">
          <div className="rounded-[6px] bg-white border border-[#E3E5E9] px-6 sm:px-8 py-5 shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#3F4FBF]" />
              <h2 className="serif text-[22px] font-semibold text-[#1E2A3A]">Claims and evidence</h2>
            </div>
            <p className="text-[12.5px] text-[#8A93A3] mt-1.5">
              Each claim shows the use case, the statement, the source, and evidence strength. Challenge a claim if it looks wrong — the original stays in the history.
            </p>
          </div>

          {(content.claims?.length ?? 0) > 0 ? (
            <div className="space-y-4">
              {(content.claims as Claim[]).map((claim, idx) => {
                const status = inferEvidenceStatus(claim.sources, entity.name, claim.evidence_status);
                const related = claimReports(idx, claim.use);
                const challenges = related.filter((item) => item.kind === 'challenge');
                const orgResponses = related.filter((item) => item.kind === 'org_response');

                return (
                  <ClaimCard
                    key={idx}
                    claim={claim}
                    claimIndex={idx}
                    entityName={entity.name}
                    slug={slug}
                    evidenceStatus={status}
                    challenges={challenges}
                    orgResponses={orgResponses}
                    onChallenge={() => openClaimAction('challenge', idx, claim.use)}
                    onOrgResponse={() => openClaimAction('org_response', idx, claim.use)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-[6px] bg-white border border-[#E3E5E9] p-6 text-[13.5px] text-[#5B6472]">
              No documented claims yet.{' '}
              <Link href={`/entity/${slug}/edit`} className="text-[#3F4FBF] font-semibold hover:underline">
                Add claims and evidence
              </Link>
              .
            </div>
          )}
        </section>
      </main>

      <Footer />

      <ReportModal
        key={`${reportMode}-${claimTarget?.index ?? 'page'}`}
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setClaimTarget(null);
        }}
        entityId={entity.id}
        revisionId={rev.id}
        entityName={entity.name}
        mode={reportMode}
        claimIndex={claimTarget?.index}
        claimUse={claimTarget?.use}
        onSubmitted={() => fetchEntity({ silent: true })}
      />
    </div>
  );
}
