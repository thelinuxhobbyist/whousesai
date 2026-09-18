import { NextRequest, NextResponse } from 'next/server';
import { getEntities } from '@/lib/db';
import {
  groupEntitiesByTool,
  searchTools,
  sortTools,
  TOOLS_INDEX_TOP,
  TOOLS_SEARCH_LIMIT,
} from '@/lib/tools-index';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = (searchParams.get('q') || '').trim();
    const sort = searchParams.get('sort') === 'name' ? 'name' : 'usage';
    const limitRaw = Number(searchParams.get('limit'));
    const offsetRaw = Number(searchParams.get('offset'));
    const defaultLimit = q ? TOOLS_SEARCH_LIMIT : TOOLS_INDEX_TOP;
    const limit = Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(Math.floor(limitRaw), 100)
      : defaultLimit;
    const offset = Number.isFinite(offsetRaw) && offsetRaw > 0 ? Math.floor(offsetRaw) : 0;

    const entities = await getEntities();
    const all = sortTools(groupEntitiesByTool(entities), sort);
    const matched = q ? searchTools(all, q) : all;
    const tools = matched.slice(offset, offset + limit).map((t) => ({
      name: t.tool,
      slug: t.slug,
      organisation_count: t.entities.length,
      organisations: t.entities.map((e) => ({
        slug: e.slug,
        name: e.name,
        uses: e.uses,
      })),
      url: `/tools/${t.slug}`,
    }));

    return NextResponse.json({
      success: true,
      query: q || null,
      sort,
      total: matched.length,
      documented: all.length,
      limit,
      offset,
      tools,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
