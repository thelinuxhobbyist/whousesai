'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { EntityType, RevisionContent, SourceItem } from '@/lib/types';
import { ENTITY_TYPE_OPTIONS, getEntityTypeLabel } from '@/lib/entityTypes';
import Link from 'next/link';
import {
  PlusCircle,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Building2,
  Users,
  Landmark,
  GraduationCap,
  HelpCircle,
} from 'lucide-react';

type Step = 'type' | 'name' | 'details';

const TYPE_ICONS = {
  company: Building2,
  organisation: Users,
  government: Landmark,
  university_research: GraduationCap,
  other: HelpCircle,
} as const;

export default function AddEntityPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('type');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<EntityType | null>(null);
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [aiUses, setAiUses] = useState<string[]>([]);
  const [newUseInput, setNewUseInput] = useState('');
  const [aiTools, setAiTools] = useState<string[]>([]);
  const [newToolInput, setNewToolInput] = useState('');
  const [sources, setSources] = useState<SourceItem[]>([{ title: '', url: '' }]);
  const [editSummary] = useState('Initial entry creation');
  const [editorId] = useState('Anonymous Contributor');

  const handleAddUse = () => {
    if (newUseInput.trim() && !aiUses.includes(newUseInput.trim())) {
      setAiUses([...aiUses, newUseInput.trim()]);
      setNewUseInput('');
    }
  };

  const handleRemoveUse = (index: number) => {
    setAiUses(aiUses.filter((_, i) => i !== index));
  };

  const handleAddTool = () => {
    const tool = newToolInput.trim();
    if (tool && !aiTools.includes(tool)) {
      setAiTools([...aiTools, tool]);
      setNewToolInput('');
    }
  };

  const handleRemoveTool = (index: number) => {
    setAiTools(aiTools.filter((_, i) => i !== index));
  };

  const handleAddSource = () => {
    setSources([...sources, { title: '', url: '' }]);
  };

  const handleUpdateSource = (index: number, field: 'title' | 'url', value: string) => {
    const updated = [...sources];
    updated[index][field] = value;
    setSources(updated);
  };

  const handleRemoveSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  const handleSelectType = (value: EntityType) => {
    setType(value);
    setStep('name');
  };

  const handleNameContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return;

    setSaving(true);
    setErrorMessage(null);

    const content: RevisionContent = {
      name: name.trim(),
      type,
      industry,
      country,
      description,
      ai_uses: aiUses,
      ai_tools: aiTools,
      sources: sources.filter((s) => s.url.trim().length > 0),
    };

    try {
      const res = await fetch('/api/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          edit_summary: editSummary.trim() || 'Initial entry creation',
          editor_id: editorId.trim() || 'Anonymous Contributor',
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned ${res.status}. Please try again.`);
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Failed to create entity (${res.status})`);
      }

      router.push(`/entity/${data.entity.slug}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col font-sans">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8 w-full flex-grow">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-[#5B6472] hover:text-[#3F4FBF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel & Return Home
        </Link>

        <div className="space-y-2">
          <h1 className="serif text-2xl sm:text-4xl font-semibold text-[#1E2A3A] tracking-tight flex items-center gap-3">
            <PlusCircle className="w-7 h-7 sm:w-8 sm:h-8 text-[#3F4FBF]" />
            Add New Entry to WhoUsesAI
          </h1>
          <p className="text-[13.5px] sm:text-[14.5px] text-[#5B6472]">
            Document a company, organisation or public body that uses AI. No account required.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-[6px] bg-[#A85238]/10 border border-[#A85238]/30 p-4 text-[13.5px] text-[#A85238]">
            {errorMessage}
          </div>
        )}

        {/* Step 1: What are you adding? */}
        {step === 'type' && (
          <div className="space-y-5">
            <div>
              <h2 className="serif text-[22px] sm:text-[24px] font-semibold text-[#1E2A3A]">
                What are you adding?
              </h2>
              <p className="mt-1 text-[13.5px] text-[#5B6472]">
                Choose the option that best fits. This helps people browse the directory.
              </p>
            </div>

            <div className="space-y-2.5">
              {ENTITY_TYPE_OPTIONS.map((option) => {
                const Icon = TYPE_ICONS[option.value];
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelectType(option.value)}
                    className="w-full text-left rounded-[6px] bg-white border border-[#E3E5E9] p-4 sm:p-5 hover:border-[#3F4FBF] hover:bg-[#F8F9FB] transition-colors shadow-[0_1px_2px_rgba(30,42,58,0.05)] group"
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#EEEDFE] text-[#3F4FBF] border border-[#E3E5E9] group-hover:border-[#3F4FBF]/30">
                        <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[15.5px] font-semibold text-[#1E2A3A]">{option.label}</div>
                        <p className="mt-0.5 text-[13px] text-[#5B6472] leading-relaxed">
                          {option.description}
                        </p>
                        {option.examples ? (
                          <p className="mt-1.5 text-[12px] text-[#8A93A3]">
                            e.g. {option.examples}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Who or what are you adding? */}
        {step === 'name' && type && (
          <form onSubmit={handleNameContinue} className="space-y-5">
            <button
              type="button"
              onClick={() => setStep('type')}
              className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-[#5B6472] hover:text-[#3F4FBF] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Change type
            </button>

            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#8A93A3] mb-2">
                Type: {getEntityTypeLabel(type)}
              </p>
              <h2 className="serif text-[22px] sm:text-[24px] font-semibold text-[#1E2A3A]">
                Who or what are you adding?
              </h2>
              <p className="mt-1 text-[13.5px] text-[#5B6472]">
                Enter the name of the organisation as people would recognise it.
              </p>
            </div>

            <div className="rounded-[6px] bg-white border border-[#E3E5E9] p-5 sm:p-6 shadow-[0_1px_2px_rgba(30,42,58,0.05)] space-y-4">
              <div>
                <label className="block text-[11.5px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1.5 font-sans">
                  Name *
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Microsoft, NHS, University of Oxford"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3.5 py-2.5 text-sm text-[#1E2A3A] placeholder:text-[#8A93A3] focus:border-[#3F4FBF] focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="btn btn-forest text-base px-6 py-3 font-semibold disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Step 3: Remaining entry details */}
        {step === 'details' && type && (
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <button
              type="button"
              onClick={() => setStep('name')}
              className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-[#5B6472] hover:text-[#3F4FBF] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Change name
            </button>

            <div className="rounded-[6px] bg-white border border-[#E3E5E9] px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
              <span className="font-semibold text-[#1E2A3A]">{name}</span>
              <span className="text-[#E3E5E9]">·</span>
              <span className="text-[#5B6472]">{getEntityTypeLabel(type)}</span>
              <button
                type="button"
                onClick={() => setStep('type')}
                className="ml-auto text-[12px] font-semibold text-[#3F4FBF] hover:underline"
              >
                Change
              </button>
            </div>

            <div className="space-y-4 rounded-[6px] bg-white border border-[#E3E5E9] p-5 sm:p-6 shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
              <h3 className="serif text-[18px] sm:text-[19px] font-semibold text-[#1E2A3A] border-b border-[#E3E5E9] pb-3">
                1. Basic Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1.5 font-sans">
                    Industry / Sector *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Music Streaming, Media"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    required
                    className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3.5 py-2 text-sm text-[#1E2A3A] placeholder:text-[#8A93A3] placeholder:truncate focus:border-[#3F4FBF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1.5 font-sans">
                    Country / Region *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sweden, UK, United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3.5 py-2 text-sm text-[#1E2A3A] placeholder:text-[#8A93A3] placeholder:truncate focus:border-[#3F4FBF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1.5 font-sans">
                  Overview of AI Use *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                  placeholder="Explain how this organisation uses AI in production or operations..."
                  className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] p-3.5 text-sm text-[#1E2A3A] placeholder:text-[#8A93A3] placeholder:truncate focus:border-[#3F4FBF] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-[6px] bg-white border border-[#E3E5E9] p-5 sm:p-6 shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
              <h3 className="serif text-[18px] sm:text-[19px] font-semibold text-[#1E2A3A] border-b border-[#E3E5E9] pb-3">
                2. AI Applications & Use Cases
              </h3>

              <div className="flex flex-wrap gap-2">
                {aiUses.map((use, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#F8F9FB] text-[#1E2A3A] text-xs font-medium border border-[#E3E5E9]"
                  >
                    {use}
                    <button
                      type="button"
                      onClick={() => handleRemoveUse(idx)}
                      className="hover:text-[#A85238]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add application (e.g. Recommendations)..."
                  value={newUseInput}
                  onChange={(e) => setNewUseInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUse();
                    }
                  }}
                  className="flex-grow min-w-0 rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3.5 py-2 text-sm text-[#1E2A3A] placeholder:text-[#8A93A3] placeholder:truncate focus:border-[#3F4FBF] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddUse}
                  className="px-4 py-2 rounded bg-[#F3F4F6] text-xs font-semibold text-[#1E2A3A] border border-[#E3E5E9] hover:bg-[#E3E5E9] shrink-0"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-4 rounded-[6px] bg-white border border-[#E3E5E9] p-5 sm:p-6 shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
              <h3 className="serif text-[18px] sm:text-[19px] font-semibold text-[#1E2A3A] border-b border-[#E3E5E9] pb-3">
                3. AI Tools Deployed
              </h3>

              {aiTools.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {aiTools.map((tool, idx) => (
                    <span
                      key={`${tool}-${idx}`}
                      className="mono inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#EEEDFE] text-[#3F4FBF] text-xs font-medium border border-[#E3E5E9]"
                    >
                      {tool}
                      <button
                        type="button"
                        onClick={() => handleRemoveTool(idx)}
                        className="hover:text-[#A85238]"
                        aria-label={`Remove ${tool}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#8A93A3]">No tools added yet.</p>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="AI tool name..."
                  value={newToolInput}
                  onChange={(e) => setNewToolInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTool();
                    }
                  }}
                  className="mono flex-grow min-w-0 rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3.5 py-2 text-sm text-[#1E2A3A] placeholder:text-[#8A93A3] placeholder:truncate focus:border-[#3F4FBF] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTool}
                  className="px-4 py-2 rounded bg-[#F3F4F6] text-xs font-semibold text-[#1E2A3A] border border-[#E3E5E9] hover:bg-[#E3E5E9] shrink-0"
                >
                  Add Tool
                </button>
              </div>
            </div>

            <div className="space-y-4 rounded-[6px] bg-white border border-[#E3E5E9] p-5 sm:p-6 shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
              <div className="flex items-center justify-between border-b border-[#E3E5E9] pb-3">
                <h3 className="serif text-[18px] sm:text-[19px] font-semibold text-[#1E2A3A]">
                  4. Sources & Evidence
                </h3>
                <button
                  type="button"
                  onClick={handleAddSource}
                  className="flex items-center gap-1 text-xs font-semibold text-[#3F4FBF] hover:underline"
                >
                  <Plus className="w-4 h-4" /> Add Source
                </button>
              </div>

              <div className="space-y-3">
                {sources.map((src, idx) => (
                  <div key={idx} className="p-3.5 rounded bg-[#F8F9FB] border border-[#E3E5E9] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#8A93A3]">Source #{idx + 1}</span>
                      {sources.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSource(idx)}
                          className="text-xs text-[#A85238] hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Source Title (e.g. Official Blog Post)"
                      value={src.title}
                      onChange={(e) => handleUpdateSource(idx, 'title', e.target.value)}
                      className="w-full rounded bg-white border border-[#E3E5E9] px-3 py-1.5 text-xs text-[#1E2A3A] placeholder:text-[#8A93A3] placeholder:truncate focus:outline-none"
                    />
                    <input
                      type="url"
                      placeholder="Source URL (e.g. https://example.com/news)"
                      value={src.url}
                      onChange={(e) => handleUpdateSource(idx, 'url', e.target.value)}
                      className="mono w-full rounded bg-white border border-[#E3E5E9] px-3 py-1.5 text-xs text-[#1E2A3A] placeholder:text-[#8A93A3] placeholder:truncate focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 pt-4">
              {errorMessage && (
                <div className="sm:mr-auto rounded-[6px] bg-[#A85238]/10 border border-[#A85238]/30 px-3 py-2 text-[13px] text-[#A85238]">
                  {errorMessage}
                </div>
              )}
              <Link href="/" className="px-5 py-3 text-sm font-semibold text-[#5B6472] hover:text-[#1E2A3A] text-center">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-forest text-base px-6 py-3 font-semibold disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Creating Entry...' : 'Publish Entry'}</span>
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
