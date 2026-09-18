import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EntityDetailView from '@/components/EntityDetailView';
import JsonLd from '@/components/JsonLd';
import { getEntityBySlug, getEntityRevisions, getReportsForEntity } from '@/lib/db';
import { buildEntityJsonLd, buildPublicEntityRecord } from '@/lib/public-record';
import { SITE_NAME } from '@/lib/site-assets';
import { entityUrl, publicEntityApiUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entity = await getEntityBySlug(slug);
  if (!entity?.current_revision) {
    return {
      title: 'Organisation not found',
      robots: { index: false, follow: true },
    };
  }

  const description =
    entity.current_revision.content.description?.slice(0, 300) ||
    `Documented AI use, claims, evidence and revision history for ${entity.name} on ${SITE_NAME}.`;

  const url = entityUrl(entity.slug);

  return {
    title: `Documented AI use at ${entity.name}`,
    description,
    alternates: {
      canonical: url,
      types: {
        'application/json': publicEntityApiUrl(entity.slug),
      },
    },
    openGraph: {
      title: `Documented AI use at ${entity.name}`,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `Documented AI use at ${entity.name}`,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function EntityPage({ params }: PageProps) {
  const { slug } = await params;
  const entity = await getEntityBySlug(slug);
  if (!entity?.current_revision) notFound();

  const [revisions, reports] = await Promise.all([
    getEntityRevisions(entity.id),
    getReportsForEntity(entity.id),
  ]);
  const record = buildPublicEntityRecord(entity, revisions, reports);

  return (
    <>
      <JsonLd data={buildEntityJsonLd(entity, record)} />
      <EntityDetailView entity={entity} reports={reports} />
    </>
  );
}
