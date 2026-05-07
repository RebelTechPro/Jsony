# CLAUDE.md

This file gives Claude Code persistent context for this project. Read it at the start of every session.

@AGENTS.md

## Current Status (as of 2026-05-03)

- **Scaffolded.** Next.js 16.2.4 + React 19 + Tailwind 4 + TypeScript strict, App Router, no `src/` dir, `@/*` import alias, ESLint, Turbopack dev. Created via `create-next-app` and merged into project root.
- **Brand/domain:** `jsony.dev` (purchased). Display name: **Jsony**. Fresh domain — no inherited SEO authority, starts at zero.
- **License & repo:** MIT, public GitHub repo on **rebeltechpro** (transferable to a `jsony` org later if needed). README posture: "personal project, issues welcome but no SLA, PRs reviewed when I have time" — captures the trust/SEO benefits of OSS without committing to community-management overhead.
- **Next.js 16 caveat:** This version postdates Claude's training cutoff. See `AGENTS.md` (auto-imported above) — when in doubt, consult `node_modules/next/dist/docs/` rather than relying on memory.
- **Pending user actions:** create GitHub repo on rebeltechpro account, add as remote; create Cloudflare Pages project connected to the repo with build command `npm run build` and output dir `out`; add `jsony.dev` as a custom domain in Cloudflare Pages (DNS auto-configures if `jsony.dev` is on Cloudflare). All require the user's auth — Claude can't do them.
- **Phase 1 complete and live at https://jsony.dev/.** Cloudflare Pages connected to RebelTechPro/Jsony, jsony.dev moved to Cloudflare DNS (registered at Hostinger), CNAME-flattening at apex points at jsony.pages.dev. www.jsony.dev also serves but currently as a duplicate (no redirect to apex configured yet — TODO).
- **Mobile Lighthouse on /json-formatter: Performance 97, Accessibility 97, Best Practices 96, SEO 100.** CLAUDE.md success criterion of 90+ on all four met.
- **Pending user actions:** (1) Search Console — verify ownership via DNS TXT, submit sitemap.xml, request indexing for / and /json-formatter; (2) consider OG image (none set; social shares fall back to favicon); (3) update LICENSE copyright holder to legal name if needed. (Web Analytics already auto-injected via Cloudflare proxy. www → apex 301 redirect now live via Cloudflare Redirect Rule.)
- **Phase 2 complete.** All 5 tools live: /json-formatter, /json-to-csv, /json-diff, /jwt-decoder, /base64. Each follows the same pattern: a pure lib function, a worker handler (where the work is heavy enough to warrant it — JSON Formatter, CSV, and Diff use the worker; JWT Decoder and Base64 run on the main thread because they're synchronous and small), a client component, and a route page with full SEO payload (canonical, three JSON-LD schemas, ~800 words supporting content, sitemap entry).
- **Next concrete step:** Phase 3 — iterate based on Search Console data. Wait ~2 weeks for indexing + initial impression data, then identify which queries are showing impressions, strengthen winners, rework or remove non-performers. Add adjacent tools based on actual search traffic (CLAUDE.md Phase 3).

Update this section as state changes. If you're a future session reading this, trust the filesystem over this block — verify before acting.

## Project Overview

**Name:** Jsony  •  **Domain:** jsony.dev

**What we're building:** A best-in-class JSON formatter, validator, and inspector for developers working with real-world API responses. This is the anchor tool for a broader site of fast, clean, privacy-respecting developer and text utilities.

**Why we're building it:** The existing free JSON tools (JSONLint, jsonformatter.org, jsonformatter.curiousconcept.com, etc.) are slow on large payloads, ad-cluttered, send data to servers, and have weak UX for actually exploring complex JSON. There is a real, underserved audience: developers who paste in 1MB+ API responses and need to navigate them quickly without leaking data to a third-party server.

**Business model:** SEO-driven organic traffic → display ads (low density, below the fold only) + relevant affiliate offers (e.g., API tools, developer SaaS). Long-term: a small portfolio of similarly differentiated dev/text tools sharing the same domain authority.

**Success criteria for v1:** Tool is live, indexed by Google, passes Core Web Vitals (90+ mobile PageSpeed score), and beats every top-10 ranking competitor on at least 3 measurable UX dimensions. Large-payload behavior split into two distinct targets:
- **First paint <1.5s LCP** — measured with an empty editor, no payload. Independent of input size.
- **50MB payload remains interactive** — paste a 50MB document, the UI never freezes (no main-thread block >200ms), tree renders progressively, scroll/expand stay smooth. Achieved via Web Worker + virtualization, not by parsing fast.

## Strategic Positioning

**Tagline:** "JSON, fast and local." — leads with both pillars (performance + privacy) in four words. Use across homepage hero, OG description, and footer. Tool-page `<title>` tags should still lead with the keyword, not the tagline.

**Core differentiators (all must ship in v1):**
1. **Performance** — handles huge payloads (50MB+) without freezing the browser. Virtualized tree rendering required.
2. **Privacy** — 100% client-side processing. Zero network calls with user data. This must be advertised prominently. Source is public on GitHub under MIT, with a "View source" link in the footer — the privacy claim is verifiable, not just asserted. This is a differentiator over every closed-source competitor in the top 10.
3. **JSONPath / query bar** — users can filter/extract from JSON using JSONPath syntax (`$.users[*].email`). Live results as they type.
4. **Smart error messages** — when JSON is invalid, point to exact line/column with a human-readable explanation, not "Unexpected token at position 1247."
5. **Multi-view** — toggleable tree view (collapsible, searchable) and raw formatted view. (Diff is a separate Phase 2 tool at `/json-diff`, not a view inside the formatter — keeps the anchor tool focused.)
6. **Clipboard-first UX** — Cmd/Ctrl+V auto-formats pasted content; Cmd/Ctrl+C copies formatted output. Works without any button clicks for the common case.
7. **Sane configurability** — indent (2/4/tab), sort keys, JSON5 / trailing comma tolerance, all remembered across sessions via localStorage.
8. **Clean UI** — no ads above the fold, no popups, no cookie banner theater (use Cloudflare or similar for compliance without intrusion), dark mode, keyboard-accessible.

**Non-goals for v1:** User accounts, saved snippets, sharing/permalinks (consider for v2), API access, paid tier.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Hosting:** Cloudflare Pages (static export). `next.config.ts` has `output: "export"` — the build produces an `out/` directory of static HTML/JS/CSS. No SSR, no API routes, no Node runtime in production. This is enforced architecturally: `output: "export"` will fail the build if anyone adds a route that requires server rendering, which is exactly the constraint we want for the "100% client-side" promise.
- **Styling:** Tailwind CSS
- **Language:** TypeScript (strict mode)
- **JSON parsing:** Native `JSON.parse` for valid input; a tolerant parser (e.g., `jsonc-parser` or custom) for error reporting with line/column info
- **Heavy work off-main-thread:** Parsing, JSONPath evaluation, and diff for payloads above ~1MB must run in a Web Worker. `JSON.parse` is synchronous and will jank or freeze the UI on multi-MB inputs otherwise. The "50MB smoothly" success criterion depends on this.
- **Worker bundling caveat:** Next.js 16.2.4 + Turbopack + `output: "export"` does not currently bundle workers via the standard `new Worker(new URL('./worker.ts', import.meta.url))` pattern — it copies the source `.ts` file as a static asset instead of compiling it. We work around this by pre-bundling the worker with esbuild (`scripts/build-worker.mjs`) into `public/parse.worker.js`, then loading it as `new Worker('/parse.worker.js')`. The build script runs automatically before `next build` and `next dev`. If/when Turbopack's worker handling stabilizes for static export, this can be deleted.
- **JSONPath:** `jsonpath-plus` or equivalent
- **Tree virtualization:** `@tanstack/react-virtual` or `react-window`
- **Diff:** `jsondiffpatch` for structural diffing
- **Analytics:** Cloudflare Web Analytics (cookieless, free, built into Cloudflare Pages). Aligns with the privacy positioning. Do **not** add Google Analytics: it requires a consent banner in the EU and undermines the "no tracking" story.
- **Search Console:** set up before public launch (no cookies, safe to use).

**Architectural rule:** All JSON processing must happen client-side. No API routes that accept user JSON. This is a feature, not just an implementation choice.

## Project Structure

```
/app
  /                    → homepage (lists all tools by category)
  /json-formatter      → primary tool (anchor page)
  /json-to-csv         → tool 2
  /json-diff           → tool 3
  /jwt-decoder         → tool 4
  /base64              → tool 5
  /about
  /privacy
  /sitemap.xml
  /robots.txt
/components
  /tools/json/         → JSON-specific components (TreeView, QueryBar, ErrorDisplay, etc.)
  /shared/             → Layout, Header, Footer, AdSlot, ToolPageWrapper
/lib
  /json/               → parsing, validation, formatting, JSONPath logic
  /seo/                → metadata helpers, schema.org generators
/content
  /json-formatter.mdx  → supporting content (FAQ, how-it-works, use cases)
```

Each tool page = one route + one supporting MDX content file rendered below the tool.

## SEO Requirements (non-negotiable for every tool page)

Every tool page MUST have:
- `<title>` matching the primary keyword exactly (e.g., "JSON Formatter & Validator — Jsony")
- `<h1>` matching the keyword
- URL slug matching the keyword (`/json-formatter`, not `/tools/json/format`)
- Meta description (150-160 chars) including the keyword and the value prop
- 600-1200 words of supporting content below the tool (what it does, how to use it, FAQ, common use cases, related tools)
- Schema.org markup: `SoftwareApplication`, `FAQPage`, and `BreadcrumbList`
- Open Graph and Twitter card metadata
- Internal links to at least 3 related tools
- Canonical URL set
- Lighthouse mobile score 90+ on Performance, Accessibility, Best Practices, SEO

The supporting content is what Google ranks. The tool is what users use. Both matter.

## Performance Budget

- First Contentful Paint: < 1.0s
- Largest Contentful Paint: < 1.5s
- Total Blocking Time: < 200ms
- Cumulative Layout Shift: < 0.05
- Initial JS bundle: **< 150KB gzipped first load** (this is what the user actually downloads, framework runtime included). Heavy libs — tolerant parser, `jsonpath-plus`, `jsondiffpatch`, the worker payload — must be dynamically imported and do not count toward this budget. Wire `@next/bundle-analyzer` early; treat a regression past 150KB as a build failure, not a warning.

Use dynamic imports for the JSON parser, JSONPath engine, and diff library. They should not block first paint.

## Development Priorities (in order)

### Phase 1 — Anchor tool MVP (target: 7-10 days part-time)
1. Project scaffolding, layout, homepage skeleton, deploy pipeline
2. Basic JSON formatter: input textarea, format button, output, validation
3. Tree view with collapsible nodes
4. Smart error messages with line/column
5. Large-payload handling via virtualization
6. JSONPath query bar
7. Clipboard UX (paste-to-format, copy-formatted)
8. Configurable formatting (indent, sort keys, JSON5 tolerance) with localStorage persistence
9. Dark mode + responsive mobile
10. Supporting MDX content + schema markup
11. Lighthouse pass, Search Console submission

### Phase 2 — Cluster expansion (target: weeks 2-6)
- JSON to CSV converter
- JSON Diff tool
- JWT decoder
- Base64 encoder/decoder
- Internal linking pass, sitemap, homepage tool index

### Phase 3 — Iterate based on Search Console data (ongoing from week 6+)
- Identify which queries are showing impressions
- Strengthen winners; rework or remove non-performers
- Add adjacent tools based on actual search traffic

## Code Standards

- TypeScript strict mode
- Functional React components with hooks; no class components
- Server components by default; `'use client'` only where needed (most tool logic is client-side)
- Tailwind utility classes; minimal custom CSS
- Accessibility: all interactive elements keyboard-navigable, ARIA labels where appropriate, color contrast WCAG AA minimum
- No external CSS/JS from CDNs in `<head>` that block render
- Lazy-load anything below the fold

## Testing

Three checks, each targeting a specific product promise. Don't expand beyond these without a clear reason — the bar is "one test per differentiator that would otherwise silently regress," not "broad coverage."

**1. Unit tests (Vitest)** — parser/formatter/JSONPath logic and error-message line/column accuracy. Fixture-driven: input/expected pairs covering edge cases (trailing commas, deep nesting, unicode escapes, large numbers, malformed inputs with known error positions). Runs on every PR.

**2. Bundle-size check (CI)** — `next build` plus a script that reads the build manifest; first-load JS over 150KB gzipped fails the build. Heavy libs (tolerant parser, `jsonpath-plus`, `jsondiffpatch`, worker payloads) must be code-split and don't count. Use `@next/bundle-analyzer` for diagnostics when this trips.

**3. Playwright E2E (deliberately small)** — two tests, both targeting things invisible when broken:
- **50MB smoke** — paste a 50MB fixture, assert no main-thread block exceeds 200ms, assert the tree renders interactively.
- **Privacy assertion** — intercept all network requests during a paste → format → query → copy flow; assert none contain bytes from the input.

A third E2E for Safari's clipboard permission flow is OK to add when it bites — don't write it preemptively.

**Fixture ladder** — store at `/test/fixtures/` as `1kb.json`, `100kb.json`, `1mb.json`, `10mb.json`, `50mb.json`. Shared between unit tests (correctness across sizes) and E2E (UI behavior at scale). Generate the larger ones with a script committed to the repo, not by checking in 50MB blobs.

**Skip for now:** Lighthouse CI (run manually before launch), React Testing Library component tests (RTL + virtualization is fiddly; covered well enough via E2E), broad coverage of every UI flow. Add tests when something breaks, not preemptively.

## Competitive Reference (study these, then beat them)

Top current ranking JSON formatters as of project start:
- jsonformatter.org
- jsonlint.com
- jsonformatter.curiousconcept.com
- codebeautify.org/jsonviewer
- jsonformatter.io

For each: note what they do well, what's broken, what's missing. The differentiators above are derived from this analysis but should be revalidated.

## Things to Ask Before Coding

When starting a new feature or session, surface these questions if relevant:
- Does this feature compromise the "100% client-side" promise?
- Does this add to the JS bundle? Is it lazy-loadable?
- Does this slow down first paint?
- Is there a keyword research signal that this feature/tool is searched for?
- Will this work on mobile?

## Open Questions / Decisions Pending

- Ad network choice (AdSense vs. Carbon Ads vs. EthicalAds vs. direct sponsorships) — defer until traffic exists
- Whether to support permalink/sharing of formatted JSON in v2 (privacy implications — must be opt-in and client-side encoded only)

## Notes for Claude Code

- **Hard rule: nothing user-entered leaves the browser.** No `fetch`/API route that takes JSON as input. If you find yourself writing one, stop.
- **Hard rule: every new dependency gets weighed against the 100KB initial-bundle target.** Heavy libs (parser, JSONPath, diff) must be dynamically imported and code-split, not pulled into the main bundle.
- When in doubt, optimize for performance and privacy over features.
- Ship narrow and excellent, not broad and mediocre.
- Every tool added must clear the same SEO + performance bar as the anchor tool — no exceptions.
- The site's reputation is shared across tools; one slow, ad-heavy page hurts all of them.
