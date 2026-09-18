import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from '@/lib/site-assets';
import {
  entityHistoryUrl,
  entityUrl,
  SITE_URL,
} from '@/lib/site';
import { getEntityTypeLabel } from '@/lib/entityTypes';
import {
  claimStatement,
  evidenceMeta,
  inferEvidenceStatus,
} from '@/lib/evidence';
import { revisionHistoryLabel } from '@/lib/revisionLabels';
import {
  Entity,
  EntityReport,
  EntityRevision,
} from '@/lib/types';

export const PUBLIC_API_VERSION = 1;

function publicNote(report: EntityReport) {
  return {
    created_at: report.created_at,
    reason: report.reason,
    details: report.details,
    status: report.status,
    kind: report.kind ?? 'report',
    claim_index: report.claim_index ?? null,
    claim_use: report.claim_use ?? null,
  };
}

export function buildPublicEntityRecord(
  entity: Entity,
  revisions: EntityRevision[],
  reports: EntityReport[]
) {
  const rev = entity.current_revision;
  if (!rev) {
    throw new Error('Entity has no current revision');
  }

  const claims = rev.content.claims || [];
  const activeOnCurrent = reports.filter(
    (report) => report.status !== 'dismissed' && report.revision_id === rev.id
  );

  const claimRecords = claims.map((claim, index) => {
    const related = activeOnCurrent.filter((report) => {
      if (report.claim_index === index) return true;
      if (report.claim_use && report.claim_use === claim.use) return true;
      return false;
    });
    const challenges = related.filter((report) => report.kind === 'challenge');
    const organisationResponses = related.filter((report) => report.kind === 'org_response');
    const sourceType = inferEvidenceStatus(claim.sources, entity.name, claim.evidence_status);

    return {
      index,
      use: claim.use,
      statement: claimStatement(entity.name, claim),
      tool: claim.tool?.trim() || null,
      note: claim.note?.trim() || null,
      evidence: (claim.sources || [])
        .filter((source) => source.url?.trim())
        .map((source) => ({
          title: source.title || source.url,
          url: source.url,
        })),
      source_type: sourceType,
      source_type_label: evidenceMeta(sourceType).label,
      claim_status: challenges.length > 0 ? 'disputed' : 'active',
      challenges: challenges.map(publicNote),
      organisation_responses: organisationResponses.map(publicNote),
    };
  });

  const revisionById = (id: number | null | undefined) =>
    id == null ? undefined : revisions.find((item) => item.id === id);

  const pendingModerationReports = reports.filter(
    (report) => (report.kind ?? 'report') === 'report' && report.status === 'pending'
  ).length;

  return {
    api_version: PUBLIC_API_VERSION,
    organisation: {
      slug: entity.slug,
      name: entity.name,
      type: entity.type,
      type_label: getEntityTypeLabel(entity.type),
      industry: entity.industry,
      country: entity.country,
      url: entityUrl(entity.slug),
    },
    record: {
      current_revision_number: rev.revision_number,
      current_revision_id: rev.id,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      edit_summary: rev.edit_summary,
      action_type: rev.action_type,
    },
    claims: claimRecords,
    revision_history: [...revisions]
      .sort((a, b) => b.revision_number - a.revision_number)
      .map((revision) => ({
        revision_number: revision.revision_number,
        action_type: revision.action_type,
        summary: revisionHistoryLabel(revision, revisionById),
        created_at: revision.created_at,
        editor: revision.editor_id,
        reverted_revision_number: revisionById(revision.reverted_revision_id)?.revision_number ?? null,
        restored_from_revision_number:
          revisionById(revision.restored_from_revision_id)?.revision_number ?? null,
        is_current: revision.id === rev.id,
        url: `${entityHistoryUrl(entity.slug)}#rev-${revision.revision_number}`,
      })),
    who_uses_ai: {
      publisher: SITE_NAME,
      role: 'directory_publisher',
      editorial_status: 'community_published',
      verification: 'evidence_linked_not_independently_certified',
      endorsement: false,
      moderation_status: {
        open_claim_challenges: claimRecords.reduce((sum, claim) => sum + claim.challenges.length, 0),
        disputed_claims: claimRecords.filter((claim) => claim.claim_status === 'disputed').length,
        pending_moderation_reports: pendingModerationReports,
      },
      disclaimer: `${SITE_NAME} publishes community-submitted claims with linked evidence. It does not represent the listed organisation or certify each claim as independently verified fact.`,
    },
  };
}

