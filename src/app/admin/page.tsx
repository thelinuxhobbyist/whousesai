'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Fa from '@/components/Fa';
import {
  faShieldHalved,
  faClockRotateLeft,
  faFlag,
  faArrowUpRightFromSquare,
  faCalendar,
  faUserCheck,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { getEntityTypeLabel } from '@/lib/entityTypes';

interface AuditItem {
  revision_id: string;
  revision_number: number;
  entity_id: string;
  entity_slug: string;
  entity_name: string;
  entity_type: string;
  edit_summary: string;
  editor_id: string;
  created_at: string;
}

interface ReportItem {
  id: string;
  entity_id: string;
  revision_id: string;
  entity_slug?: string;
  reason: string;
  details: string;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'edits' | 'reports'>('edits');
  const [audits, setAudits] = useState<AuditItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch recent revisions
      const auditRes = await fetch('/api/entities');
      const auditData = await auditRes.json();
      if (auditData.success) {
        const items: AuditItem[] = auditData.entities.map((e: any) => ({
          revision_id: e.current_revision?.id || '',
          revision_number: e.current_revision?.revision_number || 1,
          entity_id: e.id,
          entity_slug: e.slug,
          entity_name: e.name,
          entity_type: e.type,
          edit_summary: e.current_revision?.edit_summary || 'Entry created/updated',
          editor_id: e.current_revision?.editor_id || 'Anonymous',
          created_at: e.updated_at || e.created_at
        }));
        setAudits(items);
      }

      // Fetch reports
      const reportRes = await fetch('/api/reports');
      const reportData = await reportRes.json();
      if (reportData.success) {
        setReports(reportData.reports);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-[1180px] mx-auto px-6 py-10 space-y-8 w-full flex-grow">
        {/* Header */}
        <div className="space-y-2 border-b border-[#E3E5E9] pb-6">
          <h1 className="serif text-3xl sm:text-4xl font-semibold text-[#1E2A3A] tracking-tight flex items-center gap-3">
            <Fa icon={faShieldHalved} className="w-8 h-8 text-[#3F4FBF]" />
            Moderation &amp; Audit Stream
          </h1>
          <p className="text-[14.5px] text-[#5B6472]">
            Transparent community moderation log tracking all live revisions, edits, and reported content.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#E3E5E9] gap-2">
          <button
            onClick={() => setActiveTab('edits')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-[1px] flex items-center gap-2 transition-all ${
              activeTab === 'edits'
                ? 'text-[#1E2A3A] border-b-[#3F4FBF]'
                : 'text-[#5B6472] border-b-transparent hover:text-[#1E2A3A]'
            }`}
          >
            <Fa icon={faClockRotateLeft} className="w-4 h-4 text-[#3F4FBF]" />
            Recent Revisions Stream ({audits.length})
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-[1px] flex items-center gap-2 transition-all ${
              activeTab === 'reports'
                ? 'text-[#1E2A3A] border-b-[#3F4FBF]'
                : 'text-[#5B6472] border-b-transparent hover:text-[#1E2A3A]'
            }`}
          >
            <Fa icon={faFlag} className="w-4 h-4 text-[#A85238]" />
            Reported Content Flags ({reports.length})
          </button>
        </div>

        {/* Content Stream */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded bg-white border border-[#E3E5E9] animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'edits' ? (
          <div className="space-y-4">
            {audits.map((item) => (
              <div
                key={item.revision_id || item.entity_id}
                className="rounded-[6px] bg-white border border-[#E3E5E9] p-5 shadow-[0_1px_2px_rgba(30,42,58,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="serif text-[17px] font-semibold text-[#1E2A3A]">
                      {item.entity_name}
                    </span>
                    <span className="mono text-[11px] text-[#3F4FBF] bg-[#F8F9FB] border border-[#E3E5E9] px-2 py-0.5 rounded font-semibold">
                      Rev #{item.revision_number}
                    </span>
                    <span className="text-[11.5px] text-[#8A93A3]">{getEntityTypeLabel(item.entity_type)}</span>
                  </div>

                  <p className="text-[13.5px] text-[#5B6472]">
                    Summary: <span className="text-[#1E2A3A] font-medium">{item.edit_summary}</span>
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2 text-xs text-[#8A93A3]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Fa icon={faCalendar} className="w-3.5 h-3.5" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Fa icon={faUserCheck} className="w-3.5 h-3.5" />
                      {item.editor_id}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/entity/${item.entity_slug}/history`}
                      className="px-3 py-1 rounded bg-[#F8F9FB] hover:bg-[#E3E5E9] text-[12px] font-semibold text-[#3F4FBF] border border-[#E3E5E9] flex items-center gap-1 transition-colors"
                    >
                      History <Fa icon={faArrowUpRightFromSquare} className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {reports.length > 0 ? (
              reports.map((rep) => (
                <div
                  key={rep.id}
                  className="rounded-[6px] bg-white border border-[#A85238]/30 border-l-4 border-l-[#A85238] p-5 shadow-[0_1px_2px_rgba(30,42,58,0.05)] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#A85238] uppercase tracking-wider font-sans">
                      Reason: {rep.reason}
                    </span>
                    <span className="mono text-xs text-[#8A93A3]">
                      {new Date(rep.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[13.5px] text-[#1E2A3A] bg-[#F8F9FB] p-3 rounded border border-[#E3E5E9]">
                    {rep.details}
                  </p>

                  <div className="flex items-center justify-between text-xs text-[#8A93A3] pt-1">
                    <span>Status: {rep.status}</span>
                    {rep.entity_slug && (
                      <Link
                        href={`/entity/${rep.entity_slug}`}
                        className="text-[#3F4FBF] hover:underline font-semibold"
                      >
                        View Entity Page &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="border border-dashed border-[#E3E5E9] rounded-[8px] p-16 text-center bg-white">
                <Fa icon={faCircleCheck} className="w-8 h-8 text-[#3F4FBF] mx-auto mb-3" />
                <h3 className="serif text-[18px] font-semibold text-[#1E2A3A]">No content flags submitted</h3>
                <p className="text-[13.5px] text-[#5B6472] mt-1">
                  Community content flags will be logged here for moderation review.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
