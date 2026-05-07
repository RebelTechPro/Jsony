import type { Metadata } from "next";
import Link from "next/link";
import JwtDecoder from "@/components/tools/json/JwtDecoder";

const TITLE = "JWT Decoder";
const DESCRIPTION =
  "Decode JSON Web Tokens to inspect their header, payload, and signature. 100% client-side — your token never leaves the browser.";
const URL = "https://jsony.dev/jwt-decoder";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/jwt-decoder" },
  openGraph: {
    title: `${TITLE} — Jsony`,
    description: DESCRIPTION,
    url: "/jwt-decoder",
    type: "website",
  },
};

const faqs = [
  {
    q: "Is it safe to paste my JWT here?",
    a: "Yes, safer than most online JWT decoders. Decoding runs entirely in your browser — no token is sent to a server, no analytics tracks the input. The complete source is open on GitHub. That said: a JWT often contains identifying claims (sub, email), so general caution about pasting tokens into any tool still applies.",
  },
  {
    q: "Why doesn't this verify the signature?",
    a: "Signature verification requires the issuer's secret or public key. Doing that in a browser would mean either trusting the page with your secret (defeats the point) or trusting a server (defeats the point). Verification is fundamentally a server-side operation. This tool decodes for inspection — useful for debugging, comparing claims, checking expiration — but doesn't claim to verify authenticity.",
  },
  {
    q: "What's the color coding?",
    a: "Standard JWT convention: header is purple/violet, payload is amber/yellow, signature is green. Same scheme jwt.io uses, so the visual matches what most developers expect.",
  },
  {
    q: "Does it understand standard claims?",
    a: "Yes. iss, sub, aud, exp, iat, nbf, and jti are surfaced in a separate claims summary. Timestamps (exp, iat, nbf) are converted to ISO dates and a relative time (e.g., \"in 2 days\" or \"3 hours ago\"). Expired or not-yet-valid tokens are flagged.",
  },
  {
    q: "What if my token is in the wrong format?",
    a: "The decoder expects three dot-separated segments (header.payload.signature). 'Bearer ' prefixes are stripped automatically. If a segment isn't valid base64url or doesn't decode to JSON, you'll get a specific error pointing at which segment failed.",
  },
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Jsony JWT Decoder",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (web browser)",
    description: DESCRIPTION,
    url: URL,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Decode JWT header and payload",
      "Surface standard claims (iss, sub, aud, exp, iat, nbf, jti)",
      "Show expiration status with relative timestamps",
      "Color-coded segments matching jwt.io convention",
      "Bearer prefix automatically stripped",
      "100% client-side — token never leaves your browser",
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

export default function JwtDecoderPage() {
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
          <span className="text-zinc-900 dark:text-zinc-100">JWT Decoder</span>
        </nav>

        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            JWT Decoder
          </h1>
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
            Decode JSON Web Tokens in your browser to inspect header,
            payload, and signature. Your token never leaves the page.
          </p>
        </header>

        <JwtDecoder />

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
          What is the Jsony JWT Decoder?
        </h2>
        <p>
          A privacy-respecting JWT inspector. Paste a token, see its three
          parts (header, payload, signature) decoded into readable JSON. Use
          it to check what claims a token carries, when it expires, who
          issued it, and what the signature looks like — without sending the
          token to a third-party server.
        </p>
        <p>
          The decoder is deliberately scoped to <em>inspection</em>. It
          doesn&apos;t verify the signature. That&apos;s a separate question
          (one that requires the issuer&apos;s key) and can&apos;t be
          answered honestly in a browser. See the FAQ below for the longer
          version of why.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          How to use it
        </h2>
        <ol className="flex flex-col gap-2 pl-6 [list-style:decimal]">
          <li>
            <strong>Paste your token.</strong> A <code>Bearer </code> prefix
            is fine — it gets stripped automatically.
          </li>
          <li>
            <strong>Read the decoded panels.</strong> Header (purple) shows
            the algorithm and token type. Payload (amber) shows the claims —
            who, when, what. Signature (green) is shown raw.
          </li>
          <li>
            <strong>Check the standard claims summary.</strong> Below the
            payload, a small table calls out{" "}
            <code>iss</code>, <code>sub</code>, <code>aud</code>,{" "}
            <code>exp</code>, <code>iat</code>, <code>nbf</code>,{" "}
            <code>jti</code>. Timestamps are shown as ISO dates plus a
            relative time. Expired tokens and tokens that aren&apos;t yet
            valid (nbf in the future) are flagged red.
          </li>
          <li>
            <strong>Copy a section</strong> with the per-section Copy button
            if you need to paste the decoded JSON elsewhere.
          </li>
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Common use cases
        </h2>
        <p>
          <strong>Debugging authentication errors.</strong> &quot;The API
          returned 401 with my token attached.&quot; Paste the token here,
          confirm it hasn&apos;t expired, check that the audience matches
          what the API expects.
        </p>
        <p>
          <strong>Inspecting third-party tokens.</strong> An OAuth
          provider gave you a JWT and you want to see what it actually
          contains. The decoder is faster than copy-pasting into a console
          to call <code>atob</code> twice.
        </p>
        <p>
          <strong>Verifying expiration during testing.</strong> While
          testing time-based logic, paste a token to confirm what its{" "}
          <code>exp</code> resolves to in your local time zone. The
          relative time (&quot;in 5 minutes&quot;) makes test setup easier
          to reason about.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          A note on signature verification
        </h2>
        <p>
          Many online JWT tools have a &quot;verify signature&quot; box
          that asks you to paste your secret. <strong>Don&apos;t.</strong>{" "}
          Either:
        </p>
        <ul className="flex flex-col gap-1 pl-6 [list-style:disc]">
          <li>
            Their JS does the verification client-side, in which case the
            tool didn&apos;t actually need your secret to be on their
            domain — it could have been entirely local. So why did they
            ask?
          </li>
          <li>
            Or the verification happens server-side, in which case your
            secret is now on someone else&apos;s server. Bad.
          </li>
        </ul>
        <p>
          Jsony doesn&apos;t offer signature verification at all. If you
          need to verify, do it where the secret already lives: your API
          server, your CLI, your test environment.
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
            JSON Formatter
          </Link>{" "}
          can take the decoded payload (or header) and let you explore it as
          a tree. The{" "}
          <Link
            href="/base64"
            className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Base64 encoder/decoder
          </Link>{" "}
          (coming soon) is useful when you&apos;re debugging the raw segments
          of a token directly.
        </p>
      </section>
    </article>
  );
}
