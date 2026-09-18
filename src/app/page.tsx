import type { Metadata } from 'next';
import HomeDirectory from '@/components/HomeDirectory';
import JsonLd from '@/components/JsonLd';
import { getEntities } from '@/lib/db';
import { buildDirectoryJsonLd } from '@/lib/public-record';
import { SITE_DESCRIPTION } from '@/lib/site-assets';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
};

export default async function HomePage() {
  const entities = await getEntities();

  return (
    <>
      <JsonLd data={buildDirectoryJsonLd(entities)} />
      <HomeDirectory entities={entities} />
    </>
  );
}
