import type { Metadata } from "next";
import Link from "next/link";
import CsvConverter from "@/components/tools/json/CsvConverter";

const TITLE = "JSON to CSV Converter";
const DESCRIPTION =
  "Convert JSON arrays to CSV in your browser. Pick your delimiter, choose whether to include a header row. Nothing leaves your browser — 100% client-side.";
const URL = "https://jsony.dev/json-to-csv";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/json-to-csv" },
  openGraph: {
    title: `${TITLE} — Jsony`,
    description: DESCRIPTION,
    url: "/json-to-csv",
    type: "website",
  },
};

const faqs = [
  {
    q: "What kinds of JSON can it convert?",
    a: "Best with an array of objects (the typical API response shape). A single object becomes a one-row CSV. An array of primitives becomes a single 'value' column. Nested objects and arrays in cell values are JSON-encoded into the cell so no information is lost.",
  },
  {
    q: "How are special characters escaped?",
    a: "RFC 4180 escaping. Cells containing the delimiter, double quotes, newlines, or carriage returns are wrapped in double quotes, and any literal double quotes are doubled (\"\"). This matches what Excel, Google Sheets, and most CSV parsers expect.",
  },
  {
    q: "Can I produce TSV (tab-separated values)?",
    a: "Yes. In the Delimiter setting, pick Tab. Pick Semicolon if you're working with European locales where comma is the decimal separator.",
  },
  {
    q: "Is my data private?",
    a: "Yes. The conversion runs in a Web Worker in your browser. There is no server endpoint, no upload, no analytics tracking your input. The complete source is open — see the GitHub link in the footer.",
  },
  {
    q: "What happens if the rows have different keys?",
    a: "The header row is the union of all keys, in first-seen order. Rows missing a key get an empty cell for that column. So a heterogeneous array still produces a clean rectangular CSV.",
  },
  {
    q: "Will this handle large files?",
    a: "Yes. Conversion runs in a Web Worker so the UI stays responsive even on multi-MB inputs. The same engine that powers the formatter handles the parse step.",
  },
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Jsony JSON to CSV Converter",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (web browser)",
    description: DESCRIPTION,
    url: URL,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Convert JSON arrays of objects to CSV",
      "Configurable delimiter: comma, tab, or semicolon",
      "Optional header row",
      "RFC 4180 escaping (quotes, commas, newlines)",
      "Handles heterogeneous keys via union",
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

export default function JsonToCsvPage() {
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
            JSON to CSV
          </span>
        </nav>

        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            JSON to CSV Converter
          </h1>
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
            Convert JSON arrays to CSV in your browser. Pick your delimiter,
            choose whether to include a header. Your data never leaves the
            page.
          </p>
        </header>

        <CsvConverter />

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
          What is the Jsony JSON to CSV Converter?
        </h2>
        <p>
          A fast, private converter that turns JSON arrays into CSV files
          ready to drop into Excel, Google Sheets, a database import tool, or
          a BI dashboard. Pick the delimiter, decide whether you want a header
          row, paste your JSON, and copy the result.
        </p>
        <p>
          Like the rest of Jsony, the conversion happens in your browser — no
          upload, no server endpoint, no telemetry on your data. The same
          Web Worker that powers the JSON Formatter parses and serialises
          here too, so multi-megabyte inputs stay snappy.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          How to use it
        </h2>
        <ol className="flex flex-col gap-2 pl-6 [list-style:decimal]">
          <li>
            <strong>Paste or load JSON.</strong> An array of objects is the
            sweet spot — that&apos;s the standard API response shape. A
            single object also works (becomes one row).
          </li>
          <li>
            <strong>Pick a delimiter.</strong> Comma is the default and what
            most tools expect. Tab gives you TSV (often friendlier when your
            data already contains commas). Semicolon is common in European
            locales.
          </li>
          <li>
            <strong>Toggle the header row.</strong> On by default — the first
            row contains column names derived from your object keys.
          </li>
          <li>
            <strong>Click Convert</strong> (or just paste — it auto-converts).
            The CSV appears in the right pane, with row and column counts in
            the status pill.
          </li>
          <li>
            <strong>Copy or paste into your destination.</strong> Use{" "}
            <em>Copy CSV</em> for the whole result, or select a portion and
            use Cmd/Ctrl+C.
          </li>
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Common use cases
        </h2>
        <p>
          <strong>Importing API responses into a spreadsheet.</strong> Pull a
          response from Postman, Insomnia, or curl, paste it here, copy the
          CSV, paste into Sheets. Two-step pipeline beats writing a script
          for one-off explorations.
        </p>
        <p>
          <strong>Bulk-loading data into a database.</strong> Most database
          import tools (Postgres COPY, MySQL LOAD DATA, BigQuery, etc.) prefer
          CSV over JSON. Convert here, save the file, run the import.
        </p>
        <p>
          <strong>Sharing data with non-technical colleagues.</strong> Not
          everyone reads JSON comfortably. CSV opens in Excel and Sheets
          natively — much easier to send to product, finance, or marketing
          teammates.
        </p>
        <p>
          <strong>Cleaning up scraped or exported data.</strong> Some export
          tools dump JSON when you really want a flat table. Convert here,
          drop the result into your tool of choice.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          What about nested objects?
        </h2>
        <p>
          When a cell value is itself an object or array, the converter
          stringifies it as JSON and escapes it into a single CSV cell. So a
          row like{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm dark:bg-zinc-800">
            {'{"id":1,"tags":["a","b"]}'}
          </code>{" "}
          becomes a CSV with two columns: <code>id</code> ={" "}
          <code>1</code>, <code>tags</code> = <code>{'"["a","b"]"'}</code>{" "}
          (escaped). No information is lost — the destination tool can either
          treat the cell as opaque text or re-parse the JSON.
        </p>
        <p>
          A future version may add a &quot;flatten with dot notation&quot;
          option that turns nested keys into <code>parent.child</code>{" "}
          columns. Until then, if you need flat output, transform the JSON
          first (the JSON Formatter&apos;s JSONPath query bar is good for
          this).
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
            href="/json-formatter"
            className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            JSON Formatter &amp; Validator
          </Link>{" "}
          is the place to start if you need to clean up or explore your JSON
          before converting. More Jsony tools are on the way: a JSON Diff for
          comparing two documents, a JWT decoder, and a Base64 encoder.
        </p>
      </section>
    </article>
  );
}
