import { Claim, EvidenceStatus, RevisionContent, SourceItem } from './types';

export const EVIDENCE_STATUSES: {
  id: EvidenceStatus;
  label: string;
  hint: string;
}[] = [
  {
    id: 'direct',
    label: 'Direct source',
    hint: 'Published by the organisation itself.',
  },
  {
    id: 'official',
    label: 'Official source',
    hint: 'Published by a government, regulator, public authority or other official body.',
  },
  {
    id: 'reputable_third_party',
    label: 'Reputable third-party source',
    hint: 'Published by a credible independent organisation, publication, research body or other established source.',
  },
  {
    id: 'secondary',
    label: 'Secondary source',
    hint: 'Based on or reporting information from another source rather than being the original evidence.',
  },
  {
    id: 'community_submitted',
    label: 'Community submitted',
    hint: 'Submitted by a community member but not independently verified.',
  },
];

const OFFICIAL_HOST_MARKERS = [
  '.gov',
  '.gov.uk',
  '.gov.au',
  '.govt.nz',
  '.mil',
  'europa.eu',
  'parliament.uk',
  'who.int',
  'oecd.org',
  'un.org',
];

const REPUTABLE_HOST_MARKERS = [
  'bbc.co.uk',
  'bbc.com',
  'reuters.com',
  'ft.com',
  'nytimes.com',
  'theguardian.com',
  'wsj.com',
  'bloomberg.com',
  'apnews.com',
  'economist.com',
  'nature.com',
  'science.org',
];

function hostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function orgTokens(entityName: string): string[] {
  return entityName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !['the', 'and', 'ltd', 'plc', 'inc', 'llc'].includes(token));
}

export function inferEvidenceStatus(
  sources: SourceItem[] | undefined,
  entityName: string,
  explicit?: EvidenceStatus
): EvidenceStatus {
  if (explicit) return explicit;
  if (!sources || sources.length === 0) return 'community_submitted';

  const hosts = sources.map((source) => hostname(source.url)).filter(Boolean);
  if (hosts.length === 0) return 'community_submitted';

  const tokens = orgTokens(entityName);
  if (tokens.length > 0 && hosts.some((host) => tokens.every((token) => host.includes(token) || host.replace(/[-.]/g, '').includes(token)))) {
    return 'direct';
  }
  if (tokens.some((token) => hosts.some((host) => host.includes(token)))) {
    return 'direct';
  }
  if (hosts.some((host) => OFFICIAL_HOST_MARKERS.some((marker) => host.includes(marker)))) {
    return 'official';
  }
  if (hosts.some((host) => REPUTABLE_HOST_MARKERS.some((marker) => host.includes(marker)))) {
    return 'reputable_third_party';
  }
  return 'secondary';
}

export function evidenceMeta(status: EvidenceStatus) {
  return EVIDENCE_STATUSES.find((item) => item.id === status) ?? EVIDENCE_STATUSES[3];
}

export function claimStatement(entityName: string, claim: Claim): string {
  if (claim.note?.trim()) return claim.note.trim();
  if (claim.tool?.trim()) {
    return `${entityName} uses ${claim.tool.trim()} for ${claim.use}.`;
  }
  return `${entityName} uses AI for ${claim.use}.`;
}

export function formatLongDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function revisionActorLabel(editorId: string, actionType?: string): string {
  const isModerator = /admin|moderator|verified/i.test(editorId);
  if (actionType === 'revert') {
    return isModerator ? 'Moderator revert' : 'Community revert';
  }
  return editorId;
}

/** True when revision content still uses legacy flat arrays without structured claims. */
export function needsClaimsMigration(content: RevisionContent): boolean {
  return !(content.claims && content.claims.length > 0);
}

function sourcesForLegacyIndex(sources: SourceItem[], index: number): SourceItem[] {
  if (sources.length === 0) return [];
  if (sources.length === 1) return sources;
  return sources[index] ? [sources[index]] : index === 0 ? sources : [];
}

/** Keep legacy search fields in sync with structured claims. */
export function syncLegacyFieldsFromClaims(content: RevisionContent): RevisionContent {
  const claims = content.claims || [];
  if (claims.length === 0) return content;

  const ai_uses = claims.map((c) => c.use).filter(Boolean);
  const ai_tools = [...new Set(claims.map((c) => c.tool).filter((t): t is string => Boolean(t?.trim())))];
  const sourceMap = new Map<string, SourceItem>();
  for (const claim of claims) {
    for (const src of claim.sources || []) {
      if (src.url?.trim()) sourceMap.set(src.url.trim(), src);
    }
  }

  return {
    ...content,
    claims,
    ai_uses,
    ai_tools,
    sources: [...sourceMap.values()],
  };
}

/** Convert legacy ai_uses / ai_tools / sources into per-claim evidence records. */
export function migrateLegacyContentToClaims(content: RevisionContent): RevisionContent {
  if (content.claims && content.claims.length > 0) {
    return syncLegacyFieldsFromClaims(content);
  }

  const uses = content.ai_uses || [];
  const tools = content.ai_tools || [];
  const sources = (content.sources || []).filter((s) => s.url?.trim());

  let claims: Claim[] = [];

  if (uses.length > 0) {
    claims = uses.map((use, i) => ({
      use,
      tool: tools[i]?.trim() || undefined,
      sources: sourcesForLegacyIndex(sources, i),
    }));
  } else if (tools.length > 0) {
    claims = tools.map((tool, i) => ({
      use: 'Documented AI use',
      tool: tool.trim(),
      sources: sourcesForLegacyIndex(sources, i),
    }));
  } else if (sources.length > 0) {
    claims = [{ use: 'Documented AI use', sources }];
  }

  return syncLegacyFieldsFromClaims({ ...content, claims });
}

/** Normalize revision content for reads, display, and API responses. */
export function normalizeRevisionContent(content: RevisionContent): RevisionContent {
  return migrateLegacyContentToClaims(content);
}
