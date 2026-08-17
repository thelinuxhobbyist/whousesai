export const ASSET_CDN = 'https://cdn.whousesai.com';

export const SITE_NAME = 'WhoUsesAI';
export const SITE_TAGLINE = 'Open Directory of AI Adoption';
export const SITE_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const SITE_DESCRIPTION =
  'WhoUsesAI is an open, public directory of AI adoption documenting who is using AI, what they are using it for, and the evidence behind each claim.';

const logoBase = `${ASSET_CDN}/assets/logos`;
const faviconBase = `${logoBase}/favicon`;

export const siteAssets = {
  logo: {
    svg: `${logoBase}/logo.svg`,
    png: `${logoBase}/logo.png`,
  },
  favicon: {
    ico: `${faviconBase}/favicon.ico`,
    png16: `${faviconBase}/favicon-16x16.png`,
    png32: `${faviconBase}/favicon-32x32.png`,
    png96: `${faviconBase}/favicon-96x96.png`,
    apple180: `${faviconBase}/apple-icon-180x180.png`,
    android192: `${faviconBase}/android-icon-192x192.png`,
  },
} as const;
