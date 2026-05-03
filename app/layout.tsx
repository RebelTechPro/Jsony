import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jsony.dev"),
  title: {
    default: "Jsony — JSON, fast and local.",
    template: "%s — Jsony",
  },
  description:
    "Fast, private developer tools for JSON and beyond. Everything runs in your browser — your data never leaves the page.",
  applicationName: "Jsony",
  openGraph: {
    type: "website",
    siteName: "Jsony",
    url: "https://jsony.dev",
    title: "Jsony — JSON, fast and local.",
    description:
      "Fast, private developer tools for JSON and beyond. Everything runs in your browser — your data never leaves the page.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jsony — JSON, fast and local.",
    description:
      "Fast, private developer tools for JSON and beyond. Everything runs in your browser — your data never leaves the page.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
