import type { Metadata } from "next";
import Link from "next/link";
import Base64Tool from "@/components/tools/json/Base64Tool";

const TITLE = "Base64 Encoder & Decoder";
const DESCRIPTION =
  "Encode or decode Base64 in your browser. UTF-8 safe, supports both standard and URL-safe alphabets. Live conversion as you type.";
const URL = "https://jsony.dev/base64";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/base64" },
  openGraph: {
    title: `${TITLE} — Jsony`,
    description: DESCRIPTION,
    url: "/base64",
    type: "website",
  },
};

const faqs = [
  {
    q: "What's the difference between standard and URL-safe Base64?",
    a: "Standard Base64 uses + and / as the last two characters of its alphabet, and = for padding. URL-safe Base64 (RFC 4648 §5) uses - and _ instead, and usually omits the trailing = padding. URL-safe is what you'll see inside JWTs, OAuth tokens, and anywhere a Base64 string sits in a URL or filename without needing escaping.",
  },
  {
    q: "Does it handle Unicode correctly?",
    a: "Yes. The browser's built-in atob/btoa functions only handle Latin-1 characters and break on emoji or non-Latin scripts. This tool uses TextEncoder and TextDecoder so anything UTF-8 round-trips cleanly — Chinese, Arabic, emoji, all of it.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Encoding and decoding both run in your browser. There's no server endpoint, no analytics tracking your input. The complete source is open on GitHub.",
  },
  {
    q: "Why is my decoded output garbled?",
    a: "Two common reasons. (1) The input was binary data, not UTF-8 text — the bytes decode fine but don't form readable characters. Base64 is meant for binary; this tool only displays the result as text. (2) The Base64 string was URL-safe but you have Standard selected (or vice versa). The tool auto-detects URL-safe characters in the input, but explicitly setting the alphabet is more reliable.",
  },
  {
    q: "Can I encode files?",
    a: "Not yet — the input is text-only. For now, paste the file contents (text files) or a hex/string representation. File-input support may be added later if there's demand.",
  },
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Jsony Base64 Encoder & Decoder",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (web browser)",
    description: DESCRIPTION,
    url: URL,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Encode UTF-8 text to Base64",
      "Decode Base64 to UTF-8 text",
      "Standard and URL-safe alphabets",
      "Live conversion as you type",
      "Swap input and output",
      "100% client-side — no data leaves your browser",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Jsony",
        item: "https://jsony.dev/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: TITLE,
        item: URL,
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

export default function Base64Page() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
        <nav className="text-sm text-zinc-500 dark:text-zinc-400">
          <Link
            href="/"
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Jsony
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900 dark:text-zinc-100">Base64</span>
        </nav>

        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Base64 Encoder &amp; Decoder
          </h1>
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
            Encode or decode Base64 in your browser. UTF-8 safe. Standard and
            URL-safe alphabets. Your data never leaves the page.
          </p>
        </header>

        <Base64Tool />

        <SupportingContent />

        {schemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </main>
    </div>
  );
}

function SupportingContent() {
  return (
    <article className="mx-auto mt-8 flex w-full max-w-3xl flex-col gap-10 text-zinc-700 dark:text-zinc-300">
      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          What is the Jsony Base64 Encoder &amp; Decoder?
        </h2>
        <p>
          A simple, fast, UTF-8 safe Base64 tool. Type or paste in either
          pane and the conversion runs live — no Convert button to click,
          no round trip to a server. Switch between standard and URL-safe
          alphabets with one toggle.
        </p>
        <p>
          Most one-off scripts use the browser&apos;s built-in{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm dark:bg-zinc-800">
            atob
          </code>{" "}
          and{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm dark:bg-zinc-800">
            btoa
          </code>
          , but those break on anything outside Latin-1 — emoji, accented
          characters, non-Latin scripts. This tool wraps them with{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm dark:bg-zinc-800">
            TextEncoder
          </code>{" "}
          /{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm dark:bg-zinc-800">
            TextDecoder
          </code>{" "}
          so any UTF-8 input round-trips correctly.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          How to use it
        </h2>
        <ol className="flex flex-col gap-2 pl-6 [list-style:decimal]">
          <li>
            <strong>Pick a mode</strong> — Encode (text → Base64) or Decode
            (Base64 → text).
          </li>
          <li>
            <strong>Pick an alphabet.</strong> Standard for general use;
            URL-safe for tokens, filenames, URL parameters.
          </li>
          <li>
            <strong>Type or paste in the input.</strong> The output updates
            live.
          </li>
          <li>
            <strong>Swap</strong> to flip input and output (handy when
            you&apos;ve decoded something and now want to re-encode it
            differently).
          </li>
          <li>
            <strong>Copy</strong> to put the output on your clipboard.
          </li>
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Common use cases
        </h2>
        <p>
          <strong>Inspecting authentication tokens.</strong> JWT segments,
          OAuth state parameters, basic-auth headers — all Base64. Use this
          to peek at the contents.
        </p>
        <p>
          <strong>Encoding strings for URLs.</strong> When you need a value
          to survive a query string or path segment without escaping
          headaches, URL-safe Base64 is the standard choice.
        </p>
        <p>
          <strong>Embedding small assets.</strong> Data URIs (e.g.,{" "}
          <code>data:image/png;base64,...</code>) need a Base64-encoded
          payload. This tool lets you encode the bytes if you have them as
          text.
        </p>
        <p>
          <strong>Debugging.</strong> When a tool dumps a Base64 blob and
          you want to know what&apos;s inside, paste it here.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Frequently asked questions
        </h2>
        <dl className="flex flex-col gap-5">
          {faqs.map((f, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <dt className="font-semibold text-zinc-900 dark:text-zinc-100">
                {f.q}
              </dt>
              <dd>{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Related tools
        </h2>
        <p>
          The{" "}
          <Link
            href="/jwt-decoder"
            className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            JWT Decoder
          </Link>{" "}
          handles the JWT-specific case (3 Base64url segments separated by
          dots), surfacing standard claims and expiration. The{" "}
          <Link
            href="/json-formatter"
            className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            JSON Formatter
          </Link>{" "}
          is useful once you&apos;ve decoded something that turns out to be
          JSON.
        </p>
      </section>
    </article>
  );
}
