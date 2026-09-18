#!/usr/bin/env node
/**
 * Create a Cloudflare WAF skip rule so legitimate search/AI crawlers can GET
 * public directory pages, without disabling bot protection globally.
 *
 * This is required because Cloudflare "Block AI bots" / AI Crawl Control
 * currently returns HTTP 403 "Your request was blocked." to GPTBot, ClaudeBot,
 * CCBot, Bytespider, and similar crawlers before the Worker runs.
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ZONE_ID=... node scripts/allow-public-crawlers.mjs
 *
 * The token needs Zone WAF / Zone Firewall edit. Wrangler OAuth with only
 * zone:read cannot create this rule.
 *
 * Also in the dashboard:
 *   Security → Bots → Block AI bots: Off (or AI Crawl Control: Allow the crawlers below)
 *   Security → Settings → disable "Managed robots.txt" AI prepend if it Disallow: / for GPTBot
 *   Leave Browser Integrity Check on (empty User-Agent 1010 is fine)
 */

const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

const CRAWLER_UA = [
  'Googlebot',
  'Google-Extended',
  'bingbot',
  'Bingbot',
  'DuckDuckBot',
  'Applebot',
  'Amazonbot',
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'CCBot',
];

const expression = [
  '(http.request.method eq "GET")',
  '(not http.request.uri.path matches "^/(admin|add)(/|$)" )',
  '(not http.request.uri.path matches "^/entity/[^/]+/edit")',
  '(not http.request.uri.path matches "^/api/reports")',
  '(not http.request.uri.path matches "/revert")',
  `(${CRAWLER_UA.map((ua) => `http.user_agent contains "${ua}"`).join(' or ')})`,
].join(' and ');

async function cf(path, method = 'GET', body) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(`${method} ${path} failed: ${JSON.stringify(json.errors || json)}`);
  }
  return json;
}

async function main() {
  if (!TOKEN || !ZONE_ID) {
    console.error('Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID');
    process.exit(1);
  }

  const rulesets = await cf(`/zones/${ZONE_ID}/rulesets`);
  const entry = (rulesets.result || []).find(
    (item) => item.phase === 'http_request_firewall_custom' && item.kind === 'zone'
  );

  const rule = {
    action: 'skip',
    description: 'Allow legitimate search and AI crawlers on public WhoUsesAI pages',
    expression,
    action_parameters: {
      phases: ['http_request_firewall_managed', 'http_request_sbfm'],
      products: ['bic', 'uaBlock', 'securityLevel', 'waf'],
    },
    enabled: true,
  };

  if (!entry) {
    await cf(`/zones/${ZONE_ID}/rulesets`, 'POST', {
      name: 'default',
      kind: 'zone',
      phase: 'http_request_firewall_custom',
      rules: [rule],
    });
    console.log('Created zone custom ruleset with crawler skip rule.');
    return;
  }

  const current = await cf(`/zones/${ZONE_ID}/rulesets/${entry.id}`);
  const existing = (current.result.rules || []).find((item) =>
    String(item.description || '').includes('Allow legitimate search and AI crawlers')
  );

  if (existing) {
    await cf(`/zones/${ZONE_ID}/rulesets/${entry.id}/rules/${existing.id}`, 'PATCH', rule);
    console.log('Updated existing crawler skip rule', existing.id);
    return;
  }

  await cf(`/zones/${ZONE_ID}/rulesets/${entry.id}/rules`, 'POST', rule);
  console.log('Added crawler skip rule to existing custom ruleset', entry.id);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
