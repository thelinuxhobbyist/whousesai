import { NextRequest, NextResponse } from 'next/server';
import { getEntityBySlug } from '@/lib/db';

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

    return NextResponse.json({ success: true, entity });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
