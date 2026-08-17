'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import EvidenceStatusSelect from '@/components/EvidenceStatusSelect';
import { Claim } from '@/lib/types';
import { claimStatement } from '@/lib/evidence';

interface ClaimFormEditorProps {
  claims: Claim[];
  entityName?: string;
  onChange: (claims: Claim[]) => void;
}

export default function ClaimFormEditor({ claims, entityName, onChange }: ClaimFormEditorProps) {
  const addClaim = () => {
    onChange([...claims, { use: '', tool: '', note: '', sources: [{ title: '', url: '' }] }]);
  };

  const removeClaim = (ci: number) => {
    onChange(claims.filter((_, i) => i !== ci));
  };

  const updateClaim = (ci: number, field: keyof Omit<Claim, 'sources'>, value: string) => {
    const next = claims.map((claim, i) => {
      if (i !== ci) return claim;
      if (field === 'evidence_status') {
        return { ...claim, evidence_status: (value || undefined) as Claim['evidence_status'] };
      }
      return { ...claim, [field]: value || undefined };
    });
    onChange(next);
  };

  const addClaimSource = (ci: number) => {
    const next = [...claims];
    next[ci] = { ...next[ci], sources: [...(next[ci].sources || []), { title: '', url: '' }] };
    onChange(next);
  };

  const updateClaimSource = (ci: number, si: number, field: 'title' | 'url', value: string) => {
    const next = [...claims];
    const srcs = [...(next[ci].sources || [])];
    srcs[si] = { ...srcs[si], [field]: value };
    next[ci] = { ...next[ci], sources: srcs };
    onChange(next);
  };

  const removeClaimSource = (ci: number, si: number) => {
    const next = [...claims];
    next[ci] = { ...next[ci], sources: next[ci].sources.filter((_, i) => i !== si) };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#E3E5E9] pb-3">
        <div>
          <h3 className="serif text-[18px] sm:text-[19px] font-semibold text-[#1E2A3A]">
            Claims and evidence
          </h3>
          <p className="text-[12px] text-[#8A93A3] mt-0.5">
            Each claim needs a use case, a clear statement, and at least one source URL.
          </p>
        </div>
        <button type="button" onClick={addClaim} className="flex items-center gap-1 text-xs font-semibold text-[#3F4FBF] hover:underline shrink-0">
          <Plus className="w-4 h-4" /> Add claim
        </button>
      </div>

      <p className="flex items-start gap-2 text-[12px] leading-relaxed text-[#8A93A3]">
        <span className="font-semibold text-[#5B6472]">
          Claims are based on publicly available evidence and may be challenged or updated.
        </span>
      </p>

      <div className="space-y-4">
        {claims.map((claim, ci) => (
          <div key={ci} className="rounded-[6px] border border-[#E3E5E9] overflow-hidden">
            <div className="bg-[#F8F9FB] px-4 py-3 border-b border-[#E3E5E9] flex items-center justify-between gap-2">
              <span className="text-[11.5px] font-semibold text-[#8A93A3] uppercase tracking-wider">
                Claim #{ci + 1}
              </span>
              {claims.length > 1 && (
                <button type="button" onClick={() => removeClaim(ci)} className="text-xs text-[#A85238] hover:underline">
                  Remove
                </button>
              )}
            </div>

            <div className="p-4 space-y-3 bg-white">
              <div>
                <label className="block text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1">
                  Use case title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Real-time fraud detection"
                  value={claim.use}
                  onChange={(e) => updateClaim(ci, 'use', e.target.value)}
                  className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-1.5 text-sm text-[#1E2A3A] placeholder:text-[#8A93A3] focus:border-[#3F4FBF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1">
                  Claim *
                </label>
                <textarea
                  rows={2}
                  placeholder="One sentence describing what is being claimed about this organisation"
                  value={claim.note || ''}
                  onChange={(e) => updateClaim(ci, 'note', e.target.value)}
                  className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-1.5 text-sm text-[#1E2A3A] placeholder:text-[#8A93A3] focus:border-[#3F4FBF] focus:outline-none"
                />
                {entityName && claim.use.trim() && (
                  <p className="mt-1.5 text-[11.5px] text-[#8A93A3]">
                    Preview:{' '}
                    <span className="text-[#5B6472]">{claimStatement(entityName, claim)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1">
                  AI tool (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Microsoft Copilot"
                  value={claim.tool || ''}
                  onChange={(e) => updateClaim(ci, 'tool', e.target.value)}
                  className="mono w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-1.5 text-sm text-[#1E2A3A] placeholder:text-[#8A93A3] focus:border-[#3F4FBF] focus:outline-none"
                />
              </div>

              <EvidenceStatusSelect
                value={claim.evidence_status}
                onChange={(value) => updateClaim(ci, 'evidence_status', value || '')}
              />

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider">Evidence *</span>
                  <button type="button" onClick={() => addClaimSource(ci)} className="text-[11px] font-semibold text-[#3F4FBF] hover:underline">
                    + Add source
                  </button>
                </div>
                {(claim.sources || []).map((src, si) => (
                  <div key={si} className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Source title"
                        value={src.title}
                        onChange={(e) => updateClaimSource(ci, si, 'title', e.target.value)}
                        className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-1.5 text-xs text-[#1E2A3A] placeholder:text-[#8A93A3] focus:outline-none"
                      />
                      <input
                        type="url"
                        placeholder="https://..."
                        value={src.url}
                        onChange={(e) => updateClaimSource(ci, si, 'url', e.target.value)}
                        className="mono w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-1.5 text-xs text-[#1E2A3A] placeholder:text-[#8A93A3] focus:outline-none"
                      />
                    </div>
                    {(claim.sources || []).length > 1 && (
                      <button type="button" onClick={() => removeClaimSource(ci, si)} className="mt-1.5 text-[#A85238] hover:text-[#8B3220]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addClaim}
        className="w-full py-2.5 rounded border border-dashed border-[#E3E5E9] text-[13px] text-[#8A93A3] hover:border-[#3F4FBF] hover:text-[#3F4FBF] transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add another claim
      </button>
    </div>
  );
}

export function cleanClaimsForSubmit(claims: Claim[]): Claim[] {
  return claims
    .filter((c) => c.use.trim().length > 0)
    .map((c) => ({
      ...c,
      tool: c.tool?.trim() || undefined,
      note: c.note?.trim() || undefined,
      evidence_status: c.evidence_status || undefined,
      sources: (c.sources || []).filter((s) => s.url.trim().length > 0),
    }));
}
