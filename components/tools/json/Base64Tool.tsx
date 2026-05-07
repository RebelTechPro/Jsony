"use client";

import { useEffect, useMemo, useState } from "react";
import {
  decodeBase64,
  encodeBase64,
  type Base64Variant,
} from "@/lib/json/base64";

type Mode = "encode" | "decode";

const STORAGE_KEY = "jsony.base64.options";

type Options = {
  mode: Mode;
  variant: Base64Variant;
};

const DEFAULT_OPTIONS: Options = {
  mode: "encode",
  variant: "standard",
};

function loadOptions(): Options {
  if (typeof window === "undefined") return DEFAULT_OPTIONS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_OPTIONS;
    const p = JSON.parse(raw) as Partial<Options>;
    return {
      mode: p.mode === "encode" || p.mode === "decode" ? p.mode : "encode",
      variant:
        p.variant === "standard" || p.variant === "url"
          ? p.variant
          : "standard",
    };
  } catch {
    return DEFAULT_OPTIONS;
  }
}

function saveOptions(o: Options) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
  } catch {
    // ignore
  }
}

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<Options>(DEFAULT_OPTIONS);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOptions(loadOptions());
  }, []);

  useEffect(() => {
    saveOptions(options);
  }, [options]);

  const result = useMemo(() => {
    if (input === "") return null;
    return options.mode === "encode"
      ? encodeBase64(input, options.variant)
      : decodeBase64(input, options.variant);
  }, [input, options]);

  const handleSwap = () => {
    if (result?.ok) {
      setOptions({ ...options, mode: options.mode === "encode" ? "decode" : "encode" });
      setInput(result.output);
    }
  };

  const handleCopy = async () => {
    if (!result?.ok || !result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    setTimeout(() => setCopyState("idle"), 1500);
  };

  const inputLabel = options.mode === "encode" ? "Plain text" : "Base64";
  const outputLabel = options.mode === "encode" ? "Base64" : "Plain text";

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          ariaLabel="Mode"
          value={options.mode}
          onChange={(mode) => setOptions({ ...options, mode })}
          options={[
            { value: "encode", label: "Encode" },
            { value: "decode", label: "Decode" },
          ]}
        />
        <Segmented
          ariaLabel="Alphabet"
          value={options.variant}
          onChange={(variant) => setOptions({ ...options, variant })}
          options={[
            { value: "standard", label: "Standard" },
            { value: "url", label: "URL-safe" },
          ]}
        />
        <button
          type="button"
          onClick={handleSwap}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          disabled={!result?.ok}
        >
          Swap
        </button>
        <button
          type="button"
          onClick={() => setInput("")}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          disabled={input === ""}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          disabled={!result?.ok || !result.output}
        >
          {copyState === "copied"
            ? "Copied"
            : copyState === "error"
              ? "Copy failed"
              : "Copy output"}
        </button>
      </div>

      <div className="grid flex-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-[20rem] flex-col gap-2 lg:min-h-[24rem]">
          <label
            htmlFor="b64-input"
            className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
          >
            {inputLabel}
          </label>
          <textarea
            id="b64-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder={
              options.mode === "encode"
                ? "Paste text to encode…"
                : "Paste base64 to decode…"
            }
            className="h-full w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 font-mono text-sm leading-6 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
          />
        </div>
        <div className="flex min-h-[20rem] flex-col gap-2 lg:min-h-[24rem]">
          <label
            htmlFor="b64-output"
            className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
          >
            {outputLabel}
          </label>
          <textarea
            id="b64-output"
            value={result?.ok ? result.output : ""}
            readOnly
            spellCheck={false}
            placeholder="Output will appear here."
            className="h-full w-full resize-none rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm leading-6 text-zinc-900 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
          {result && !result.ok && (
            <p className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
              {result.error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (next: T) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex rounded-md border border-zinc-200 p-0.5 text-xs dark:border-zinc-800"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={
              active
                ? "rounded bg-zinc-900 px-2.5 py-1 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "rounded px-2.5 py-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
