'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCheck,
  GitBranch,
  Globe,
} from 'lucide-react';
import { siteAssets } from '@/lib/site-assets';

export default function Footer() {
  return (
    <footer className="border-t border-[#E3E5E9] pt-12 pb-8 bg-white mt-auto font-sans">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src={siteAssets.logo.svg}
                alt="WhoUsesAI.com"
                className="h-[36px] w-auto"
              />
            </div>
            <h4 className="serif text-[17px] font-semibold text-[#1E2A3A]">
              A public record of AI adoption
            </h4>
            <p className="text-[13.5px] text-[#5B6472] leading-relaxed">
              WhoUsesAI is an open, community-built directory documenting{' '}
              <strong className="font-semibold text-[#1E2A3A]">
                who is using AI, what they&apos;re using it for, and the evidence behind each claim.
              </strong>
            </p>
            <p className="text-[13.5px] text-[#5B6472] leading-relaxed">
              There is no single authority deciding what the record should say. Claims can be challenged and corrected by anyone, while previous versions remain available for anyone to inspect.
            </p>
            <div className="flex flex-wrap gap-3 text-[12px] text-[#8A93A3] pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCheck className="w-3 h-3 text-[#3F4FBF]" />
                Evidence-Based
              </span>
              <span className="flex items-center gap-1.5">
                <GitBranch className="w-3 h-3 text-[#3F4FBF]" />
                Append-Only
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-[#3F4FBF]" />
                Open Access
              </span>
            </div>
          </div>

          {/* Directory */}
          <div>
            <h4 className="text-[12px] tracking-[0.08em] text-[#8A93A3] uppercase mb-4 font-semibold font-sans">
              Directory
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

          {/* Transparency */}
          <div>
            <h4 className="text-[12px] tracking-[0.08em] text-[#8A93A3] uppercase mb-4 font-semibold font-sans">
              Transparency
            </h4>
            <ul className="space-y-2.5 text-[13.5px] text-[#5B6472]">
              <li><Link href="/admin" className="hover:text-[#3F4FBF] transition-colors">Revision History</Link></li>
              <li><Link href="/admin" className="hover:text-[#3F4FBF] transition-colors">Moderation &amp; Audit Stream</Link></li>
              <li><Link href="/admin" className="hover:text-[#3F4FBF] transition-colors">Reported Content</Link></li>
            </ul>
          </div>

          {/* How it works */}
          <div>
            <h4 className="text-[12px] tracking-[0.08em] text-[#8A93A3] uppercase mb-4 font-semibold font-sans">
              How it works
            </h4>
            <ul className="space-y-3 text-[13.5px] text-[#5B6472]">
              <li>
                <span className="font-semibold text-[#1E2A3A]">1. Document</span>
                <span className="block mt-0.5">Add an organisation and provide evidence of its AI use.</span>
              </li>
              <li>
                <span className="font-semibold text-[#1E2A3A]">2. Challenge</span>
                <span className="block mt-0.5">If you think something is wrong or outdated, submit a correction with your evidence.</span>
              </li>
              <li>
                <span className="font-semibold text-[#1E2A3A]">3. Preserve</span>
                <span className="block mt-0.5">The original isn&apos;t deleted. Your correction becomes a new version of the record.</span>
              </li>
              <li>
                <span className="font-semibold text-[#1E2A3A]">4. Compare</span>
                <span className="block mt-0.5">Anyone can inspect the evidence and revision history.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E3E5E9] pt-6 text-[12px] text-[#8A93A3]">
          <span>&copy; {new Date().getFullYear()} WhoUsesAI.com — Open community directory.</span>
        </div>
      </div>
    </footer>
  );
}
