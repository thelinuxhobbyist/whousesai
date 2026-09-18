'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Filter,
  Layers,
  Search,
} from 'lucide-react';
import { ToolGroup, TOOLS_INDEX_TOP, TOOLS_SEARCH_LIMIT } from '@/lib/tools-index';

type SortMode = 'name' | 'usage';

export default function ToolsDirectory({
  tools,
  totalDocumented,
  initialQuery,
  initialSort,
  mode,
}: {
  tools: ToolGroup[];
  totalDocumented: number;
  initialQuery: string;
  initialSort: SortMode;
  mode: 'top' | 'search';
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortMode>(initialSort);

  useEffect(() => {
    setQuery(initialQuery);
    setSort(initialSort);
  }, [initialQuery, initialSort]);

  // Old claim links used /tools#tool-slug — send them to the detail page.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash.startsWith('tool-')) return;
    const slug = hash.slice('tool-'.length);
    if (slug) router.replace(`/tools/${slug}`);
  }, [router]);

  function apply(nextQuery: string, nextSort: SortMode) {
    const params = new URLSearchParams();
    const q = nextQuery.trim();
    if (q) params.set('q', q);
    if (nextSort !== 'usage') params.set('sort', nextSort);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/tools?${qs}` : '/tools');
    });
  }

  return (
    <main className="max-w-[1180px] mx-auto px-6 py-10 space-y-8 w-full flex-grow">
      <div className="space-y-2 border-b border-[#E3E5E9] pb-6">
        <h1 className="serif text-3xl sm:text-4xl font-semibold text-[#1E2A3A] tracking-tight flex items-center gap-3">
          <Layers className="w-8 h-8 text-[#3F4FBF]" />
          AI Tools Index
        </h1>
        <p className="text-[14.5px] text-[#5B6472] max-w-2xl">
          Find a tool, then open its page to see which organisations use it and for what.
          {totalDocumented > 0 && (
            <>
              {' '}
              <span className="text-[#1E2A3A] font-medium">
                {totalDocumented} tools
              </span>{' '}
              documented so far — search instead of scrolling the full list.
            </>
          )}
        </p>
      </div>

      <form
        className="rounded-[6px] bg-white border border-[#E3E5E9] p-5 space-y-4 shadow-[0_1px_2px_rgba(30,42,58,0.05)]"
        onSubmit={(e) => {
          e.preventDefault();
          apply(query, sort);
        }}
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8A93A3] uppercase tracking-wider font-sans">
          <Filter className="w-3.5 h-3.5 text-[#3F4FBF]" />
          <span>Find a tool</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#8A93A3]" />
            <input
              type="search"
              name="q"
              placeholder="Search tools, organisations, or use cases…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] pl-9 pr-3 py-2 text-xs text-[#1E2A3A] placeholder:text-[#8A93A3] focus:border-[#3F4FBF] focus:outline-none"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => {
              const next = e.target.value as SortMode;
              setSort(next);
              apply(query, next);
            }}
            className="w-full sm:w-auto rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-2 text-xs text-[#1E2A3A] focus:border-[#3F4FBF] focus:outline-none"
          >
            <option value="usage">Most organisations first</option>
            <option value="name">Name A–Z</option>
          </select>

          <button
            type="submit"
            disabled={pending}
            className="rounded bg-[#3F4FBF] text-white px-4 py-2 text-xs font-semibold hover:bg-[#3543a8] disabled:opacity-60 transition-colors"
          >
            Search
          </button>
        </div>

        {initialQuery && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E3E5E9] text-xs">
            <span className="text-[#8A93A3]">Showing results for</span>
            <span className="px-2 py-0.5 rounded bg-[#EEEDFE] text-[#3F4FBF] border border-[#E3E5E9]">
              &quot;{initialQuery}&quot;
            </span>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                apply('', sort);
              }}
              className="text-[#A85238] hover:underline ml-2"
            >
              Clear
            </button>
          </div>
        )}
      </form>

      <div className="flex justify-between items-center text-[13px] text-[#8A93A3]">
        <span>
          {mode === 'search'
            ? `Showing ${tools.length}${tools.length >= TOOLS_SEARCH_LIMIT ? '+' : ''} match${tools.length === 1 ? '' : 'es'}`
            : `Top ${tools.length} of ${totalDocumented} tools by adoption`}
        </span>
        {mode === 'top' && totalDocumented > TOOLS_INDEX_TOP && (
          <span className="text-[12px]">Use search to find the rest</span>
        )}
      </div>

      {tools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((item) => (
            <Link
              key={item.slug}
              href={`/tools/${item.slug}`}
              className="rounded-[6px] bg-white border border-[#E3E5E9] p-5 shadow-[0_1px_2px_rgba(30,42,58,0.05)] hover:border-[#3F4FBF]/40 transition-colors group space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="mono text-[17px] font-bold text-[#3F4FBF] group-hover:underline truncate">
                  {item.tool}
                </h2>
                <ArrowRight className="w-4 h-4 text-[#8A93A3] group-hover:text-[#3F4FBF] shrink-0 mt-1" />
              </div>
              <p className="text-[13px] text-[#5B6472]">
                Documented at{' '}
                <span className="font-semibold text-[#1E2A3A]">
                  {item.entities.length}
                </span>{' '}
                {item.entities.length === 1 ? 'organisation' : 'organisations'}
              </p>
              {item.entities.length > 0 && (
                <p className="text-[12px] text-[#8A93A3] truncate">
                  {item.entities
                    .slice(0, 3)
                    .map((e) => e.name)
                    .join(' · ')}
                  {item.entities.length > 3 ? ` · +${item.entities.length - 3}` : ''}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : totalDocumented === 0 ? (
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
          <h3 className="serif text-[18px] font-semibold text-[#1E2A3A]">No tools match that search</h3>
          <p className="text-[13.5px] text-[#5B6472] mt-1 mb-4">
            Try another term, or browse organisations in Explore.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              apply('', sort);
            }}
            className="text-[13px] font-semibold text-[#3F4FBF] hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </main>
  );
}
