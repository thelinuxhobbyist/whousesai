import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Layers,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { getAIToolBySlug, getEntities } from '@/lib/db';
import { findToolBySlug, groupEntitiesByTool } from '@/lib/tools-index';
import { SITE_NAME } from '@/lib/site-assets';
import { SITE_URL, toolUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entities = await getEntities();
  const group = findToolBySlug(groupEntitiesByTool(entities), slug);
  if (!group) {
    return {
      title: 'Tool not found',
      robots: { index: false, follow: true },
    };
  }

  const catalog = await getAIToolBySlug(group.slug);
  const title = `Who uses ${group.tool}`;
  const description =
    catalog?.description ||
    `Organisations documented on ${SITE_NAME} as using ${group.tool}, with use cases and links to evidence-backed records.`;
  const url = toolUrl(group.slug);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entities = await getEntities();
  const group = findToolBySlug(groupEntitiesByTool(entities), slug);
  if (!group) notFound();

  const catalog = await getAIToolBySlug(group.slug);
  const url = toolUrl(group.slug);
  const description =
    catalog?.description ||
    `Documented organisations using ${group.tool} on ${SITE_NAME}.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: group.tool,
        url,
        description,
        applicationCategory: catalog?.category || 'BusinessApplication',
        ...(catalog?.website ? { sameAs: catalog.website } : {}),
      },
      {
        '@type': 'ItemList',
        name: `Organisations using ${group.tool}`,
        numberOfItems: group.entities.length,
        itemListElement: group.entities.map((e, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/entity/${e.slug}`,
          name: e.name,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'AI Tools', item: `${SITE_URL}/tools` },
          { '@type': 'ListItem', position: 3, name: group.tool, item: url },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1E2A3A] flex flex-col font-sans">
      <JsonLd data={jsonLd} />
      <Navbar />

      <main className="max-w-[1180px] mx-auto px-6 py-10 space-y-8 w-full flex-grow">
        <div className="space-y-4 border-b border-[#E3E5E9] pb-6">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#3F4FBF] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to tools
          </Link>

          <div className="space-y-2">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#8A93A3] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#3F4FBF]" />
              AI tool
              {catalog?.category ? ` · ${catalog.category}` : ''}
            </p>
            <h1 className="serif text-3xl sm:text-4xl font-semibold text-[#1E2A3A] tracking-tight">
              Who uses {group.tool}
            </h1>
            <p className="text-[14.5px] text-[#5B6472] max-w-2xl">
              {description}
            </p>
            <p className="text-[13.5px] text-[#5B6472]">
              <span className="font-semibold text-[#1E2A3A]">{group.entities.length}</span>{' '}
              {group.entities.length === 1 ? 'organisation' : 'organisations'} in the directory
              {catalog?.website && (
                <>
                  {' · '}
                  <a
                    href={catalog.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3F4FBF] font-medium hover:underline inline-flex items-center gap-1"
                  >
                    Official site
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              )}
            </p>
          </div>
        </div>

        {group.entities.length > 0 ? (
          <div className="space-y-4">
            <h2 className="serif text-xl font-semibold text-[#1E2A3A] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#3F4FBF]" />
              Documented organisations
            </h2>
            <ul className="space-y-3">
              {group.entities.map((e) => (
                <li
                  key={e.id}
                  className="rounded-[6px] bg-white border border-[#E3E5E9] p-5 shadow-[0_1px_2px_rgba(30,42,58,0.05)] space-y-2"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link
                      href={`/entity/${e.slug}`}
                      className="text-[16px] font-semibold text-[#1E2A3A] hover:text-[#3F4FBF] transition-colors"
                    >
                      {e.name}
                    </Link>
                    <span className="text-[12px] text-[#8A93A3]">
                      {[e.industry, e.type].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  {e.uses.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {e.uses.map((use) => (
                        <span
                          key={use}
                          className="text-[11.5px] text-[#5B6472] px-2 py-0.5 rounded bg-[#F8F9FB] border border-[#E3E5E9]"
                        >
                          {use}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/entity/${e.slug}`}
                    className="inline-flex text-[12.5px] font-semibold text-[#3F4FBF] hover:underline"
                  >
                    View claims and evidence
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="border border-dashed border-[#E3E5E9] rounded-[8px] p-12 text-center bg-white">
            <p className="text-[14px] text-[#5B6472]">
              No organisations linked to this tool yet.
            </p>
          </div>
        )}

        <p className="text-[13px] text-[#8A93A3]">
          Prefer browsing by organisation?{' '}
          <Link href={`/explore?tool=${encodeURIComponent(group.tool)}`} className="text-[#3F4FBF] font-medium hover:underline">
            Filter Explore for {group.tool}
          </Link>
          .
        </p>
      </main>

      <Footer />
    </div>
  );
}
