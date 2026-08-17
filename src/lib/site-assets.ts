export const ASSET_CDN = 'https://cdn.whousesai.com';

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
