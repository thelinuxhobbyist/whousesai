import { NextRequest, NextResponse } from 'next/server';
import { getEntities, createEntity } from '@/lib/db';
import { EntityType, RevisionContent } from '@/lib/types';
import { isEntityType, normalizeEntityType } from '@/lib/entityTypes';

function resolveTypeFilter(raw: string | null): EntityType | 'all' | undefined {
  if (!raw) return undefined;
  if (raw === 'all') return 'all';
  if (raw === 'person') return 'person' as EntityType;
  return normalizeEntityType(raw);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;
    const type = resolveTypeFilter(searchParams.get('type'));
    const industry = searchParams.get('industry') || undefined;
    const tool = searchParams.get('tool') || undefined;
    const useCase = searchParams.get('useCase') || undefined;
    const country = searchParams.get('country') || undefined;

    const entities = await getEntities({ query, type, industry, tool, useCase, country });
    return NextResponse.json({ success: true, entities });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, edit_summary, editor_id } = body as {
      content: RevisionContent;
      edit_summary?: string;
      editor_id?: string;
    };

    if (!content || !content.name || !content.type || !content.description) {
      return NextResponse.json(
        { success: false, error: 'Name, Entity Type, and Description are required' },
        { status: 400 }
      );
    }

    if (!isEntityType(content.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid entity type' },
        { status: 400 }
      );
    }

    const claims = content.claims?.filter((c) => c.use?.trim()) || [];
    if (claims.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one structured claim is required' },
        { status: 400 }
      );
    }

    if (claims.some((c) => !(c.sources || []).some((s) => s.url?.trim()))) {
      return NextResponse.json(
        { success: false, error: 'Each claim must include at least one evidence source URL' },
        { status: 400 }
      );
    }

    const newEntity = await createEntity(
      content,
      edit_summary || 'Created entry',
      editor_id || 'Anonymous Contributor'
    );
    return NextResponse.json({ success: true, entity: newEntity }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
