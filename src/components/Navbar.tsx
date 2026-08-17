'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Home,
  Layers,
  Menu,
  Plus,
  X,
} from 'lucide-react';
import { SITE_NAME, siteAssets } from '@/lib/site-assets';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-[#E3E5E9] bg-white py-2.5 md:py-3 sticky top-0 z-40 shadow-[0_1px_3px_rgba(30,42,58,0.03)]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center group">
          <img
            src={siteAssets.logo.svg}
            alt={SITE_NAME}
            className="h-[52px] w-auto md:h-[96px]"
          />
        </Link>

        {/* Primary Desktop Navigation */}
        <div className="hidden md:flex items-center gap-7 text-[14px]">
          <Link
            href="/"
            className="text-[#5B6472] hover:text-[#3F4FBF] transition-colors flex items-center gap-2 font-medium"
          >
            <Home className="w-4 h-4 text-[#8A93A3]" />
            Home
          </Link>
          <Link
            href="/explore"
            className="text-[#5B6472] hover:text-[#3F4FBF] transition-colors flex items-center gap-2 font-medium"
          >
            <BookOpen className="w-4 h-4 text-[#8A93A3]" />
            Explore Directory
          </Link>
          <Link
            href="/tools"
            className="text-[#5B6472] hover:text-[#3F4FBF] transition-colors flex items-center gap-2 font-medium"
          >
            <Layers className="w-4 h-4 text-[#8A93A3]" />
            AI Tools
          </Link>
          <Link
            href="/add"
            className="btn btn-forest text-[13.5px] font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entity</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="md:hidden p-2 rounded-md text-[#1E2A3A] hover:bg-[#F8F9FB] border border-[#E3E5E9] transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-[#1E2A3A]" /> : <Menu className="w-5 h-5 text-[#1E2A3A]" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E3E5E9] bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[14.5px] text-[#1E2A3A] hover:bg-[#F8F9FB] font-medium transition-colors"
          >
            <Home className="w-4 h-4 text-[#3F4FBF]" />
            Home
          </Link>
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[14.5px] text-[#1E2A3A] hover:bg-[#F8F9FB] font-medium transition-colors"
          >
            <BookOpen className="w-4 h-4 text-[#3F4FBF]" />
            Explore Directory
          </Link>
          <Link
            href="/tools"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[14.5px] text-[#1E2A3A] hover:bg-[#F8F9FB] font-medium transition-colors"
          >
            <Layers className="w-4 h-4 text-[#3F4FBF]" />
            AI Tools Directory
          </Link>
          <div className="pt-2 border-t border-[#E3E5E9]">
            <Link
              href="/add"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-forest w-full justify-center text-[14px] font-semibold py-2.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Entity</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
