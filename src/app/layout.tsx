import type { Metadata } from "next";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_TITLE, siteAssets } from "@/lib/site-assets";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [SITE_NAME, SITE_TAGLINE, "AI adoption", "public directory"],
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: siteAssets.favicon.ico },
      {
        url: siteAssets.favicon.png32,
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: siteAssets.favicon.png16,
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: siteAssets.favicon.png96,
        sizes: "96x96",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: siteAssets.favicon.apple180,
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: siteAssets.favicon.android192,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#F3F4F6] text-[#1E2A3A]">{children}</body>
    </html>
  );
}
