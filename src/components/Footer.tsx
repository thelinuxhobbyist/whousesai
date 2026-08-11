'use client';

import React from 'react';
import Link from 'next/link';
import { IdCard, GitBranch, Globe, CheckCheck, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#E3E5E9] pt-14 pb-8 bg-white mt-auto font-sans">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-11">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F8F9FB] border border-[#E3E5E9] flex items-center justify-center text-[#3F4FBF]">
                <IdCard className="w-4 h-4 text-[#3F4FBF]" />
              </div>
              <span className="serif font-semibold text-[18px] text-[#1E2A3A]">
                WhoUses<span className="text-[#3F4FBF]">AI</span>.com
              </span>
            </div>
            <p className="text-[13.5px] text-[#5B6472] leading-relaxed">
              An open, community-built directory documenting who is using AI and how. Inspired by Wikipedia's editing philosophy — every edit creates a transparent, immutable revision.
            </p>
            <div className="flex flex-wrap gap-3 text-[12px] text-[#8A93A3] pt-1">
              <span className="flex items-center gap-1.5">
                <GitBranch className="w-3 h-3 text-[#3F4FBF]" />
                Append-Only
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-[#3F4FBF]" />
                Open Access
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCheck className="w-3 h-3 text-[#3F4FBF]" />
                Evidence-Based
              </span>
            </div>
          </div>

          {/* Directory Links */}
          <div>
            <h4 className="text-[12px] tracking-[0.08em] text-[#8A93A3] uppercase mb-4 font-semibold font-sans">
              Directory Categories
            </h4>
            <ul className="space-y-2.5 text-[13.5px] text-[#5B6472]">
              <li><Link href="/explore?type=company" className="hover:text-[#3F4FBF] transition-colors">Companies</Link></li>
              <li><Link href="/explore?type=organisation" className="hover:text-[#3F4FBF] transition-colors">Organisations</Link></li>
              <li><Link href="/explore?type=government" className="hover:text-[#3F4FBF] transition-colors">Government</Link></li>
              <li><Link href="/explore?type=university_research" className="hover:text-[#3F4FBF] transition-colors">University &amp; Research</Link></li>
              <li><Link href="/explore?type=other" className="hover:text-[#3F4FBF] transition-colors">Other</Link></li>
              <li><Link href="/tools" className="hover:text-[#3F4FBF] transition-colors">AI Tools Index</Link></li>
            </ul>
          </div>

          {/* Governance & Audit Stream (Relocated from Top Navbar) */}
          <div>
            <h4 className="text-[12px] tracking-[0.08em] text-[#8A93A3] uppercase mb-4 font-semibold font-sans flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3F4FBF]" />
              Governance &amp; Moderation
            </h4>
            <ul className="space-y-2.5 text-[13.5px] text-[#5B6472]">
              <li>
                <Link href="/admin" className="text-[#3F4FBF] font-medium hover:underline flex items-center gap-1.5">
                  <span>Moderation &amp; Audit Stream</span>
                </Link>
              </li>
              <li><Link href="/add" className="hover:text-[#3F4FBF] transition-colors">Add New Entity</Link></li>
              <li><Link href="/admin" className="hover:text-[#3F4FBF] transition-colors">Reported Content Flags</Link></li>
              <li><Link href="/admin" className="hover:text-[#3F4FBF] transition-colors">Recent Revisions Ledger</Link></li>
            </ul>
          </div>

          {/* Principles */}
          <div>
            <h4 className="text-[12px] tracking-[0.08em] text-[#8A93A3] uppercase mb-4 font-semibold font-sans">
              Editing Principles
            </h4>
            <ul className="space-y-2.5 text-[13.5px] text-[#5B6472]">
              <li><span>Read &rarr; Edit &rarr; Save</span></li>
              <li><span>No Account Required</span></li>
              <li><span>Zero Data Overwrite</span></li>
              <li><span>Transparent Reversion</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E3E5E9] pt-6 flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#8A93A3] gap-2">
          <span>&copy; {new Date().getFullYear()} WhoUsesAI.com — Open community directory.</span>
          <span>Powered by SQLite &amp; Cloudflare D1 Architecture</span>
        </div>
      </div>
    </footer>
  );
}
