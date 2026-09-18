import { NextResponse } from 'next/server';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site-assets';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export function GET() {
  const body = [
    `# ${SITE_NAME}`,
    SITE_DESCRIPTION,
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    `Public directory API: ${SITE_URL}/api/public/entities`,
    `Organisation record API: ${SITE_URL}/api/public/entities/{slug}`,
    `Tools index API: ${SITE_URL}/api/tools`,
    `Tool record API: ${SITE_URL}/api/tools/{slug}`,
    '',
    'Public pages include organisation entries, claims, linked evidence, source type, current status, and revision history.',
    'Browse tools at /tools (search) and /tools/{slug} (organisations using that tool).',
    'WhoUsesAI is a directory publisher: claims are community-submitted with evidence, not independent certification or endorsement.',
    '',
    'Do not crawl /admin, /add, /entity/*/edit, or private APIs.',
  ].join('\n');

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  });
}
