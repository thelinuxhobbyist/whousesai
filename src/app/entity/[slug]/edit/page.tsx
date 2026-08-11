'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Entity, EntityType, RevisionContent, SourceItem } from '@/lib/types';
import { normalizeEntityType } from '@/lib/entityTypes';
import Link from 'next/link';
import { Plus, Trash2, ArrowLeft, Save, AlertTriangle, RefreshCw } from 'lucide-react';

export default function EditEntityPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<EntityType>('company');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [aiUses, setAiUses] = useState<string[]>([]);
  const [newUseInput, setNewUseInput] = useState('');
  const [aiTools, setAiTools] = useState<string[]>([]);
  const [newToolInput, setNewToolInput] = useState('');
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [editSummary, setEditSummary] = useState('');
  const [editorId, setEditorId] = useState('Anonymous Contributor');

  // Conflict handling
  const [conflictModal, setConflictModal] = useState(false);
  const [latestRevNumber, setLatestRevNumber] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchEntity();
    }
  }, [slug]);

  const fetchEntity = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/entities/${slug}`);
      const data = await res.json();
      if (data.success && data.entity && data.entity.current_revision) {
        const ent = data.entity;
        const rev = ent.current_revision.content;
        setEntity(ent);
        setName(ent.name);
        setType(
          String(ent.type) === 'person'
            ? 'other'
            : normalizeEntityType(String(ent.type))
        );
        setIndustry(ent.industry);
        setCountry(ent.country);
        setDescription(rev.description || '');
        setAiUses(rev.ai_uses || []);
        setAiTools(rev.ai_tools || []);
        setSources(rev.sources || [{ title: '', url: '' }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent, forceNewBase = false) => {
    e.preventDefault();
    if (!entity || !entity.current_revision) return;

    setSaving(true);
    setErrorMessage(null);
    setConflictModal(false);

    const updatedContent: RevisionContent = {
      name,
      type,
      industry,
      country,
      description,
      ai_uses: aiUses,
      ai_tools: aiTools,
      sources: sources.filter((s) => s.url.trim().length > 0)
    };

    const baseRevId = forceNewBase && entity.current_revision ? entity.current_revision.id : entity.current_revision.id;

    try {
      const res = await fetch(`/api/entities/${slug}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_revision_id: baseRevId,
          content: updatedContent,
          edit_summary: editSummary.trim() || `Updated details for ${name}`,
          editor_id: editorId.trim() || 'Anonymous Contributor'
        })
      });

      const data = await res.json();

      if (res.status === 409) {
        // Concurrency conflict detected!
        setLatestRevNumber(data.latest_revision_number);
        setConflictModal(true);
        setSaving(false);
        return;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to save edit');
      }

      router.push(`/entity/${slug}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while saving revision.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-20 w-full space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-white rounded border border-[#E3E5E9]" />
          <div className="h-64 bg-white rounded border border-[#E3E5E9]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col">
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-24 text-center space-y-4">
          <h2 className="serif text-2xl font-semibold">Entity Not Found</h2>
          <Link href="/" className="btn btn-forest text-sm">
            Return to Directory
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentRevNumber = entity.current_revision?.revision_number || 1;

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col font-sans">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8 w-full flex-grow">
        <Link
          href={`/entity/${slug}`}
          className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-[#5B6472] hover:text-[#3F4FBF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel & Return to Entry
        </Link>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="serif text-2xl sm:text-4xl font-semibold text-[#1E2A3A] tracking-tight">
              Edit: {entity.name}
            </h1>
            <span className="mono text-[11px] text-[#3F4FBF] bg-[#F8F9FB] border border-[#E3E5E9] px-2.5 py-1 rounded font-semibold">
              Creating Rev #{currentRevNumber + 1}
            </span>
          </div>
          <p className="text-[13.5px] sm:text-[14.5px] text-[#5B6472]">
            Every edit creates a transparent revision. Previous revisions remain preserved.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-[6px] bg-[#A85238]/10 border border-[#A85238]/30 p-4 text-[13.5px] text-[#A85238]">
            {errorMessage}
          </div>
        )}

        {entity && String(entity.type) === 'person' && (
          <div className="rounded-[6px] bg-[#EEEDFE] border border-[#3F4FBF]/25 p-4 text-[13.5px] text-[#5B6472]">
            This entry was previously typed as <span className="font-semibold text-[#1E2A3A]">Person</span>.
            Please choose a directory type (Company, Organisation, Government, University &amp; Research, or Other) before saving.
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6 sm:space-y-8">
          {/* Basic Information */}
          <div className="space-y-4 rounded-[6px] bg-white border border-[#E3E5E9] p-5 sm:p-6 shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
            <h3 className="serif text-[18px] sm:text-[19px] font-semibold text-[#1E2A3A] border-b border-[#E3E5E9] pb-3">
              1. Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11.5px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1.5 font-sans">
                  Entity Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3.5 py-2 text-sm text-[#1E2A3A] focus:border-[#3F4FBF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1.5 font-sans">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as EntityType)}
                  className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3.5 py-2 text-sm text-[#1E2A3A] focus:border-[#3F4FBF] focus:outline-none"
                >
                  <option value="company">Company</option>
                  <option value="organisation">Organisation</option>
                  <option value="government">Government</option>
                  <option value="university_research">University &amp; Research</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1.5 font-sans">
                  Industry / Sector
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                  className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3.5 py-2 text-sm text-[#1E2A3A] focus:border-[#3F4FBF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1.5 font-sans">
                  Country / Region
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3.5 py-2 text-sm text-[#1E2A3A] focus:border-[#3F4FBF] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1.5 font-sans">
                Overview of AI Use
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
                className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] p-3.5 text-sm text-[#1E2A3A] focus:border-[#3F4FBF] focus:outline-none"
              />
            </div>
          </div>

          {/* AI Applications */}
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
                placeholder="Add application..."
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

          {/* AI Tools */}
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

          {/* Sources */}
          <div className="space-y-4 rounded-[6px] bg-white border border-[#E3E5E9] p-5 sm:p-6 shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
            <div className="flex items-center justify-between border-b border-[#E3E5E9] pb-3">
              <h3 className="serif text-[18px] sm:text-[19px] font-semibold text-[#1E2A3A]">4. Sources & Evidence</h3>
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
                    placeholder="Source Title (e.g. Press Release)"
                    value={src.title}
                    onChange={(e) => handleUpdateSource(idx, 'title', e.target.value)}
                    className="w-full rounded bg-white border border-[#E3E5E9] px-3 py-1.5 text-xs text-[#1E2A3A] placeholder:text-[#8A93A3] placeholder:truncate focus:outline-none"
                  />
                  <input
                    type="url"
                    placeholder="Source URL (e.g. https://example.com/source)"
                    value={src.url}
                    onChange={(e) => handleUpdateSource(idx, 'url', e.target.value)}
                    className="mono w-full rounded bg-white border border-[#E3E5E9] px-3 py-1.5 text-xs text-[#1E2A3A] placeholder:text-[#8A93A3] placeholder:truncate focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail Metadata */}
          <div className="space-y-4 rounded-[6px] bg-white border border-[#E3E5E9] p-5 sm:p-6 shadow-[0_1px_2px_rgba(30,42,58,0.05)]">
            <h3 className="serif text-[18px] sm:text-[19px] font-semibold text-[#1E2A3A] border-b border-[#E3E5E9] pb-3">
              5. Revision Summary & Contributor ID
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11.5px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1.5 font-sans">
                  Edit Summary *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Updated AI tools to include Copilot"
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  required
                  className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3.5 py-2 text-sm text-[#1E2A3A] placeholder:text-[#8A93A3] placeholder:truncate focus:border-[#3F4FBF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1.5 font-sans">
                  Contributor Alias / ID
                </label>
                <input
                  type="text"
                  value={editorId}
                  onChange={(e) => setEditorId(e.target.value)}
                  className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3.5 py-2 text-sm text-[#1E2A3A] placeholder:text-[#8A93A3] placeholder:truncate focus:border-[#3F4FBF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              href={`/entity/${slug}`}
              className="px-5 py-3 text-sm font-semibold text-[#5B6472] hover:text-[#1E2A3A]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-forest text-base px-6 py-3 font-semibold disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving Revision...' : 'Save Revision'}</span>
            </button>
          </div>
        </form>
      </main>

      <Footer />

      {/* Concurrency Conflict Modal */}
      {conflictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="max-w-md w-full rounded-[8px] bg-white border border-[#E3E5E9] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-[#A85238]">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="serif text-[20px] font-semibold text-[#1E2A3A]">
                Concurrent Edit Conflict
              </h3>
            </div>

            <p className="text-[14px] text-[#5B6472] leading-relaxed">
              Another contributor published Revision #{latestRevNumber} while you were editing.
              To prevent overwriting changes, you can reload the latest content or force your edit as Revision #{(latestRevNumber || currentRevNumber) + 1}.
            </p>

            <div className="p-3 rounded bg-[#F8F9FB] border border-[#E3E5E9] text-[12.5px] text-[#5B6472]">
              Your edit summary: <span className="font-semibold text-[#1E2A3A]">{editSummary}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => fetchEntity()}
                className="btn btn-outline flex-1 text-xs justify-center"
              >
                <RefreshCw className="w-4 h-4 text-[#3F4FBF]" />
                <span>Reload Latest Version</span>
              </button>

              <button
                onClick={(e) => handleSubmit(e as any, true)}
                className="btn btn-forest flex-1 text-xs justify-center"
              >
                <Save className="w-4 h-4" />
                <span>Force Save New Revision</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
