'use client';

import React from 'react';
import Link from 'next/link';
import { Entity, Claim, RevisionContent } from '@/lib/types';
import { getEntityTypeLabel } from '@/lib/entityTypes';
import Fa from '@/components/Fa';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBuilding,
  faUsers,
  faLandmark,
  faGraduationCap,
  faLayerGroup,
  faClockRotateLeft,
  faArrowRight,
  faCircleQuestion,
  faFileLines,
} from '@fortawesome/free-solid-svg-icons';

interface EntityCardProps {
  entity: Entity;
}

export function getTypeBadge(type: string): { label: string; icon: IconDefinition; color: string } {
  switch (type) {
    case 'company':
      return { label: 'Company', icon: faBuilding, color: 'bg-[#EEEDFE] text-[#3F4FBF] border-[#3F4FBF]/25' };
    case 'organisation':
    case 'non-profit':
      return { label: 'Organisation', icon: faUsers, color: 'bg-[#EEEDFE] text-[#3F4FBF] border-[#3F4FBF]/25' };
    case 'government':
      return { label: 'Government', icon: faLandmark, color: 'bg-[#EEEDFE] text-[#3F4FBF] border-[#3F4FBF]/25' };
    case 'university_research':
    case 'university':
      return { label: 'University & Research', icon: faGraduationCap, color: 'bg-[#EEEDFE] text-[#3F4FBF] border-[#3F4FBF]/25' };
    case 'other':
      return { label: 'Other', icon: faCircleQuestion, color: 'bg-[#F8F9FB] text-[#5B6472] border-[#E3E5E9]' };
    case 'person':
      return { label: 'Person', icon: faUsers, color: 'bg-[#F8F9FB] text-[#5B6472] border-[#E3E5E9]' };
    default:
      return { label: getEntityTypeLabel(type), icon: faBuilding, color: 'bg-[#F8F9FB] text-[#5B6472] border-[#E3E5E9]' };
  }
}

/** Prefer claims; fall back to legacy flat arrays for older revisions. */
function getCardMeta(content?: RevisionContent) {
  if (!content) {
    return { uses: [] as string[], tools: [] as string[], sourceCount: 0 };
  }

  const claims = content.claims;
  if (claims && claims.length > 0) {
    const uses = claims.map((c: Claim) => c.use).filter(Boolean);
    const tools = [...new Set(claims.map((c: Claim) => c.tool).filter((t): t is string => Boolean(t)))];
    const sourceCount = claims.reduce(
      (sum, c) => sum + (c.sources?.filter((s) => s.url?.trim()).length || 0),
      0
    );
    return { uses, tools, sourceCount };
  }

  return {
    uses: content.ai_uses || [],
    tools: content.ai_tools || [],
    sourceCount: content.sources?.filter((s) => s.url?.trim()).length || 0,
  };
}

export default function EntityCard({ entity }: EntityCardProps) {
  const rev = entity.current_revision;
  const content = rev?.content;
  const typeInfo = getTypeBadge(entity.type);
  const { uses, tools, sourceCount } = getCardMeta(content);

  const visibleTools = tools.slice(0, 4);
  const extraTools = tools.length - visibleTools.length;
  const visibleUses = uses.slice(0, 4);
  const extraUses = uses.length - visibleUses.length;

  return (
    <div className="group relative flex flex-col rounded-[6px] bg-white border border-[#E3E5E9] p-6 hover:border-[#3F4FBF] transition-all duration-200 shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
      {/* Top: category + revision */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold border ${typeInfo.color}`}>
          <Fa icon={typeInfo.icon} className="w-3.5 h-3.5" />
          {typeInfo.label}
        </span>
        {rev && (
          <span className="flex items-center gap-1 text-[11px] mono text-[#3F4FBF] bg-[#F8F9FB] border border-[#E3E5E9] px-2 py-0.5 rounded">
            <Fa icon={faClockRotateLeft} className="w-3 h-3" /> Rev #{rev.revision_number}
          </span>
        )}
      </div>

      {/* Name */}
      <Link href={`/entity/${entity.slug}`} className="block group-hover:text-[#3F4FBF] transition-colors">
        <h3 className="serif text-[20px] font-semibold text-[#1E2A3A] leading-tight flex items-center justify-between gap-2">
          <span>{entity.name}</span>
          <Fa icon={faArrowRight} className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#3F4FBF] shrink-0" />
        </h3>
      </Link>

      {/* Industry · Region */}
      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[12.5px] text-[#8A93A3]">
        <span>{entity.industry}</span>
        <span>•</span>
        <span>{entity.country}</span>
      </div>

      {/* AI Tools */}
      {visibleTools.length > 0 && (
        <div className="mt-4">
          <span className="text-[11px] font-semibold text-[#3F4FBF] uppercase tracking-wider mb-1.5 flex items-center gap-1 font-sans">
            <Fa icon={faLayerGroup} className="w-3 h-3" /> AI Tools
          </span>
          <div className="flex flex-wrap gap-1.5">
            {visibleTools.map((tool) => (
              <span
                key={tool}
                className="mono px-2.5 py-0.5 text-[11.5px] rounded bg-[#EEEDFE] text-[#3F4FBF] border border-[#E3E5E9] font-medium"
              >
                {tool}
              </span>
            ))}
            {extraTools > 0 && (
              <span className="px-2.5 py-0.5 text-[11.5px] rounded bg-[#F8F9FB] text-[#8A93A3] border border-[#E3E5E9]">
                +{extraTools} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Use Cases */}
      {visibleUses.length > 0 && (
        <div className="mt-3">
          <span className="text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider block mb-1.5 font-sans">
            Use Cases
          </span>
          <div className="flex flex-wrap gap-1.5">
            {visibleUses.map((use) => (
              <span
                key={use}
                className="px-2.5 py-0.5 text-[12px] rounded bg-[#F8F9FB] text-[#1E2A3A] border border-[#E3E5E9]"
              >
                {use}
              </span>
            ))}
            {extraUses > 0 && (
              <span className="px-2.5 py-0.5 text-[11.5px] rounded bg-[#F8F9FB] text-[#8A93A3] border border-[#E3E5E9]">
                +{extraUses} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 mt-6 border-t border-[#E3E5E9] flex items-center justify-between text-[12.5px] text-[#8A93A3]">
        <span className="inline-flex items-center gap-1.5 font-medium text-[#5B6472]">
          <Fa icon={faFileLines} className="w-3.5 h-3.5 text-[#3F4FBF]" />
          {sourceCount} {sourceCount === 1 ? 'Source' : 'Sources'}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/entity/${entity.slug}/history`}
            className="hover:text-[#3F4FBF] transition-colors"
          >
            History
          </Link>
          <span>•</span>
          <Link
            href={`/entity/${entity.slug}/edit`}
            className="text-[#3F4FBF] hover:underline font-semibold"
          >
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}
