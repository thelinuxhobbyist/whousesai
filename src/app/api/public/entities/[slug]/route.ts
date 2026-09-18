import { NextResponse } from 'next/server';
import { getEntityBySlug, getEntityRevisions, getReportsForEntity } from '@/lib/db';
import { buildPublicEntityRecord } from '@/lib/public-record';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const entity = await getEntityBySlug(slug);
    if (!entity?.current_revision) {
      return NextResponse.json({ success: false, error: 'Entity not found' }, { status: 404 });
    }

    const [revisions, reports] = await Promise.all([
      getEntityRevisions(entity.id),
      getReportsForEntity(entity.id),
    ]);

    return NextResponse.json(
      {
        success: true,
        entity: buildPublicEntityRecord(entity, revisions, reports),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
