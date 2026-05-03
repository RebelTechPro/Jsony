import type { Metadata } from "next";
import Link from "next/link";
import Formatter from "@/components/tools/json/Formatter";

const TITLE = "JSON Formatter & Validator";
const DESCRIPTION =
  "Format, validate, and explore JSON in your browser. Fast on large payloads. Nothing leaves your browser — 100% client-side.";
const URL = "https://jsony.dev/json-formatter";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/json-formatter" },
  openGraph: {
    title: `${TITLE} — Jsony`,
    description: DESCRIPTION,
    url: "/json-formatter",
    type: "website",
  },
};

const faqs = [
  {
    q: "Is my JSON private?",
    a: "Yes. Everything runs in your browser. There's no server endpoint, no upload, no cookie, no analytics tracking your input. The complete source is open — see the GitHub link in the footer.",
  },
  {
    q: "How big can my JSON be?",
    a: "Multi-megabyte documents work smoothly. The tool has been tested with 50MB+ payloads and is designed around two specific bottlenecks: parsing runs in a Web Worker so the main thread isn't blocked, and the tree view uses virtualized rendering so only the rows you're looking at are painted.",
  },
  {
    q: "Does it support comments and trailing commas?",
    a: "Yes, with the 'Allow trailing commas & comments' setting turned on. By default, strict JSON is enforced so real errors aren't masked. Toggle the setting when you're working with JSONC or hand-edited config files.",
  },
  {
    q: "What happens with invalid JSON?",
    a: "Each parse error is shown with its exact line and column, the offending line of input, and a caret pointing at the column. The error message is human-readable — 'Missing comma between items' instead of the browser's default cryptic position-based error.",
  },
  {
    q: "Is it free?",
    a: "Yes. Jsony is free to use and the source is open under the MIT license.",
  },
  {
    q: "Where can I report bugs or suggest features?",
    a: "Open an issue on the GitHub repository (link in the footer). This is a personal project so there's no SLA, but bug reports with reproducible inputs are very welcome.",
  },
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Jsony JSON Formatter & Validator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (web browser)",
    description: DESCRIPTION,
    url: URL,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Format and pretty-print JSON",
      "Validate JSON syntax with line and column errors",
      "Collapsible tree view for navigating large objects",
      "JSONPath query support",
      "Configurable indent (2/4/Tab), sort keys, JSON5 tolerance",
      "Handles 50MB+ payloads in a Web Worker",
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

export default function JsonFormatterPage() {
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
          <span className="text-zinc-900 dark:text-zinc-100">
            JSON Formatter
          </span>
        </nav>

        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            JSON Formatter &amp; Validator
          </h1>
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
            Paste JSON to format and validate it. Everything runs in your
            browser — your data never leaves the page.
          </p>
        </header>

        <Formatter />

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
    <article className="prose-jsony mx-auto mt-8 flex w-full max-w-3xl flex-col gap-10 text-zinc-700 dark:text-zinc-300">
      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          What is Jsony&apos;s JSON Formatter &amp; Validator?
        </h2>
        <p>
          Jsony is a fast, private JSON formatter and validator built for
          developers working with real-world API responses. Paste any JSON
          document, and Jsony will pretty-print it, validate its syntax, and
          let you explore its structure in a collapsible tree view — all
          without sending your data to a server.
        </p>
        <p>
          The tool is built for handling JSON at scale. Paste a 50MB API
          response, and the parser runs in a Web Worker so the UI stays
          responsive while the structure renders progressively in a
          virtualized tree. Smart error messages point to the exact line and
          column where parsing failed, with a human-readable explanation
          rather than the cryptic{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm dark:bg-zinc-800">
            Unexpected token at position 1247
          </code>{" "}
          you might be used to.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          How to use it
        </h2>
        <ol className="flex flex-col gap-2 pl-6 [list-style:decimal]">
          <li>
            <strong>Paste or load JSON.</strong> Paste directly into the input
            pane (it auto-formats on paste), or click <em>Open file</em> to
            load a <code>.json</code> file from disk.
          </li>
          <li>
            <strong>See it formatted.</strong> The output pane shows your JSON
            either as an interactive collapsible tree (default) or as raw
            formatted text. Toggle between views without re-parsing.
          </li>
          <li>
            <strong>Filter with JSONPath.</strong> Type a query like{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm dark:bg-zinc-800">
              $.users[*].email
            </code>{" "}
            in the JSONPath bar to extract specific values. Results update
            live as you type.
          </li>
          <li>
            <strong>Adjust formatting.</strong> Pick your indent (2 spaces, 4
            spaces, or tabs), enable sort keys for alphabetical ordering, or
            turn on tolerant parsing to allow trailing commas and{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm dark:bg-zinc-800">
              {"// comments"}
            </code>
            .
          </li>
          <li>
            <strong>Copy.</strong> Click <em>Copy</em> to put the formatted
            output (or your query result) on the clipboard.
          </li>
        </ol>
        <p>
          Settings persist in your browser&apos;s localStorage between
          sessions, so once you&apos;ve configured your preferences you
          won&apos;t have to set them again.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Common use cases
        </h2>
        <p>
          <strong>Inspecting API responses.</strong> Paste the response body
          from your API client and use the tree view to navigate nested
          structures. Search for specific values with JSONPath instead of
          scrolling through formatted text.
        </p>
        <p>
          <strong>Debugging serialization issues.</strong> When your backend
          produces malformed JSON or your frontend can&apos;t parse what it
          received, paste the raw response. The line and column error pointer
          makes it obvious where the problem is.
        </p>
        <p>
          <strong>Cleaning up minified JSON.</strong> A one-line minified
          payload becomes a readable, color-coded document instantly. Useful
          for code review, log forensics, or just understanding what an opaque
          request body actually contains.
        </p>
        <p>
          <strong>Working with configuration files.</strong>{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm dark:bg-zinc-800">
            package.json
          </code>
          ,{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm dark:bg-zinc-800">
            tsconfig.json
          </code>
          , deeply nested CI configs — open them, browse, search by key path.
          Sort keys alphabetically when you need to compare two configs side
          by side.
        </p>
        <p>
          <strong>Extracting specific fields at scale.</strong> With a
          JSONPath query, pull every <code>email</code>, every <code>id</code>
          , or every nested <code>metadata.tags[*]</code> from a large
          document. The query runs against a parsed value cached in the
          worker, so iteration is instant once the document is loaded.
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
          More tools coming soon
        </h2>
        <p>
          Jsony is a small set of focused, fast, privacy-respecting developer
          utilities. Coming next: a JSON Diff tool for comparing two
          documents, a JSON-to-CSV converter, a JWT decoder, and a Base64
          encoder/decoder. All will follow the same principles: 100%
          client-side, fast on large inputs, clean UI without ads above the
          fold. See the <Link
            href="/"
            className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            home page
          </Link>{" "}
          for the current tool list.
        </p>
      </section>
    </article>
  );
}
