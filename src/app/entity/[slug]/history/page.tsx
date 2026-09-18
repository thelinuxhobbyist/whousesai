import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EntityHistoryView from '@/components/EntityHistoryView';
import JsonLd from '@/components/JsonLd';
import { getEntityBySlug, getEntityRevisions, getReportsForEntity } from '@/lib/db';
import { buildHistoryJsonLd, buildPublicEntityRecord } from '@/lib/public-record';
import { SITE_NAME } from '@/lib/site-assets';
import { entityHistoryUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entity = await getEntityBySlug(slug);
  if (!entity) {
    return {
      title: 'Revision history not found',
      robots: { index: false, follow: true },
    };
  }

  const description = `Append-only revision history for ${entity.name} on ${SITE_NAME}, including edits, reverts, claims and evidence.`;
  const url = entityHistoryUrl(entity.slug);

  return {
    title: `Revision history: ${entity.name}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `Revision history: ${entity.name}`,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
    },
    robots: { index: true, follow: true },
  };
}

export default async function EntityHistoryPage({ params }: PageProps) {
  const { slug } = await params;
  const entity = await getEntityBySlug(slug);
  if (!entity) notFound();

  const [revisions, reports] = await Promise.all([
    getEntityRevisions(entity.id),
    getReportsForEntity(entity.id),
  ]);
  const publicReports = reports.filter((report) => report.status !== 'dismissed');
  const record = entity.current_revision
    ? buildPublicEntityRecord(entity, revisions, reports)
    : null;

  return (
    <>
      {record && <JsonLd data={buildHistoryJsonLd(entity, record)} />}
      <EntityHistoryView entity={entity} revisions={revisions} reports={publicReports} />
    </>
  );
}
