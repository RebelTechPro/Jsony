import type { Metadata } from "next";
import Link from "next/link";
import JsonDiff from "@/components/tools/json/JsonDiff";

const TITLE = "JSON Diff";
const DESCRIPTION =
  "Compare two JSON documents and see what changed. Structural diff in your browser — no upload, no tracking. Highlights additions, removals, and modifications.";
const URL = "https://jsony.dev/json-diff";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/json-diff" },
  openGraph: {
    title: `${TITLE} — Jsony`,
    description: DESCRIPTION,
    url: "/json-diff",
    type: "website",
  },
};

const faqs = [
  {
    q: "How does it compare two JSON documents?",
    a: "It parses both, then computes a structural delta — meaning it understands JSON's shape, not just text lines. So reordering keys in an object is a no-op, but adding, removing, or changing a value is shown. Arrays are matched item-by-item; if items have an `id` field, it uses that to detect moved or reordered items rather than reporting a full rewrite.",
  },
  {
    q: "What does each color mean?",
    a: "Green = added (present on the right, not on the left). Red = removed (present on the left, not on the right). Red strikethrough → green = modified (different values for the same key). Gray = unchanged context.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Both documents are parsed and diffed entirely in your browser, in a Web Worker. Nothing is sent to a server, no analytics tracks the content of either side. The complete source is open on GitHub.",
  },
  {
    q: "Can I diff two JSON files?",
    a: "Yes. Each input pane has its own 'Open file' button. Pick the left file and the right file, and the diff runs automatically once both load.",
  },
  {
    q: "Does it handle large JSON?",
    a: "The parse + diff runs in a Web Worker so the UI stays responsive. Multi-MB documents work but the rendered diff itself can get long for documents with thousands of differences — scroll within the diff pane.",
  },
  {
    q: "Why is reordered array seen as no change but reordered object is?",
    a: "JSON object key order isn't semantically meaningful (per the spec), so reordering keys is treated as identical. Array order IS meaningful, but if items have an 'id' field, the diff matches by id and reports moves rather than full rewrites.",
  },
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Jsony JSON Diff",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (web browser)",
    description: DESCRIPTION,
    url: URL,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Structural JSON diff (not text-based)",
      "Color-coded additions, removals, and modifications",
      "Detects array item moves via id field",
      "Side-by-side input panes with file upload",
      "Runs in a Web Worker for responsive UI",
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

export default function JsonDiffPage() {
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
          <span className="text-zinc-900 dark:text-zinc-100">JSON Diff</span>
        </nav>

        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            JSON Diff
          </h1>
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
            Compare two JSON documents and see what changed. Structural diff
            in your browser — your data never leaves the page.
          </p>
        </header>

        <JsonDiff />

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
          What is the Jsony JSON Diff?
        </h2>
        <p>
          A structural diff for JSON. Paste two documents — typically the
          before and after of an API response, a config file, or a snapshot —
          and see exactly what changed: which keys were added, which were
          removed, which had their values modified.
        </p>
        <p>
          Unlike a text diff, this understands JSON&apos;s shape. Reordering
          keys in an object isn&apos;t a change (the JSON spec doesn&apos;t
          define key order as meaningful). Reordered array items are detected
          as moves when they have an <code>id</code> field, rather than
          reported as a full rewrite. The result is a much shorter, much more
          readable diff than running <code>diff</code> on the raw text.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          How to use it
        </h2>
        <ol className="flex flex-col gap-2 pl-6 [list-style:decimal]">
          <li>
            <strong>Paste your two documents</strong> in the left and right
            input panes. Or click <em>Open file</em> on either side to load
            from disk.
          </li>
          <li>
            <strong>Click Diff</strong> (or just paste — the diff runs
            automatically when both sides have content).
          </li>
          <li>
            <strong>Read the result.</strong> Green = added on the right.
            Red = removed from the left. Red-strikethrough → green = modified
            value. Gray = unchanged context shown for orientation.
          </li>
          <li>
            <strong>Swap the sides</strong> with the Swap button if you got
            them in the wrong order — it preserves the diff state.
          </li>
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Common use cases
        </h2>
        <p>
          <strong>API regression debugging.</strong> When &quot;the response
          changed&quot; but you can&apos;t see how, paste the old and new
          payloads here. The diff surfaces the exact field that&apos;s
          different.
        </p>
        <p>
          <strong>Config file review.</strong>{" "}
          <code>package.json</code>, <code>tsconfig.json</code>,
          Kubernetes manifests, Terraform plans — comparing two versions of
          structured config is exactly what this tool was built for.
        </p>
        <p>
          <strong>Snapshot comparison.</strong> If you&apos;re testing an
          endpoint and want to see what changed between two test runs, drop
          the two captured responses in.
        </p>
        <p>
          <strong>Code review pre-flight.</strong> Sometimes a PR&apos;s diff
          on a JSON fixture is cluttered by reformatting. Diffing the parsed
          values here gives you only the semantic changes.
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
          Use the{" "}
          <Link
            href="/json-formatter"
            className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            JSON Formatter
          </Link>{" "}
          to format and validate either input first if you suspect parse
          issues. Or the{" "}
          <Link
            href="/json-to-csv"
            className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            JSON to CSV converter
          </Link>{" "}
          if you want to dump the diff to a spreadsheet for further analysis.
          More Jsony tools coming soon: a JWT decoder and a Base64 encoder.
        </p>
      </section>
    </article>
  );
}
