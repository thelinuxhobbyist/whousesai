import { NextResponse } from 'next/server';
import { getEntities } from '@/lib/db';
import { PUBLIC_API_VERSION } from '@/lib/public-record';
import { SITE_NAME } from '@/lib/site-assets';
import { entityUrl, publicEntityApiUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const entities = await getEntities();
    const organisations = entities.map((entity) => ({
      slug: entity.slug,
      name: entity.name,
      type: entity.type,
      industry: entity.industry,
      country: entity.country,
      url: entityUrl(entity.slug),
      api_url: publicEntityApiUrl(entity.slug),
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      current_revision_number: entity.current_revision?.revision_number ?? null,
      claim_count: entity.current_revision?.content.claims?.length ?? 0,
    }));

    return NextResponse.json(
      {
        success: true,
        api_version: PUBLIC_API_VERSION,
        publisher: SITE_NAME,
        count: organisations.length,
        organisations,
        who_uses_ai: {
          role: 'directory_publisher',
          editorial_status: 'community_published',
          endorsement: false,
        },
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
