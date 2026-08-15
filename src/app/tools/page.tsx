'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  ArrowRight,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface ToolGroup {
  tool: string;
  entities: {
    id: number;
    slug: string;
    name: string;
    type: string;
    industry: string;
    uses: string[];
  }[];
}

export default function ToolsIndexPage() {
  const [tools, setTools] = useState<ToolGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tools');
      const data = await res.json();
      if (data.success) {
        setTools(data.tools);
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
        <div className="space-y-2 border-b border-[#E3E5E9] pb-6">
          <h1 className="serif text-3xl sm:text-4xl font-semibold text-[#1E2A3A] tracking-tight flex items-center gap-3">
            <Layers className="w-8 h-8 text-[#3F4FBF]" />
            AI Tools Index
          </h1>
          <p className="text-[14.5px] text-[#5B6472]">
            Every AI tool documented in the directory, mapped to the organisations using it and the use cases it supports.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 rounded bg-white border border-[#E3E5E9] animate-pulse" />
            ))}
          </div>
        ) : tools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((item) => (
              <div
                key={item.tool}
                id={`tool-${item.tool.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
                className="rounded-[6px] bg-white border border-[#E3E5E9] p-6 shadow-[0_1px_2px_rgba(30,42,58,0.05)] space-y-4 scroll-mt-24 target:ring-2 target:ring-[#3F4FBF]/40"
              >
                <div className="flex items-center justify-between border-b border-[#E3E5E9] pb-3 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <h2 className="mono text-[18px] font-bold text-[#3F4FBF] truncate">
                      {item.tool}
                    </h2>
                    <span className="text-[11px] text-[#8A93A3] px-2 py-0.5 rounded bg-[#F8F9FB] border border-[#E3E5E9] shrink-0">
                      {item.entities.length} {item.entities.length === 1 ? 'organisation' : 'organisations'}
                    </span>
                  </div>

                  <Link
                    href={`/explore?tool=${encodeURIComponent(item.tool)}`}
                    className="text-[12px] font-semibold text-[#3F4FBF] hover:underline flex items-center gap-1 shrink-0"
                  >
                    Filter Directory <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {item.entities.map((e) => (
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
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-[#E3E5E9] rounded-[8px] p-16 text-center bg-white">
            <Layers className="w-8 h-8 text-[#8A93A3] mx-auto mb-3" />
            <h3 className="serif text-[18px] font-semibold text-[#1E2A3A]">No AI tools indexed yet</h3>
            <p className="text-[13.5px] text-[#5B6472] mt-1">
              Add new entity entries to index the AI tools they deploy.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
