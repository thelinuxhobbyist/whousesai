import type { MetadataRoute } from 'next';
import { getEntities } from '@/lib/db';
import { entityHistoryUrl, entityUrl, SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  try {
    const entities = await getEntities();
    for (const entity of entities) {
      const lastModified = entity.updated_at ? new Date(entity.updated_at) : now;
      entries.push({
        url: entityUrl(entity.slug),
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
      entries.push({
        url: entityHistoryUrl(entity.slug),
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
  } catch (error) {
    console.error('sitemap generation failed', error);
  }

  return entries;
}
