import { NextRequest, NextResponse } from 'next/server';
import { getEntityBySlug, revertToRevision } from '@/lib/db';

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
    const { target_revision_id, editor_id } = body;

    if (!target_revision_id) {
      return NextResponse.json({ success: false, error: 'Target revision ID is required' }, { status: 400 });
    }

    const revision = await revertToRevision(
      entity.id,
      Number(target_revision_id),
      editor_id || 'Anonymous Contributor'
    );

    return NextResponse.json({ success: true, revision }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
