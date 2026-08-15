'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EntityCard from '@/components/EntityCard';
import { Entity } from '@/lib/types';
import { getEntityTypeLabel } from '@/lib/entityTypes';
import Link from 'next/link';
import Fa from '@/components/Fa';
import { faBookOpen, faFilter, faMagnifyingGlass, faPlus } from '@fortawesome/free-solid-svg-icons';

function ExploreContent() {
  const searchParams = useSearchParams();
  const rawInitialType = searchParams?.get('type') || 'all';
  const initialType =
    rawInitialType === 'all'
      ? 'all'
      : rawInitialType === 'university'
        ? 'university_research'
        : rawInitialType === 'non-profit'
          ? 'organisation'
          : rawInitialType;
  const initialTool = searchParams?.get('tool') || '';

  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedTool, setSelectedTool] = useState<string>(initialTool);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/entities');
      const data = await res.json();
      if (data.success) {
        setEntities(data.entities);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Derive unique lists for dropdown filters
  const allCountries = Array.from(new Set(entities.map((e) => e.country).filter(Boolean))).sort();
  const allTools = Array.from(
    new Set(entities.flatMap((e) => e.current_revision?.content.ai_tools || []))
  ).sort();

  // Apply Client Filters
  const filteredEntities = entities.filter((entity) => {
    if (selectedType !== 'all' && entity.type !== selectedType) return false;
    if (
      selectedTool &&
      selectedTool !== 'all' &&
      !entity.current_revision?.content.ai_tools.includes(selectedTool)
    ) {
      return false;
    }
    if (selectedCountry !== 'all' && entity.country !== selectedCountry) return false;

    if (query.trim()) {
      const q = query.toLowerCase();
      const content = entity.current_revision?.content;
      const matchesName = entity.name.toLowerCase().includes(q);
      const matchesIndustry = entity.industry.toLowerCase().includes(q);
      const matchesDesc = content?.description.toLowerCase().includes(q);
      const matchesUse = content?.ai_uses.some((u) => u.toLowerCase().includes(q));
      const matchesTool = content?.ai_tools.some((t) => t.toLowerCase().includes(q));

      if (!matchesName && !matchesIndustry && !matchesDesc && !matchesUse && !matchesTool) {
        return false;
      }
    }

    return true;
  });

  return (
    <main className="max-w-[1180px] mx-auto px-6 py-10 space-y-8 w-full flex-grow">
      {/* Header */}
      <div className="border-b border-[#E3E5E9] pb-6 space-y-1">
        <h1 className="serif text-3xl sm:text-4xl font-semibold text-[#1E2A3A] tracking-tight flex items-center gap-3">
          <Fa icon={faBookOpen} className="w-8 h-8 text-[#3F4FBF]" />
          Explore AI Adoption
        </h1>
        <p className="text-[14.5px] text-[#5B6472]">
          Browse documented AI use by organisation, category, or AI tool.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="rounded-[6px] bg-white border border-[#E3E5E9] p-5 space-y-4 shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8A93A3] uppercase tracking-wider font-sans">
          <Fa icon={faFilter} className="w-3.5 h-3.5 text-[#3F4FBF]" />
          <span>Search &amp; Filter Options</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Fa icon={faMagnifyingGlass} className="w-4 h-4 absolute left-3 top-3 text-[#8A93A3]" />
            <input
              type="text"
              placeholder="Search by name or keyword…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] pl-9 pr-3 py-2 text-xs text-[#1E2A3A] focus:border-[#3F4FBF] focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-2 text-xs text-[#1E2A3A] focus:border-[#3F4FBF] focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="company">Company</option>
              <option value="organisation">Organisation</option>
              <option value="government">Government</option>
              <option value="university_research">University &amp; Research</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* AI Tool Dropdown */}
          <div>
            <select
              value={selectedTool}
              onChange={(e) => setSelectedTool(e.target.value)}
              className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-2 text-xs text-[#1E2A3A] focus:border-[#3F4FBF] focus:outline-none"
            >
              <option value="">All AI Tools</option>
              {allTools.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Country Dropdown */}
          <div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-2 text-xs text-[#1E2A3A] focus:border-[#3F4FBF] focus:outline-none"
            >
              <option value="all">All Countries / Regions</option>
              {allCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Chips & Reset */}
        {(selectedType !== 'all' || selectedTool || selectedCountry !== 'all' || query) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E3E5E9] text-xs">
            <span className="text-[#8A93A3]">Active Filters:</span>
            {selectedType !== 'all' && (
              <span className="px-2 py-0.5 rounded bg-[#EEEDFE] text-[#3F4FBF] border border-[#E3E5E9]">
                Type: {getEntityTypeLabel(selectedType)}
              </span>
            )}
            {selectedTool && (
              <span className="px-2 py-0.5 rounded bg-[#EEEDFE] text-[#3F4FBF] border border-[#E3E5E9]">
                Tool: {selectedTool}
              </span>
            )}
            {selectedCountry !== 'all' && (
              <span className="px-2 py-0.5 rounded bg-[#EEEDFE] text-[#3F4FBF] border border-[#E3E5E9]">
                Country: {selectedCountry}
              </span>
            )}
            {query && (
              <span className="px-2 py-0.5 rounded bg-[#EEEDFE] text-[#3F4FBF] border border-[#E3E5E9]">
                "{query}"
              </span>
            )}
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedTool('');
                setSelectedCountry('all');
                setQuery('');
              }}
              className="text-[#A85238] hover:underline ml-2"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-[13px] text-[#8A93A3]">
          <span>Showing {filteredEntities.length} entries</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-60 rounded bg-white border border-[#E3E5E9] animate-pulse" />
            ))}
          </div>
        ) : filteredEntities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntities.map((entity) => (
              <EntityCard key={entity.id} entity={entity} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-[#E3E5E9] rounded-[8px] p-16 text-center bg-white">
            <Fa icon={faMagnifyingGlass} className="w-8 h-8 text-[#8A93A3] mx-auto mb-3" />
            <h3 className="serif text-[18px] font-semibold text-[#1E2A3A]">No entries match your filters</h3>
            <p className="text-[13.5px] text-[#5B6472] mt-1 mb-6">
              Try adjusting your search criteria or contribute this entry yourself.
            </p>
            <Link href="/add" className="btn btn-forest">
              <Fa icon={faPlus} className="w-4 h-4" /> Add New Entry
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col font-sans">
      <Navbar />
      <Suspense fallback={
        <div className="max-w-[1180px] mx-auto px-6 py-20 animate-pulse text-center">
          <div className="h-8 w-48 bg-white mx-auto rounded border border-[#E3E5E9]" />
        </div>
      }>
        <ExploreContent />
      </Suspense>
      <Footer />
    </div>
  );
}
