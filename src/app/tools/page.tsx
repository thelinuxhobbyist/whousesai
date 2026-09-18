import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolsDirectory from '@/components/ToolsDirectory';
import { getEntities } from '@/lib/db';
import {
  groupEntitiesByTool,
  searchTools,
  sortTools,
  TOOLS_INDEX_TOP,
  TOOLS_SEARCH_LIMIT,
} from '@/lib/tools-index';
import { SITE_NAME } from '@/lib/site-assets';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI tools index',
  description: `Search AI tools documented in the ${SITE_NAME} directory and open each tool to see which organisations use it.`,
  alternates: { canonical: `${SITE_URL}/tools` },
  robots: { index: true, follow: true },
};

type PageProps = {
  searchParams: Promise<{ q?: string; sort?: string }>;
};

export default async function ToolsIndexPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (params.q || '').trim();
  const sort = params.sort === 'name' ? 'name' : 'usage';

  const entities = await getEntities();
  const allTools = groupEntitiesByTool(entities);
  const sorted = sortTools(allTools, sort);
  const mode = query ? 'search' : 'top';
  const tools =
    mode === 'search'
      ? searchTools(sorted, query).slice(0, TOOLS_SEARCH_LIMIT)
      : sorted.slice(0, TOOLS_INDEX_TOP);

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col font-sans">
      <Navbar />
      <ToolsDirectory
        tools={tools}
        totalDocumented={allTools.length}
        initialQuery={query}
        initialSort={sort}
        mode={mode}
      />
      <Footer />
    </div>
  );
}
