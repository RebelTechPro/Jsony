# Jsony

**JSON, fast and local.** Fast, private developer tools for JSON and beyond. Everything runs in your browser — your data never leaves the page.

Live at [jsony.dev](https://jsony.dev).

## What's here

- `/json-formatter` — anchor tool: format, validate, and explore JSON. Handles 50MB payloads without freezing.
- More tools coming: JSON to CSV, JSON Diff, JWT Decoder, Base64.

## Why

Existing free JSON tools are slow on large payloads, ad-cluttered, send your data to servers, and have weak UX for exploring complex JSON. Jsony does all the work in your browser — no uploads, no tracking, no cookie banner. The source is here so you can verify that.

## Stack

Next.js 16 (App Router), React 19, Tailwind 4, TypeScript strict mode. Deployed on Vercel.

## Local development

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Project posture

This is a personal project. Issues are welcome but there's no SLA — I'll get to them when I can. PRs are reviewed when I have time. If you find a parsing edge case or a perf regression, a fixture in the issue helps a lot.

## License

[MIT](./LICENSE).
