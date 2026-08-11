import { NextRequest, NextResponse } from 'next/server';
import { getReports, createReport, updateReportStatus } from '@/lib/db';

export async function GET() {
  try {
    const reports = await getReports();
    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entity_id, revision_id, reason, details } = body;

    if (!entity_id || !revision_id || !reason || !details) {
      return NextResponse.json({ success: false, error: 'Missing required report fields' }, { status: 400 });
    }

    const report = await createReport(Number(entity_id), Number(revision_id), reason, details);
    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { report_id, status } = body;

    if (!report_id || !status) {
      return NextResponse.json({ success: false, error: 'report_id and status are required' }, { status: 400 });
    }

    await updateReportStatus(Number(report_id), status);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
