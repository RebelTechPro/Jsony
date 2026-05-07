import Link from "next/link";

const tools = [
  {
    slug: "json-formatter",
    name: "JSON Formatter & Validator",
    description:
      "Paste, format, validate, and explore JSON. Handles 50MB payloads without freezing.",
    status: "in-progress",
  },
  {
    slug: "json-to-csv",
    name: "JSON to CSV",
    description: "Convert JSON arrays into CSV.",
    status: "in-progress",
  },
  {
    slug: "json-diff",
    name: "JSON Diff",
    description: "Compare two JSON documents and see what changed.",
    status: "planned",
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode a JWT to inspect its header and payload.",
    status: "planned",
  },
  {
    slug: "base64",
    name: "Base64 Encoder & Decoder",
    description: "Encode or decode Base64 strings.",
    status: "planned",
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
          jsony.dev
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          JSON, fast and local.
        </h1>
        <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Fast, private developer tools for JSON and beyond. Everything runs in
          your browser — your data never leaves the page.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Tools
        </h2>
        <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
          {tools.map((tool) => (
            <li key={tool.slug} className="py-4">
              {tool.status === "in-progress" ? (
                <Link
                  href={`/${tool.slug}`}
                  className="group flex flex-col gap-1"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-medium group-hover:underline">
                      {tool.name}
                    </span>
                    <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      in progress
                    </span>
                  </span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {tool.description}
                  </span>
                </Link>
              ) : (
                <div className="flex flex-col gap-1 opacity-60">
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{tool.name}</span>
                    <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                      planned
                    </span>
                  </span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {tool.description}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-auto flex flex-col gap-2 border-t border-zinc-200 pt-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <p>
          100% client-side. No tracking, no uploads, no cookie banner.{" "}
          <a
            href="https://github.com/RebelTechPro/Jsony"
            className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            View source on GitHub
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
