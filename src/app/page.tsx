'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EntityCard from '@/components/EntityCard';
import { Entity, EntityType } from '@/lib/types';
import Link from 'next/link';
import Fa from '@/components/Fa';
import {
  faMagnifyingGlass,
  faUsers,
  faBuilding,
  faLandmark,
  faGraduationCap,
  faPlus,
  faClock,
  faArrowTrendUp,
  faTableCellsLarge,
} from '@fortawesome/free-solid-svg-icons';

export default function HomePage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<EntityType | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntities();
  }, [selectedType]);

  const fetchEntities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.set('type', selectedType);

      const res = await fetch(`/api/entities?${params.toString()}`);
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

  const filteredEntities = entities.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.industry.toLowerCase().includes(q) ||
      e.country.toLowerCase().includes(q) ||
      e.current_revision?.content.description.toLowerCase().includes(q) ||
      e.current_revision?.content.ai_tools.some((t) => t.toLowerCase().includes(q)) ||
      e.current_revision?.content.ai_uses.some((u) => u.toLowerCase().includes(q))
    );
  });

  const recentEntities = [...entities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 4);

  const recentlyUpdated = [...entities].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col font-sans">
      <Navbar />

      {/* Left-Aligned Hero Section */}
      <header className="pt-10 sm:pt-12 pb-8 text-left">
        <div className="max-w-[1180px] mx-auto px-6">
          {/* Left-Aligned Heading */}
          <h1 className="serif text-4xl sm:text-6xl font-semibold leading-[1.12] max-w-[800px] mb-3 text-[#1E2A3A] tracking-tight">
            Who uses AI?
          </h1>
          <h2 className="serif text-2xl sm:text-3xl font-medium leading-snug max-w-[800px] mb-6 text-[#1E2A3A]">
            And what are they actually using it for?
          </h2>

          <div className="max-w-[640px] mb-8 space-y-4 text-[#5B6472] text-[16.5px] leading-relaxed">
            <p>
              Discover real-world AI adoption across companies, organisations, governments, universities, and research institutions.
            </p>
            <p>
              Every entry is backed by evidence. Anyone can contribute, challenge, or correct a claim — and{' '}
              <strong className="font-semibold text-[#1E2A3A]">nothing is overwritten</strong>. Every change creates a new version, preserving the complete history of what was reported, when, and by whom.
            </p>
            <p className="font-semibold text-[#1E2A3A]">
              Explore the evidence. Follow the revisions. Decide for yourself.
            </p>
          </div>

          {/* Search Box - Index Card Motif */}
          <div className="max-w-[680px]">
            <div className="index-card flex items-center gap-3.5">
              <span className="hole l" />
              <span className="hole r" />
              <Fa icon={faMagnifyingGlass} className="w-[18px] h-[18px] text-[#8A93A3]" />
              <input
                type="text"
                placeholder="Search organisations or AI tools…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[#1E2A3A] text-[15px] placeholder:text-[#8A93A3]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[12px] text-[#8A93A3] hover:text-[#1E2A3A] px-2 py-0.5 rounded bg-[#F8F9FB]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Explore Section */}
      <section className="pt-10 pb-8 border-t border-[#E3E5E9] mt-6">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6 flex-wrap">
            <div>
              <h2 className="serif text-[30px] font-semibold text-[#1E2A3A] mb-1.5">
                Explore AI Adoption
              </h2>
              <p className="text-[#5B6472] text-[14.5px]">
                Browse documented AI use by organisation, category, or AI tool.
              </p>
            </div>

            <Link href="/explore" className="btn btn-outline text-[13.5px] whitespace-nowrap">
              Explore Directory
            </Link>
          </div>

          <div className="mb-6">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-0.5 border-b border-[#E3E5E9]">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-2.5 text-[13.5px] font-medium border-b-2 -mb-[1px] flex items-center gap-2 transition-all ${
                  selectedType === 'all'
                    ? 'text-[#1E2A3A] border-b-[#3F4FBF] font-semibold'
                    : 'text-[#5B6472] border-b-transparent hover:text-[#1E2A3A]'
                }`}
              >
                <Fa icon={faTableCellsLarge} className="w-3.5 h-3.5 text-[#8A93A3]" />
                All
              </button>
              <button
                onClick={() => setSelectedType('company')}
                className={`px-4 py-2.5 text-[13.5px] font-medium border-b-2 -mb-[1px] flex items-center gap-2 transition-all ${
                  selectedType === 'company'
                    ? 'text-[#1E2A3A] border-b-[#3F4FBF] font-semibold'
                    : 'text-[#5B6472] border-b-transparent hover:text-[#1E2A3A]'
                }`}
              >
                <Fa icon={faBuilding} className="w-3.5 h-3.5 text-[#8A93A3]" />
                Companies
              </button>
              <button
                onClick={() => setSelectedType('organisation')}
                className={`px-4 py-2.5 text-[13.5px] font-medium border-b-2 -mb-[1px] flex items-center gap-2 transition-all ${
                  selectedType === 'organisation'
                    ? 'text-[#1E2A3A] border-b-[#3F4FBF] font-semibold'
                    : 'text-[#5B6472] border-b-transparent hover:text-[#1E2A3A]'
                }`}
              >
                <Fa icon={faUsers} className="w-3.5 h-3.5 text-[#8A93A3]" />
                Organisations
              </button>
              <button
                onClick={() => setSelectedType('government')}
                className={`px-4 py-2.5 text-[13.5px] font-medium border-b-2 -mb-[1px] flex items-center gap-2 transition-all ${
                  selectedType === 'government'
                    ? 'text-[#1E2A3A] border-b-[#3F4FBF] font-semibold'
                    : 'text-[#5B6472] border-b-transparent hover:text-[#1E2A3A]'
                }`}
              >
                <Fa icon={faLandmark} className="w-3.5 h-3.5 text-[#8A93A3]" />
                Government
              </button>
              <button
                onClick={() => setSelectedType('university_research')}
                className={`px-4 py-2.5 text-[13.5px] font-medium border-b-2 -mb-[1px] flex items-center gap-2 transition-all ${
                  selectedType === 'university_research'
                    ? 'text-[#1E2A3A] border-b-[#3F4FBF] font-semibold'
                    : 'text-[#5B6472] border-b-transparent hover:text-[#1E2A3A]'
                }`}
              >
                <Fa icon={faGraduationCap} className="w-3.5 h-3.5 text-[#8A93A3]" />
                University &amp; Research
              </button>
            </div>
          </div>

          {/* Cards Grid / Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-60 rounded-[6px] bg-white border border-[#E3E5E9] animate-pulse" />
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
              <div className="w-[52px] h-[52px] rounded-full bg-[#F8F9FB] border border-[#E3E5E9] flex items-center justify-center mx-auto mb-5 text-[#8A93A3]">
                <Fa icon={faMagnifyingGlass} className="w-5 h-5" />
              </div>
              <h3 className="serif text-[19px] font-semibold text-[#1E2A3A] mb-2">No matching entities found</h3>
              <p className="text-[#5B6472] text-[14px] mb-6 max-w-sm mx-auto">
                No entries match your search query "{searchQuery}". You can be the first to document it.
              </p>
              <Link href="/add" className="btn btn-forest">
                <Fa icon={faPlus} className="w-4 h-4" /> Add New Entry
              </Link>
            </div>
          )}

          {/* Recent Lists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
            {/* Recently Added */}
            <div className="bg-white border border-[#E3E5E9] rounded-[8px] p-[22px_24px] shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
              <div className="flex justify-between items-center mb-[16px]">
                <div>
                  <div className="flex items-center gap-2.5 serif text-[17px] font-semibold text-[#1E2A3A]">
                    <Fa icon={faClock} className="w-4 h-4 text-[#3F4FBF]" />
                    Recently Added
                  </div>
                  <p className="text-[12.5px] text-[#8A93A3] mt-1">
                    The latest organisations and AI use cases documented by the community.
                  </p>
                </div>
                <Link href="/explore" className="text-[12.5px] text-[#3F4FBF] hover:underline shrink-0">View all</Link>
              </div>

              {recentEntities.length > 0 ? (
                <div className="space-y-2.5 border-t border-[#E3E5E9] pt-3">
                  {recentEntities.map((e) => (
                    <Link
                      key={e.id}
                      href={`/entity/${e.slug}`}
                      className="flex items-center justify-between p-2.5 rounded bg-[#F8F9FB] hover:bg-[#E3E5E9]/60 transition-colors"
                    >
                      <div>
                        <span className="text-[13.5px] font-semibold text-[#1E2A3A] block">{e.name}</span>
                        <span className="text-[11.5px] text-[#8A93A3]">{e.type} • {e.industry}</span>
                      </div>
                      <span className="mono text-[11px] text-[#8A93A3]">{new Date(e.created_at).toLocaleDateString()}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-[13.5px] text-[#8A93A3] pt-5 border-t border-[#E3E5E9] mt-4">
                  Nothing added yet — new entries will appear here.
                </div>
              )}
            </div>

            {/* Recently Updated */}
            <div className="bg-white border border-[#E3E5E9] rounded-[8px] p-[22px_24px] shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
              <div className="flex justify-between items-center mb-[16px]">
                <div>
                  <div className="flex items-center gap-2.5 serif text-[17px] font-semibold text-[#1E2A3A]">
                    <Fa icon={faArrowTrendUp} className="w-4 h-4 text-[#3F4FBF]" />
                    Recently Updated
                  </div>
                  <p className="text-[12.5px] text-[#8A93A3] mt-1">
                    See the latest additions, corrections, and competing claims.
                  </p>
                </div>
                <Link href="/admin" className="text-[12.5px] text-[#3F4FBF] hover:underline shrink-0">View revision history</Link>
              </div>

              {recentlyUpdated.length > 0 ? (
                <div className="space-y-2.5 border-t border-[#E3E5E9] pt-3">
                  {recentlyUpdated.map((e) => (
                    <Link
                      key={e.id}
                      href={`/entity/${e.slug}`}
                      className="flex items-center justify-between p-2.5 rounded bg-[#F8F9FB] hover:bg-[#E3E5E9]/60 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[13.5px] font-semibold text-[#1E2A3A]">{e.name}</span>
                          <span className="mono text-[10px] text-[#3F4FBF] bg-white border border-[#E3E5E9] px-1.5 py-0.5 rounded">
                            Rev #{e.current_revision?.revision_number || 1}
                          </span>
                        </div>
                        <span className="text-[11.5px] text-[#5B6472] truncate block mt-0.5">{e.current_revision?.edit_summary || 'Updated'}</span>
                      </div>
                      <span className="mono text-[11px] text-[#8A93A3]">{new Date(e.updated_at).toLocaleDateString()}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-[13.5px] text-[#8A93A3] pt-5 border-t border-[#E3E5E9] mt-4">
                  Nothing updated yet — recent revisions will appear here.
                </div>
              )}
            </div>
          </div>

          {/* CTA Box Motif */}
          <div className="cta-box mt-10 flex flex-col sm:flex-row justify-between items-center gap-7">
            <div>
              <h3 className="serif text-[24px] font-semibold text-[#1E2A3A] mb-2">
                Know something we're missing?
              </h3>
              <p className="text-[#5B6472] text-[14.5px] max-w-[480px]">
                Add an organisation, AI use case, or supporting evidence.
              </p>
              <p className="text-[#5B6472] text-[14.5px] max-w-[480px] mt-2">
                No account required. Every submission becomes a new revision —{' '}
                <strong className="font-semibold text-[#1E2A3A]">never a replacement of the existing record.</strong>
              </p>
            </div>
            <Link href="/add" className="btn btn-outline whitespace-nowrap">
              <Fa icon={faPlus} className="w-4 h-4 text-[#3F4FBF]" />
              <span>Add an Entry</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
