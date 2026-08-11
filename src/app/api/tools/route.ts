import { NextResponse } from 'next/server';
import { getEntities } from '@/lib/db';

interface ToolEntity {
  id: number;
  slug: string;
  name: string;
  type: string;
  industry: string;
  uses: string[];
}

interface ToolGroup {
  tool: string;
  entities: ToolEntity[];
}

export async function GET() {
  try {
    const entities = await getEntities();
    const byTool = new Map<string, Map<number, ToolEntity>>();

    for (const entity of entities) {
      const content = entity.current_revision?.content;
      if (!content) continue;

      const add = (tool: string, use?: string) => {
        const name = tool.trim();
        if (!name) return;
        if (!byTool.has(name)) byTool.set(name, new Map());
        const group = byTool.get(name)!;
        const existing = group.get(entity.id);
        if (existing) {
          if (use && !existing.uses.includes(use)) existing.uses.push(use);
        } else {
          group.set(entity.id, {
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

    const tools: ToolGroup[] = [...byTool.entries()]
      .map(([tool, entityMap]) => ({
        tool,
        entities: [...entityMap.values()].sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.tool.localeCompare(b.tool));

    return NextResponse.json({ success: true, tools });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
