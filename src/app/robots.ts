import type { MetadataRoute } from 'next';
import { PRIVATE_ROBOTS_PATHS, PUBLIC_ROBOTS_EXCEPTIONS, SITE_URL } from '@/lib/site';

const CRAWLERS = [
  '*',
  'Googlebot',
  'Googlebot-Image',
  'Google-Extended',
  'Bingbot',
  'Applebot',
  'Applebot-Extended',
  'DuckDuckBot',
  'Amazonbot',
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'anthropic-ai',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: CRAWLERS.map((userAgent) => ({
      userAgent,
      allow: PUBLIC_ROBOTS_EXCEPTIONS,
      disallow: PRIVATE_ROBOTS_PATHS,
    })),
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