export type PublicEntityRecord = ReturnType<typeof buildPublicEntityRecord>;

export function buildEntityJsonLd(
  entity: Entity,
  record: PublicEntityRecord
): Record<string, unknown> {
  const pageUrl = entityUrl(entity.slug);
  const historyUrl = entityHistoryUrl(entity.slug);
  const organisationId = `${pageUrl}#organisation`;
  const webpageId = `${pageUrl}#webpage`;

  const claimNodes = record.claims.map((claim) => {
    const claimId = `${pageUrl}#claim-${claim.index}`;
    return {
      '@type': 'Claim',
      '@id': claimId,
      url: claimId,
      name: claim.use,
      text: claim.statement,
      dateModified: record.record.updated_at,
      appearance: claim.evidence.map((source) => ({
        '@type': 'CreativeWork',
        name: source.title,
        url: source.url,
      })),
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'source_type',
          value: claim.source_type_label,
        },
        {
          '@type': 'PropertyValue',
          name: 'claim_status',
          value: claim.claim_status,
        },
        ...(claim.tool
          ? [
              {
                '@type': 'PropertyValue',
                name: 'ai_tool',
                value: claim.tool,
              },
            ]
          : []),
      ],
    };
  });

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
      {
        '@type': 'WebPage',
        '@id': webpageId,
        url: pageUrl,
        name: `Documented AI use at ${entity.name}`,
        description: entity.current_revision?.content.description || SITE_DESCRIPTION,
        datePublished: entity.created_at,
        dateModified: entity.updated_at,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': organisationId },
        mainEntity: { '@id': organisationId },
        relatedLink: historyUrl,
      },
      {
        '@type': 'Organization',
        '@id': organisationId,
        name: entity.name,
        url: pageUrl,
        additionalType: getEntityTypeLabel(entity.type),
        description: entity.current_revision?.content.description,
        address: entity.country
          ? {
              '@type': 'PostalAddress',
              addressCountry: entity.country,
            }
          : undefined,
        subjectOf: claimNodes.map((claim) => ({ '@id': claim['@id'] })),
      },
      {
        '@type': 'Dataset',
        '@id': `${pageUrl}#record`,
        name: `${SITE_NAME} record for ${entity.name}`,
        description: `Public claims, evidence and revision history for ${entity.name} on ${SITE_NAME}.`,
        url: pageUrl,
        creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        dateCreated: entity.created_at,
        dateModified: entity.updated_at,
        version: `revision-${record.record.current_revision_number}`,
        isBasedOn: historyUrl,
        license: SITE_URL,
        hasPart: claimNodes.map((claim) => ({ '@id': claim['@id'] })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Directory',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: entity.name,
            item: pageUrl,
          },
        ],
      },
      ...claimNodes,
    ],
  };
}

export function buildDirectoryJsonLd(entities: Entity[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      },
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/#directory`,
        name: SITE_TITLE,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: entities.length,
          itemListElement: entities.map((entity, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: entityUrl(entity.slug),
            name: entity.name,
          })),
        },
      },
    ],
  };
}

export function buildHistoryJsonLd(entity: Entity, record: PublicEntityRecord): Record<string, unknown> {
  const historyUrl = entityHistoryUrl(entity.slug);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: historyUrl,
    name: `Revision history: ${entity.name}`,
    dateModified: entity.updated_at,
    about: {
      '@type': 'Organization',
      name: entity.name,
      url: entityUrl(entity.slug),
    },
    hasPart: record.revision_history.map((revision) => ({
      '@type': 'CreativeWork',
      name: `${entity.name} revision #${revision.revision_number}`,
      url: revision.url,
      dateCreated: revision.created_at,
      version: String(revision.revision_number),
      description: revision.summary,
    })),
  };
}
