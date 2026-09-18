import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ExploreDirectory from '@/components/ExploreDirectory';
import JsonLd from '@/components/JsonLd';
import { getEntities } from '@/lib/db';
import { buildDirectoryJsonLd } from '@/lib/public-record';
import { SITE_NAME } from '@/lib/site-assets';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explore AI adoption',
  description: `Browse documented AI use by organisation, category, or AI tool in the ${SITE_NAME} public directory.`,
  alternates: { canonical: `${SITE_URL}/explore` },
  robots: { index: true, follow: true },
};

type PageProps = {
  searchParams: Promise<{ type?: string; tool?: string }>;
};

export default async function ExplorePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawInitialType = params.type || 'all';
  const initialType =
    rawInitialType === 'all'
      ? 'all'
      : rawInitialType === 'university'
        ? 'university_research'
        : rawInitialType === 'non-profit'
          ? 'organisation'
          : rawInitialType;
  const initialTool = params.tool || '';
  const entities = await getEntities();

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col font-sans">
      <JsonLd data={buildDirectoryJsonLd(entities)} />
      <Navbar />
      <ExploreDirectory
        entities={entities}
        initialType={initialType}
        initialTool={initialTool}
      />
      <Footer />
    </div>
  );
}
