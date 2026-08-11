import { NextResponse } from 'next/server';
import { getAITools } from '@/lib/db';

export async function GET() {
  try {
    const tools = await getAITools();
    return NextResponse.json({ success: true, tools });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
