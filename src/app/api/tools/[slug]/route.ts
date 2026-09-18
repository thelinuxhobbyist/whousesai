import { NextResponse } from 'next/server';
import { getAIToolBySlug, getEntities } from '@/lib/db';
import { findToolBySlug, groupEntitiesByTool } from '@/lib/tools-index';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const entities = await getEntities();
    const group = findToolBySlug(groupEntitiesByTool(entities), slug);
    if (!group) {
      return NextResponse.json({ success: false, error: 'Tool not found' }, { status: 404 });
    }

    const catalog = await getAIToolBySlug(group.slug);

    return NextResponse.json({
      success: true,
      tool: {
        name: group.tool,
        slug: group.slug,
        description: catalog?.description || null,
        category: catalog?.category || null,
        website: catalog?.website || null,
        organisation_count: group.entities.length,
        organisations: group.entities,
        url: `/tools/${group.slug}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
