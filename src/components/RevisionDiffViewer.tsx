'use client';

import React from 'react';
import { EntityRevision } from '@/lib/types';
import { diffWords } from 'diff';
import Fa from '@/components/Fa';
import { faCodeCompare, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

interface RevisionDiffViewerProps {
  oldRevision: EntityRevision | null;
  newRevision: EntityRevision;
}

export default function RevisionDiffViewer({
  oldRevision,
  newRevision
}: RevisionDiffViewerProps) {
  const oldContent = oldRevision?.content;
  const newContent = newRevision.content;

  // Text diff for description
  const oldDesc = oldContent?.description || '';
  const newDesc = newContent.description || '';
  const wordDiffs = diffWords(oldDesc, newDesc);

  return (
    <div className="space-y-6">
      {/* Header comparing revision metadata */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded bg-[#F8F9FB] border border-[#E3E5E9] text-xs gap-3">
        <div className="flex items-center gap-2">
          <Fa icon={faCodeCompare} className="w-4 h-4 text-[#3F4FBF]" />
          <span className="font-semibold text-[#1E2A3A]">
            Comparing Rev #{oldRevision?.revision_number || 0} &rarr; Rev #{newRevision.revision_number}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[#8A93A3]">
          <span className="flex items-center gap-1">
            <Fa icon={faMinus} className="w-3 h-3 text-[#A85238]" /> Removals
          </span>
          <span className="flex items-center gap-1">
            <Fa icon={faPlus} className="w-3 h-3 text-[#3F4FBF]" /> Additions
          </span>
        </div>
      </div>

      {/* Description Diff Box */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider font-sans">
          Description &amp; AI Adoption Details Diff
        </h4>

        <div className="rounded bg-[#F8F9FB] p-4 border border-[#E3E5E9] mono text-xs leading-relaxed text-[#1E2A3A]">
          {wordDiffs.map((part, index) => {
            if (part.added) {
              return (
                <mark
                  key={index}
                  className="bg-[#3F4FBF]/20 text-[#3F4FBF] px-1 py-0.5 rounded border-b-2 border-[#3F4FBF]"
                >
                  {part.value}
                </mark>
              );
            }
            if (part.removed) {
              return (
                <del
                  key={index}
                  className="bg-[#A85238]/20 text-[#A85238] px-1 py-0.5 rounded line-through border-b-2 border-[#A85238]"
                >
                  {part.value}
                </del>
              );
            }
            return <span key={index}>{part.value}</span>;
          })}
        </div>
      </div>

      {/* Structured Fields Compare */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Uses */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider font-sans">
            AI Applications Difference
          </h4>
          <div className="rounded bg-[#F8F9FB] p-4 border border-[#E3E5E9] space-y-2 text-xs">
            <div>
              <span className="text-[#8A93A3] block mb-1">Old Applications:</span>
              <div className="flex flex-wrap gap-1">
                {oldContent?.ai_uses && oldContent.ai_uses.length > 0 ? (
                  oldContent.ai_uses.map((u, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white text-[#5B6472] border border-[#E3E5E9]">
                      {u}
                    </span>
                  ))
                ) : (
                  <span className="text-[#8A93A3] italic">None</span>
                )}
              </div>
            </div>

            <div className="border-t border-[#E3E5E9] pt-2">
              <span className="text-[#3F4FBF] font-semibold block mb-1">New Applications:</span>
              <div className="flex flex-wrap gap-1">
                {newContent.ai_uses && newContent.ai_uses.length > 0 ? (
                  newContent.ai_uses.map((u, i) => {
                    const isNew = !oldContent?.ai_uses?.includes(u);
                    return (
                      <span
                        key={i}
                        className={`px-2 py-0.5 rounded border ${
                          isNew
                            ? 'bg-[#EEEDFE] text-[#3F4FBF] border-[#3F4FBF] font-semibold'
                            : 'bg-white text-[#1E2A3A] border-[#E3E5E9]'
                        }`}
                      >
                        {u} {isNew && ' (Added)'}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-[#8A93A3] italic">None</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Tools */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider font-sans">
            AI Tools Deployed Difference
          </h4>
          <div className="rounded bg-[#F8F9FB] p-4 border border-[#E3E5E9] space-y-2 text-xs">
            <div>
              <span className="text-[#8A93A3] block mb-1">Old Tools:</span>
              <div className="flex flex-wrap gap-1">
                {oldContent?.ai_tools && oldContent.ai_tools.length > 0 ? (
                  oldContent.ai_tools.map((t, i) => (
                    <span key={i} className="mono px-2 py-0.5 rounded bg-white text-[#5B6472] border border-[#E3E5E9]">
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-[#8A93A3] italic">None</span>
                )}
              </div>
            </div>

            <div className="border-t border-[#E3E5E9] pt-2">
              <span className="text-[#3F4FBF] font-semibold block mb-1">New Tools:</span>
              <div className="flex flex-wrap gap-1">
                {newContent.ai_tools && newContent.ai_tools.length > 0 ? (
                  newContent.ai_tools.map((t, i) => {
                    const isNew = !oldContent?.ai_tools?.includes(t);
                    return (
                      <span
                        key={i}
                        className={`mono px-2 py-0.5 rounded border ${
                          isNew
                            ? 'bg-[#EEEDFE] text-[#3F4FBF] border-[#3F4FBF] font-semibold'
                            : 'bg-white text-[#1E2A3A] border-[#E3E5E9]'
                        }`}
                      >
                        {t} {isNew && ' (Added)'}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-[#8A93A3] italic">None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
