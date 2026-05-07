"use client";

import { useMemo, useState } from "react";
import { decodeJwt, type JwtPart, type KnownClaims } from "@/lib/json/jwt";

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoder() {
  const [input, setInput] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const result = useMemo(() => {
    if (input.trim() === "") return null;
    return decodeJwt(input);
  }, [input]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    setTimeout(() => setCopyState("idle"), 1500);
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setInput(SAMPLE_JWT)}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Load sample
        </button>
        <button
          type="button"
          onClick={() => setInput("")}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          disabled={input === ""}
        >
          Clear
        </button>
        <div className="ml-auto">
          {result && !result.ok && (
            <span className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
              Invalid token
            </span>
          )}
          {result && result.ok && (
            <ClaimSummary claims={result.claims} />
          )}
        </div>
      </div>

      <label
        htmlFor="jwt-input"
        className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
      >
        Encoded JWT
      </label>
      <textarea
        id="jwt-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        spellCheck={false}
        rows={5}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        placeholder="Paste a JWT here. Bearer prefix is OK."
        className="w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 font-mono text-sm leading-6 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
      />
      {input !== "" && (
        <ColorPreview input={input} valid={!!result?.ok} />
      )}

      {result && !result.ok && (
        <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
          {result.error}
        </div>
      )}

      {result && result.ok && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Section
            label="Header"
            colorClass="text-violet-700 dark:text-violet-400"
            part={result.header}
            onCopy={handleCopy}
            copyState={copyState}
          />
          <Section
            label="Payload"
            colorClass="text-amber-700 dark:text-amber-400"
            part={result.payload}
            onCopy={handleCopy}
            copyState={copyState}
            extras={<ClaimList claims={result.claims} />}
          />
          <SignatureSection raw={result.signature.raw} />
        </div>
      )}
    </div>
  );
}

function ColorPreview({ input, valid }: { input: string; valid: boolean }) {
  const trimmed = input.trim().replace(/^Bearer\s+/i, "");
  const segs = trimmed.split(".");
  if (segs.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs leading-6 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="text-violet-600 dark:text-violet-400">{segs[0]}</span>
      {segs.length > 1 && (
        <>
          <span className="text-zinc-500">.</span>
          <span className="text-amber-600 dark:text-amber-400">{segs[1]}</span>
        </>
      )}
      {segs.length > 2 && (
        <>
          <span className="text-zinc-500">.</span>
          <span className="text-emerald-600 dark:text-emerald-400">
            {segs[2]}
          </span>
        </>
      )}
      {!valid && (
        <span className="ml-2 text-rose-600 dark:text-rose-400">
          ⚠ malformed
        </span>
      )}
    </div>
  );
}

function Section({
  label,
  colorClass,
  part,
  onCopy,
  copyState,
  extras,
}: {
  label: string;
  colorClass: string;
  part: JwtPart;
  onCopy: (text: string) => void;
  copyState: "idle" | "copied" | "error";
  extras?: React.ReactNode;
}) {
  const display = part.parsed
    ? JSON.stringify(part.parsed, null, 2)
    : part.decoded;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3
          className={`text-xs font-medium uppercase tracking-wider ${colorClass}`}
        >
          {label}
        </h3>
        <button
          type="button"
          onClick={() => onCopy(display)}
          className="rounded border border-zinc-300 px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          {copyState === "copied" ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="min-h-[8rem] overflow-auto rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm leading-6 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
        {part.parseError ? (
          <span className="text-rose-600 dark:text-rose-400">
            {part.parseError}
            {"\n\n"}
            {part.decoded}
          </span>
        ) : (
          display
        )}
      </pre>
      {extras}
    </div>
  );
}

function SignatureSection({ raw }: { raw: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
        Signature
      </h3>
      <pre className="min-h-[8rem] overflow-auto break-all rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm leading-6 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
        {raw || <span className="text-zinc-400">(empty)</span>}
      </pre>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Signature is shown raw. Verifying it requires the issuer&apos;s key
        — that&apos;s a server-side concern and isn&apos;t possible in a
        browser without trusting the page with that key.
      </p>
    </div>
  );
}

function ClaimSummary({ claims }: { claims: KnownClaims }) {
  if (claims.exp) {
    return (
      <span
        className={
          claims.exp.expired
            ? "rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300"
            : "rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
        }
      >
        {claims.exp.expired ? "Expired" : "Valid"} · exp{" "}
        {formatRelative(claims.exp.value)}
      </span>
    );
  }
  return (
    <span className="rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
      Decoded
    </span>
  );
}

function ClaimList({ claims }: { claims: KnownClaims }) {
  const rows: { label: string; value: string; warn?: boolean }[] = [];
  if (claims.iss) rows.push({ label: "iss", value: claims.iss });
  if (claims.sub) rows.push({ label: "sub", value: claims.sub });
  if (claims.aud)
    rows.push({
      label: "aud",
      value: Array.isArray(claims.aud) ? claims.aud.join(", ") : claims.aud,
    });
  if (claims.jti) rows.push({ label: "jti", value: claims.jti });
  if (claims.iat)
    rows.push({
      label: "iat",
      value: `${claims.iat.date} (${formatRelative(claims.iat.value)})`,
    });
  if (claims.nbf)
    rows.push({
      label: "nbf",
      value: `${claims.nbf.date} (${claims.nbf.active ? "active" : "not yet active"})`,
      warn: !claims.nbf.active,
    });
  if (claims.exp)
    rows.push({
      label: "exp",
      value: `${claims.exp.date} (${formatRelative(claims.exp.value)})`,
      warn: claims.exp.expired,
    });
  if (rows.length === 0) return null;
  return (
    <dl className="rounded-md border border-zinc-200 bg-white p-3 text-xs dark:border-zinc-800 dark:bg-zinc-950">
      {rows.map((r) => (
        <div key={r.label} className="flex gap-2 py-0.5">
          <dt className="w-10 shrink-0 font-mono text-zinc-500 dark:text-zinc-400">
            {r.label}
          </dt>
          <dd
            className={
              r.warn
                ? "text-rose-700 dark:text-rose-400"
                : "text-zinc-800 dark:text-zinc-200"
            }
          >
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function formatRelative(unixSeconds: number): string {
  const nowSec = Date.now() / 1000;
  const diff = unixSeconds - nowSec;
  const abs = Math.abs(diff);
  const future = diff > 0;
  let value: string;
  if (abs < 60) value = `${Math.round(abs)}s`;
  else if (abs < 3600) value = `${Math.round(abs / 60)}m`;
  else if (abs < 86400) value = `${Math.round(abs / 3600)}h`;
  else if (abs < 86400 * 365) value = `${Math.round(abs / 86400)}d`;
  else value = `${(abs / 86400 / 365).toFixed(1)}y`;
  return future ? `in ${value}` : `${value} ago`;
}
