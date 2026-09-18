import { Entity } from '@/lib/types';
import { slugify } from '@/lib/slug';

export interface ToolEntity {
  id: number;
  slug: string;
  name: string;
  type: string;
  industry: string;
  uses: string[];
}

export interface ToolGroup {
  /** Display name (preferred spelling from claims / catalog). */
  tool: string;
  /** Stable URL segment for `/tools/[slug]`. */
  slug: string;
  entities: ToolEntity[];
}

export const TOOLS_INDEX_TOP = 24;
export const TOOLS_SEARCH_LIMIT = 50;

/** Stable slug for tool detail URLs and claim links. */
export function toolSlug(tool: string): string {
  return slugify(tool);
}

/** @deprecated Prefer toolSlug — kept for older hash-style references. */
export function toolAnchor(tool: string): string {
  return toolSlug(tool);
}

export function groupEntitiesByTool(entities: Entity[]): ToolGroup[] {
  const bySlug = new Map<string, ToolGroup>();

  for (const entity of entities) {
    const content = entity.current_revision?.content;
    if (!content) continue;

    const add = (toolName: string, use?: string) => {
      const name = toolName.trim();
      if (!name) return;
      const slug = toolSlug(name);
      if (!slug) return;

      let group = bySlug.get(slug);
      if (!group) {
        group = { tool: name, slug, entities: [] };
        bySlug.set(slug, group);
      } else if (name.length > group.tool.length) {
        // Prefer a more specific display name when slugs collide.
        group.tool = name;
      }

      const existing = group.entities.find((e) => e.id === entity.id);
      if (existing) {
        if (use && !existing.uses.includes(use)) existing.uses.push(use);
      } else {
        group.entities.push({
          id: entity.id,
          slug: entity.slug,
          name: entity.name,
          type: entity.type,
          industry: entity.industry,
          uses: use ? [use] : [],
        });
      }
    };

    if (content.claims && content.claims.length > 0) {
      for (const claim of content.claims) {
        if (claim.tool) add(claim.tool, claim.use);
      }
    } else if (content.ai_tools) {
      for (const tool of content.ai_tools) add(tool);
    }
  }

  for (const group of bySlug.values()) {
    group.entities.sort((a, b) => a.name.localeCompare(b.name));
  }

  return [...bySlug.values()].sort((a, b) => a.tool.localeCompare(b.tool));
}

export function sortTools(tools: ToolGroup[], sort: 'name' | 'usage' = 'usage'): ToolGroup[] {
  return [...tools].sort((a, b) => {
    if (sort === 'usage') {
      const byCount = b.entities.length - a.entities.length;
      if (byCount !== 0) return byCount;
    }
    return a.tool.localeCompare(b.tool);
  });
}

export function searchTools(tools: ToolGroup[], query: string): ToolGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return tools;

  return tools.filter((item) => {
    if (item.tool.toLowerCase().includes(q)) return true;
    if (item.slug.includes(q)) return true;
    return item.entities.some(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.industry?.toLowerCase().includes(q) ||
        e.uses.some((u) => u.toLowerCase().includes(q))
    );
  });
}

export function findToolBySlug(tools: ToolGroup[], slug: string): ToolGroup | null {
  const normalised = slugify(slug);
  return tools.find((t) => t.slug === normalised) || null;
}
