import { NextRequest, NextResponse } from 'next/server';
import { getEntityBySlug, getRevisionById, revertToRevision } from '@/lib/db';
import { REVERT_REASONS, RevertReason } from '@/lib/types';

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
    const {
      target_revision_id,
      editor_id,
      reason,
      comment
    } = body as {
      target_revision_id?: number;
      editor_id?: string;
      reason?: string;
      comment?: string;
    };

    if (!target_revision_id) {
      return NextResponse.json(
        { success: false, error: 'Target revision ID is required' },
        { status: 400 }
      );
    }

    if (!reason || !REVERT_REASONS.includes(reason as RevertReason)) {
      return NextResponse.json(
        { success: false, error: 'A valid revert reason is required' },
        { status: 400 }
      );
    }

    const target = await getRevisionById(Number(target_revision_id));
    if (!target || target.entity_id !== entity.id) {
      return NextResponse.json(
        { success: false, error: 'Target revision not found for this entity' },
        { status: 404 }
      );
    }

    const revision = await revertToRevision(entity.id, Number(target_revision_id), {
      editorId: editor_id || 'Anonymous Contributor',
      reason,
      comment
    });

    return NextResponse.json({ success: true, revision }, { status: 201 });
  } catch (error: any) {
    const message = error?.message || 'Failed to revert revision';
    const status =
      message.includes('Cannot revert the first revision') ||
      message.includes('does not belong') ||
      message.includes('does not exist')
        ? 400
        : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
