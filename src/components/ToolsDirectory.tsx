'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ExternalLink,
  Filter,
  Layers,
  Search,
} from 'lucide-react';
import { ToolGroup, toolAnchor } from '@/lib/tools-index';

const ORGS_PREVIEW = 4;

type SortMode = 'name' | 'usage';

export default function ToolsDirectory({ tools }: { tools: ToolGroup[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('usage');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = tools;

    if (q) {
      list = tools.filter((item) => {
        if (item.tool.toLowerCase().includes(q)) return true;
        return item.entities.some(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.industry?.toLowerCase().includes(q) ||
            e.uses.some((u) => u.toLowerCase().includes(q))
        );
      });
    }

    return [...list].sort((a, b) => {
      if (sort === 'usage') {
        const byCount = b.entities.length - a.entities.length;
        if (byCount !== 0) return byCount;
      }
      return a.tool.localeCompare(b.tool);
    });
  }, [tools, query, sort]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash.startsWith('tool-')) return;
    const el = document.getElementById(hash);
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ block: 'start', behavior: 'smooth' });
      });
    }
  }, [filtered]);

  return (
    <main className="max-w-[1180px] mx-auto px-6 py-10 space-y-8 w-full flex-grow">
      <div className="space-y-2 border-b border-[#E3E5E9] pb-6">
        <h1 className="serif text-3xl sm:text-4xl font-semibold text-[#1E2A3A] tracking-tight flex items-center gap-3">
          <Layers className="w-8 h-8 text-[#3F4FBF]" />
          AI Tools Index
        </h1>
        <p className="text-[14.5px] text-[#5B6472] max-w-2xl">
          Browse by tool: see which organisations use each product and what they use it for.
          For browsing by organisation, use{' '}
          <Link href="/explore" className="text-[#3F4FBF] font-medium hover:underline">
            Explore
          </Link>
          .
        </p>
      </div>

      <div className="rounded-[6px] bg-white border border-[#E3E5E9] p-5 space-y-4 shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8A93A3] uppercase tracking-wider font-sans">
          <Filter className="w-3.5 h-3.5 text-[#3F4FBF]" />
          <span>Search &amp; Sort</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#8A93A3]" />
            <input
              type="search"
              placeholder="Search tools, organisations, or use cases…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] pl-9 pr-3 py-2 text-xs text-[#1E2A3A] placeholder:text-[#8A93A3] focus:border-[#3F4FBF] focus:outline-none"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-2 text-xs text-[#1E2A3A] focus:border-[#3F4FBF] focus:outline-none"
          >
            <option value="usage">Most organisations first</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {query && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E3E5E9] text-xs">
            <span className="text-[#8A93A3]">Active:</span>
            <span className="px-2 py-0.5 rounded bg-[#EEEDFE] text-[#3F4FBF] border border-[#E3E5E9]">
              &quot;{query}&quot;
            </span>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-[#A85238] hover:underline ml-2"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-[13px] text-[#8A93A3]">
        <span>
          Showing {filtered.length} of {tools.length}{' '}
          {tools.length === 1 ? 'tool' : 'tools'}
        </span>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((item) => {
            const preview = item.entities.slice(0, ORGS_PREVIEW);
            const remaining = item.entities.length - preview.length;
            const anchor = toolAnchor(item.tool);

            return (
              <div
                key={item.tool}
                id={`tool-${anchor}`}
                className="rounded-[6px] bg-white border border-[#E3E5E9] p-6 shadow-[0_1px_2px_rgba(30,42,58,0.05)] space-y-4 scroll-mt-24 target:ring-2 target:ring-[#3F4FBF]/40"
              >
                <div className="flex items-center justify-between border-b border-[#E3E5E9] pb-3 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <h2 className="mono text-[18px] font-bold text-[#3F4FBF] truncate">
                      {item.tool}
                    </h2>
                    <span className="text-[11px] text-[#8A93A3] px-2 py-0.5 rounded bg-[#F8F9FB] border border-[#E3E5E9] shrink-0">
                      {item.entities.length}{' '}
                      {item.entities.length === 1 ? 'organisation' : 'organisations'}
                    </span>
                  </div>

                  <Link
                    href={`/explore?tool=${encodeURIComponent(item.tool)}`}
                    className="text-[12px] font-semibold text-[#3F4FBF] hover:underline flex items-center gap-1 shrink-0"
                  >
                    View in Explore <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {preview.map((e) => (
                    <div key={e.id} className="space-y-1.5">
                      <Link
                        href={`/entity/${e.slug}`}
                        className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#1E2A3A] hover:text-[#3F4FBF] transition-colors"
                      >
                        <span>{e.name}</span>
                        <ExternalLink className="w-3 h-3 text-[#8A93A3]" />
                      </Link>
                      {e.uses && e.uses.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pl-0.5">
                          {e.uses.map((use) => (
                            <span
                              key={use}
                              className="text-[11.5px] text-[#5B6472] px-2 py-0.5 rounded bg-[#F8F9FB] border border-[#E3E5E9]"
                            >
                              {use}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {remaining > 0 && (
                  <Link
                    href={`/explore?tool=${encodeURIComponent(item.tool)}`}
                    className="inline-flex text-[12.5px] font-semibold text-[#3F4FBF] hover:underline"
                  >
                    +{remaining} more in Explore
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      ) : tools.length === 0 ? (
        <div className="border border-dashed border-[#E3E5E9] rounded-[8px] p-16 text-center bg-white">
          <Layers className="w-8 h-8 text-[#8A93A3] mx-auto mb-3" />
          <h3 className="serif text-[18px] font-semibold text-[#1E2A3A]">No AI tools indexed yet</h3>
          <p className="text-[13.5px] text-[#5B6472] mt-1">
            Add organisation entries to index the AI tools they deploy.
          </p>
        </div>
      ) : (
        <div className="border border-dashed border-[#E3E5E9] rounded-[8px] p-16 text-center bg-white">
          <Search className="w-8 h-8 text-[#8A93A3] mx-auto mb-3" />
          <h3 className="serif text-[18px] font-semibold text-[#1E2A3A]">No tools match your search</h3>
          <p className="text-[13.5px] text-[#5B6472] mt-1 mb-4">
            Try another term, or browse organisations in Explore.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-[13px] font-semibold text-[#3F4FBF] hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </main>
  );
}
