export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://whousesai.com';

export function absoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalised = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalised}`;
}

export function entityUrl(slug: string): string {
  return absoluteUrl(`/entity/${slug}`);
}

export function entityHistoryUrl(slug: string): string {
  return absoluteUrl(`/entity/${slug}/history`);
}

export function publicEntityApiUrl(slug: string): string {
  return absoluteUrl(`/api/public/entities/${slug}`);
}

/** Paths that must not be indexed and are not part of the public knowledge base. */
export const PRIVATE_ROBOTS_PATHS = [
  '/admin',
  '/add',
  '/entity/*/edit',
  '/api/',
  '/api/reports',
  '/api/entities/*/revert',
];

export const PUBLIC_ROBOTS_EXCEPTIONS = [
  '/',
  '/explore',
  '/tools',
  '/entity/',
  '/sitemap.xml',
  '/llms.txt',
  '/api/public/',
];
