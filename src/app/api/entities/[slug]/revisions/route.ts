import { NextRequest, NextResponse } from 'next/server';
import { getEntityBySlug, getEntityRevisions, createRevision } from '@/lib/db';
import { RevisionContent } from '@/lib/types';
import { isEntityType } from '@/lib/entityTypes';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const entity = await getEntityBySlug(slug);

    if (!entity) {
      return NextResponse.json({ success: false, error: 'Entity not found' }, { status: 404 });
    }

    const revisions = await getEntityRevisions(entity.id);
    return NextResponse.json({ success: true, entity, revisions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const entity = await getEntityBySlug(slug);

    if (!entity) {
      return NextResponse.json({ success: false, error: 'Entity not found' }, { status: 404 });
    }

    const body = await request.json();
    const { content, edit_summary, editor_id, base_revision_id } = body as {
      content: RevisionContent;
      edit_summary?: string;
      editor_id?: string;
      base_revision_id?: number;
    };

    if (!content || !content.name || !content.description) {
      return NextResponse.json({ success: false, error: 'Invalid content data' }, { status: 400 });
    }

    if (!content.type || !isEntityType(content.type)) {
      return NextResponse.json({ success: false, error: 'Invalid entity type' }, { status: 400 });
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

    const result = await createRevision(entity.id, content, {
      editSummary: edit_summary || 'Updated entry details',
      editorId: editor_id || 'Anonymous Contributor',
      baseRevisionId: base_revision_id,
      actionType: 'edit'
    });

    if (result.conflict) {
      return NextResponse.json(
        {
          success: false,
          conflict: true,
          message: 'This entry was changed while you were editing it. Please review the latest revision before saving.',
          currentEntity: result.currentEntity
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, revision: result.revision }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
