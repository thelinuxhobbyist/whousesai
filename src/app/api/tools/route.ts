import { NextResponse } from 'next/server';
import { getEntities } from '@/lib/db';
import { groupEntitiesByTool } from '@/lib/tools-index';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const entities = await getEntities();
    const tools = groupEntitiesByTool(entities);
    return NextResponse.json({ success: true, tools });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
