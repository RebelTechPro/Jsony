import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import ThemeToggle from "@/components/shared/ThemeToggle";

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
  alternates: { canonical: "/" },
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

const themeBootScript = `(function(){try{var s=localStorage.getItem('jsony.theme');var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
            <Link
              href="/"
              className="font-semibold tracking-tight hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Jsony
            </Link>
            <ThemeToggle />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
