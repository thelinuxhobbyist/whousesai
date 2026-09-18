import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolsDirectory from '@/components/ToolsDirectory';
import { getEntities } from '@/lib/db';
import { groupEntitiesByTool } from '@/lib/tools-index';
import { SITE_NAME } from '@/lib/site-assets';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI tools index',
  description: `Every AI tool documented in the ${SITE_NAME} directory, mapped to the organisations using it.`,
  alternates: { canonical: `${SITE_URL}/tools` },
  robots: { index: true, follow: true },
};

export default async function ToolsIndexPage() {
  const entities = await getEntities();
  const tools = groupEntitiesByTool(entities);

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col font-sans">
      <Navbar />
      <ToolsDirectory tools={tools} />
      <Footer />
    </div>
  );
}
