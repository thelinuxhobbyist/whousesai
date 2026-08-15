import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhoUsesAI — Open AI Directory",
  description: "An open, community-built directory documenting who is using AI and how they are using it. Inspired by Wikipedia's open editing philosophy.",
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
