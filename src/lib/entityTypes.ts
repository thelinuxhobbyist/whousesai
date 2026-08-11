import type { EntityType } from './types';

export interface EntityTypeOption {
  value: EntityType;
  label: string;
  description: string;
  examples: string;
}

/** Canonical entry types for the directory — keep labels simple for contributors. */
export const ENTITY_TYPE_OPTIONS: EntityTypeOption[] = [
  {
    value: 'company',
    label: 'Company',
    description: 'Commercial businesses and companies.',
    examples: 'BBC, Microsoft, Tesco, Adobe, IKEA',
  },
  {
    value: 'organisation',
    label: 'Organisation',
    description: 'Non-profits, charities, foundations, associations and similar organisations.',
    examples: 'Charities, industry associations, foundations',
  },
  {
    value: 'government',
    label: 'Government',
    description: 'Government departments, local authorities, councils and public-sector bodies.',
    examples: 'Departments, councils, public bodies',
  },
  {
    value: 'university_research',
    label: 'University & Research',
    description: 'Universities, research institutes and academic research organisations.',
    examples: 'Universities, research institutes',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Entities that do not naturally fit the categories above.',
    examples: '',
  },
];

export const ENTITY_TYPE_VALUES: EntityType[] = ENTITY_TYPE_OPTIONS.map((o) => o.value);

export function getEntityTypeLabel(type: string): string {
  const option = ENTITY_TYPE_OPTIONS.find((o) => o.value === type);
  if (option) return option.label;
  if (type === 'person') return 'Person';
  if (type === 'university') return 'University & Research';
  if (type === 'non-profit') return 'Organisation';
  return type;
}

/**
 * Map legacy / free-form type strings to the simplified set.
 * Person is left alone for manual review — callers should treat unmapped
 * person separately when migrating stored data.
 */
export function normalizeEntityType(type: string): EntityType {
  switch (type) {
    case 'company':
      return 'company';
    case 'organisation':
    case 'organization':
    case 'non-profit':
    case 'nonprofit':
      return 'organisation';
    case 'government':
      return 'government';
    case 'university':
    case 'university_research':
    case 'research':
    case 'research-organisation':
    case 'research_organisation':
      return 'university_research';
    case 'other':
      return 'other';
    default:
      return 'other';
  }
}

/** Whether a stored type should be auto-migrated (Person is excluded). */
export function shouldAutoMigrateType(type: string): boolean {
  return type !== 'person' && type !== normalizeEntityType(type);
}

export function isEntityType(value: string): value is EntityType {
  return (ENTITY_TYPE_VALUES as string[]).includes(value);
}
