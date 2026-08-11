'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReportModal from '@/components/ReportModal';
import { getTypeBadge } from '@/components/EntityCard';
import { Entity } from '@/lib/types';
import Link from 'next/link';
import {
  Edit3,
  History,
  Flag,
  ExternalLink,
  Layers,
  CheckCircle2,
  Share2,
  Calendar,
  UserCheck,
  ArrowLeft,
  BookOpen
} from 'lucide-react';

export default function EntityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchEntity();
    }
  }, [slug]);

  const fetchEntity = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/entities/${slug}`);
      const data = await res.json();
      if (data.success) {
        setEntity(data.entity);
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
            We couldn't find an entry for "{slug}". It might have been renamed or moved.
          </p>
          <Link
            href="/"
            className="btn btn-forest text-sm"
          >
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

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-[840px] mx-auto px-6 py-10 space-y-8 w-full flex-grow">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-[#5B6472] hover:text-[#3F4FBF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>

        {/* Revision Header Banner */}
        <div className="rounded-[6px] bg-white border border-[#E3E5E9] border-l-4 border-l-[#3F4FBF] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[12.5px]">
          <div className="flex items-center gap-2 text-[#1E2A3A]">
            <span className="mono px-2 py-0.5 rounded bg-[#F8F9FB] border border-[#E3E5E9] font-semibold text-[#3F4FBF]">
              Revision #{rev.revision_number} — Current
            </span>
            <span className="text-[#5B6472]">Summary: {rev.edit_summary}</span>
          </div>

          <div className="flex items-center gap-4 text-[#8A93A3]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(rev.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              {rev.editor_id}
            </span>
          </div>
        </div>

        {/* Title & Entity Meta */}
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
            {entity.name}
          </h1>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 border-y border-[#E3E5E9] py-4">
          <Link
            href={`/entity/${slug}/edit`}
            className="btn btn-forest text-sm"
          >
            <Edit3 className="w-4 h-4" />
            <span>[ Edit Entry ]</span>
          </Link>

          <Link
            href={`/entity/${slug}/history`}
            className="btn btn-outline text-sm"
          >
            <History className="w-4 h-4 text-[#3F4FBF]" />
            <span>[ View History ]</span>
          </Link>

          <button
            onClick={handleShare}
            className="btn btn-outline text-sm"
          >
            <Share2 className="w-4 h-4 text-[#3F4FBF]" />
            <span>{copied ? 'Copied Link!' : 'Share'}</span>
          </button>

          <button
            onClick={() => setReportModalOpen(true)}
            className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-[#8A93A3] hover:text-[#A85238] px-3 py-2 rounded transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report Revision</span>
          </button>
        </div>

        {/* Section: Overview / How [Entity] Uses AI */}
        <section className="space-y-4 rounded-[6px] bg-white border border-[#E3E5E9] p-6 sm:p-8 shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
          <h2 className="serif text-[22px] font-semibold text-[#1E2A3A] border-b border-[#E3E5E9] pb-3">
            How {entity.name} uses AI
          </h2>
          <p className="text-[15px] text-[#1E2A3A] leading-relaxed whitespace-pre-line">
            {content.description}
          </p>
        </section>

        {/* Section: AI Uses (Structured Applications) */}
        {content.ai_uses && content.ai_uses.length > 0 && (
          <section className="space-y-4 rounded-[6px] bg-white border border-[#E3E5E9] p-6 sm:p-8 shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
            <h2 className="serif text-[22px] font-semibold text-[#1E2A3A] flex items-center gap-2 border-b border-[#E3E5E9] pb-3">
              <CheckCircle2 className="w-5 h-5 text-[#3F4FBF]" />
              AI Applications & Use Cases
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {content.ai_uses.map((use, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded bg-[#F8F9FB] border border-[#E3E5E9] text-[13.5px] font-medium text-[#1E2A3A]"
                >
                  <span className="flex h-2 w-2 rounded-full bg-[#3F4FBF]" />
                  {use}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: AI Tools Deployed */}
        {content.ai_tools && content.ai_tools.length > 0 && (
          <section className="space-y-4 rounded-[6px] bg-white border border-[#E3E5E9] p-6 sm:p-8 shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
            <h2 className="serif text-[22px] font-semibold text-[#1E2A3A] flex items-center gap-2 border-b border-[#E3E5E9] pb-3">
              <Layers className="w-5 h-5 text-[#3F4FBF]" />
              AI Tools Deployed
            </h2>
            <div className="flex flex-wrap gap-3">
              {content.ai_tools.map((tool, idx) => (
                <Link
                  key={idx}
                  href={`/explore?tool=${encodeURIComponent(tool)}`}
                  className="mono flex items-center gap-2 px-3.5 py-1.5 rounded bg-[#EEEDFE] text-[#3F4FBF] border border-[#E3E5E9] font-semibold text-[13px] hover:border-[#3F4FBF] transition-all"
                >
                  <span>{tool}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Section: Evidence Sources */}
        <section className="space-y-4 rounded-[6px] bg-white border border-[#E3E5E9] p-6 sm:p-8 shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
          <h2 className="serif text-[22px] font-semibold text-[#1E2A3A] flex items-center gap-2 border-b border-[#E3E5E9] pb-3">
            <BookOpen className="w-5 h-5 text-[#3F4FBF]" />
            Sources & Evidence
          </h2>
          <p className="text-[12.5px] text-[#8A93A3]">
            WhoUsesAI encourages evidence-based contributions. All claims are supported by public references.
          </p>

          {content.sources && content.sources.length > 0 ? (
            <div className="space-y-3 pt-2">
              {content.sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start justify-between p-4 rounded bg-[#F8F9FB] hover:bg-[#E3E5E9]/60 border border-[#E3E5E9] transition-colors gap-4"
                >
                  <div className="space-y-1 overflow-hidden">
                    <span className="text-[14px] font-semibold text-[#1E2A3A] group-hover:text-[#3F4FBF] transition-colors block truncate">
                      {src.title || src.url}
                    </span>
                    <span className="mono text-[11.5px] text-[#8A93A3] block truncate">
                      {src.url}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#8A93A3] group-hover:text-[#3F4FBF] flex-shrink-0" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-[13.5px] text-[#8A93A3] italic">No external sources attached to this entry yet.</p>
          )}
        </section>
      </main>

      <Footer />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        entityId={entity.id}
        revisionId={rev.id}
        entityName={entity.name}
      />
    </div>
  );
}
