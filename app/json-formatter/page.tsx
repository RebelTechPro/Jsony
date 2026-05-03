import type { Metadata } from "next";
import Link from "next/link";
import Formatter from "@/components/tools/json/Formatter";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator",
  description:
    "Format, validate, and explore JSON in your browser. Fast on large payloads. Nothing leaves your browser — 100% client-side.",
  alternates: { canonical: "/json-formatter" },
  openGraph: {
    title: "JSON Formatter & Validator — Jsony",
    description:
      "Format, validate, and explore JSON in your browser. Fast on large payloads. Nothing leaves your browser — 100% client-side.",
    url: "/json-formatter",
    type: "website",
  },
};

export default function JsonFormatterPage() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
        <nav className="text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Jsony
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900 dark:text-zinc-100">JSON Formatter</span>
        </nav>

        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            JSON Formatter &amp; Validator
          </h1>
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
            Paste JSON to format and validate it. Everything runs in your browser
            — your data never leaves the page.
          </p>
        </header>

        <Formatter />
      </main>
    </div>
  );
}
