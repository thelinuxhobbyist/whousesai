'use client';

import React from 'react';
import Link from 'next/link';
import { Entity } from '@/lib/types';
import { getEntityTypeLabel } from '@/lib/entityTypes';
import { Building2, Users, Landmark, GraduationCap, Layers, History, ArrowRight, HelpCircle } from 'lucide-react';

interface EntityCardProps {
  entity: Entity;
}

export function getTypeBadge(type: string) {
  switch (type) {
    case 'company':
      return { label: 'Company', icon: Building2, color: 'bg-[#EEEDFE] text-[#3F4FBF] border-[#3F4FBF]/25' };
    case 'organisation':
    case 'non-profit':
      return { label: 'Organisation', icon: Users, color: 'bg-[#EEEDFE] text-[#3F4FBF] border-[#3F4FBF]/25' };
    case 'government':
      return { label: 'Government', icon: Landmark, color: 'bg-[#EEEDFE] text-[#3F4FBF] border-[#3F4FBF]/25' };
    case 'university_research':
    case 'university':
      return { label: 'University & Research', icon: GraduationCap, color: 'bg-[#EEEDFE] text-[#3F4FBF] border-[#3F4FBF]/25' };
    case 'other':
      return { label: 'Other', icon: HelpCircle, color: 'bg-[#F8F9FB] text-[#5B6472] border-[#E3E5E9]' };
    case 'person':
      return { label: 'Person', icon: Users, color: 'bg-[#F8F9FB] text-[#5B6472] border-[#E3E5E9]' };
    default:
      return { label: getEntityTypeLabel(type), icon: Building2, color: 'bg-[#F8F9FB] text-[#5B6472] border-[#E3E5E9]' };
  }
}

export default function EntityCard({ entity }: EntityCardProps) {
  const rev = entity.current_revision;
  const content = rev?.content;
  const typeInfo = getTypeBadge(entity.type);
  const TypeIcon = typeInfo.icon;

  return (
    <div className="group relative flex flex-col rounded-[6px] bg-white border border-[#E3E5E9] p-6 hover:border-[#3F4FBF] transition-all duration-200 shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
      {/* Top Meta Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold border ${typeInfo.color}`}>
            <TypeIcon className="w-3.5 h-3.5" />
            {typeInfo.label}
          </span>
        </div>
        {rev && (
          <span className="flex items-center gap-1 text-[11px] mono text-[#3F4FBF] bg-[#F8F9FB] border border-[#E3E5E9] px-2 py-0.5 rounded">
            <History className="w-3 h-3" /> Rev #{rev.revision_number}
          </span>
        )}
      </div>

      {/* Entity Title */}
      <Link href={`/entity/${entity.slug}`} className="block group-hover:text-[#3F4FBF] transition-colors">
        <h3 className="serif text-[20px] font-semibold text-[#1E2A3A] leading-tight flex items-center justify-between">
          {entity.name}
          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#3F4FBF]" />
        </h3>
      </Link>

      {/* Industry & Country */}
      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[12.5px] text-[#8A93A3]">
        <span>{entity.industry}</span>
        <span>•</span>
        <span>{entity.country}</span>
      </div>

      {/* Description Snippet */}
      {content?.description && (
        <p className="mt-3 text-[14px] text-[#5B6472] line-clamp-2 leading-relaxed">
          {content.description}
        </p>
      )}

      {/* Structured AI Uses */}
      {content?.ai_uses && content.ai_uses.length > 0 && (
        <div className="mt-4">
          <span className="text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider block mb-1.5 font-sans">
            AI Applications
          </span>
          <div className="flex flex-wrap gap-1.5">
            {content.ai_uses.map((use, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 text-[12px] rounded bg-[#F8F9FB] text-[#1E2A3A] border border-[#E3E5E9]"
              >
                {use}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Structured AI Tools */}
      {content?.ai_tools && content.ai_tools.length > 0 && (
        <div className="mt-3">
          <span className="text-[11px] font-semibold text-[#3F4FBF] uppercase tracking-wider block mb-1.5 flex items-center gap-1 font-sans">
            <Layers className="w-3 h-3" /> AI Tools Deployed
          </span>
          <div className="flex flex-wrap gap-1.5">
            {content.ai_tools.map((tool, idx) => (
              <span
                key={idx}
                className="mono px-2.5 py-0.5 text-[11.5px] rounded bg-[#EEEDFE] text-[#3F4FBF] border border-[#E3E5E9] font-medium"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Card Footer Actions */}
      <div className="mt-6 pt-4 border-t border-[#E3E5E9] flex items-center justify-between text-[12.5px] text-[#8A93A3]">
        <span>{content?.sources?.length || 0} Sources</span>
        <div className="flex items-center gap-2">
          <Link
            href={`/entity/${entity.slug}/history`}
            className="hover:text-[#3F4FBF] transition-colors flex items-center gap-1"
          >
            History
          </Link>
          <span>•</span>
          <Link
            href={`/entity/${entity.slug}/edit`}
            className="text-[#3F4FBF] hover:underline font-semibold flex items-center gap-1"
          >
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}
