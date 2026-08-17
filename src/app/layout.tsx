import type { Metadata } from "next";
import "./globals.css";
import { siteAssets } from "@/lib/site-assets";

export const metadata: Metadata = {
  title: "WhoUsesAI — Open AI Directory",
  description: "An open, community-built directory documenting who is using AI and how they are using it. Inspired by Wikipedia's open editing philosophy.",
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
