'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  ExternalLink,
  FileText,
  Flag,
  MessageSquare,
  Tag,
} from 'lucide-react';
import EvidenceStatusBadge from '@/components/EvidenceStatusBadge';
import { Claim, EntityReport, EvidenceStatus } from '@/lib/types';
import { claimStatement, formatLongDate } from '@/lib/evidence';

function toolAnchor(tool: string) {
  return tool.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

interface ClaimCardProps {
  claim: Claim;
  claimIndex: number;
  entityName: string;
  slug: string;
  evidenceStatus: EvidenceStatus;
  challenges: EntityReport[];
  orgResponses: EntityReport[];
  onChallenge: () => void;
  onOrgResponse: () => void;
}

export default function ClaimCard({
  claim,
  claimIndex,
  entityName,
  slug,
  evidenceStatus,
  challenges,
  orgResponses,
  onChallenge,
  onOrgResponse,
}: ClaimCardProps) {
  const [expandedResponseId, setExpandedResponseId] = useState<number | null>(null);
  const isDisputed = challenges.length > 0;

  return (
    <article
      id={`claim-${claimIndex}`}
      className="rounded-[6px] bg-white border border-[#E3E5E9] shadow-[0_1px_2px_rgba(30,42,58,0.05)] overflow-hidden scroll-mt-24"
    >
      {isDisputed && (
        <div className="px-5 sm:px-6 py-3 bg-[#FFF6EB] border-b border-[#E8D4B8] text-[13px] text-[#8A5A12]">
          <p className="font-semibold text-[#1E2A3A]">Disputed claim</p>
          <p className="mt-0.5 text-[#5B6472]">
            This claim has been challenged.{' '}
            <Link href={`/entity/${slug}/history`} className="underline font-medium text-[#8A5A12] hover:text-[#1E2A3A]">
              View the evidence and revision history
            </Link>
            .
          </p>
        </div>
      )}

      <div className="p-5 sm:p-6 space-y-4">
        <h3 className="text-[17px] sm:text-[18px] font-semibold text-[#1E2A3A] leading-snug uppercase tracking-wide">
          {claim.use}
        </h3>

        <div>
          <span className="text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider font-sans">
            Claim
          </span>
          <p className="mt-1 text-[14.5px] text-[#1E2A3A] leading-relaxed">
            {claimStatement(entityName, claim)}
          </p>
        </div>

        {claim.tool && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider font-sans">
              <Tag className="w-3 h-3" /> Tool
            </span>
            <Link
              href={`/tools#tool-${toolAnchor(claim.tool)}`}
              className="mono inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EEEDFE] text-[#3F4FBF] border border-[#3F4FBF]/20 text-[12.5px] font-semibold hover:border-[#3F4FBF] transition-colors"
            >
              {claim.tool}
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>
          </div>
        )}

        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider font-sans">
            <FileText className="w-3.5 h-3.5 text-[#3F4FBF]" /> Evidence
          </span>
          {claim.sources && claim.sources.length > 0 ? (
            <div className="mt-2 space-y-2">
              {claim.sources.map((src, sidx) => (
                <a
                  key={sidx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-3 rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-2 hover:border-[#3F4FBF] transition-colors group"
                >
                  <span className="text-[13.5px] font-medium text-[#3F4FBF] group-hover:underline">
                    {src.title || src.url}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 text-[#8A93A3] mt-0.5 group-hover:text-[#3F4FBF]" />
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[12.5px] text-[#8A93A3] italic">
              No evidence attached to this claim yet.
            </p>
          )}
          <div className="mt-3">
            <EvidenceStatusBadge status={evidenceStatus} />
          </div>
        </div>

        {orgResponses.map((response) => {
          const expanded = expandedResponseId === response.id;
          return (
            <div
              key={response.id}
              className="rounded border border-[#E3E5E9] bg-[#F8F9FB] px-3 py-2.5 text-[13px]"
            >
              <p className="font-semibold text-[#1E2A3A] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#3F4FBF]" />
                Organisation response
              </p>
              <p className="mt-1 text-[#5B6472]">
                {entityName} {responseReasonVerb(response.reason)} on {formatLongDate(response.created_at)}.
              </p>
              <button
                type="button"
                onClick={() => setExpandedResponseId(expanded ? null : response.id)}
                className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#3F4FBF] hover:underline"
              >
                {expanded ? 'Hide response' : 'View response and evidence'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {expanded && (
                <div className="mt-2 pt-2 border-t border-[#E3E5E9] space-y-1.5 text-[#5B6472]">
                  <p>
                    <span className="font-medium text-[#1E2A3A]">Reason:</span> {response.reason}
                  </p>
                  <p className="whitespace-pre-line">{response.details}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-[#E3E5E9] bg-[#F8F9FB] px-5 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onChallenge}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#A85238] hover:underline"
        >
          <Flag className="w-3.5 h-3.5" />
          Challenge this claim
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onOrgResponse}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#5B6472] hover:text-[#3F4FBF]"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Organisation response
        </button>
      </div>
    </article>
  );
}

function responseReasonVerb(reason: string): string {
  if (/disput/i.test(reason)) return 'disputed this claim';
  if (/clarif/i.test(reason)) return 'clarified this claim';
  if (/correct/i.test(reason)) return 'responded to this claim';
  return 'responded to this claim';
}
