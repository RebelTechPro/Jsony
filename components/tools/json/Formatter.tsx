"use client";

import { useEffect, useRef, useState } from "react";
import TreeView from "@/components/tools/json/TreeView";
import type { RichError } from "@/lib/json/parse-rich";
import type { WorkerResponse } from "@/components/tools/json/parse.worker";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type Settings,
} from "@/lib/json/settings";
import { readFileAsText, useFileDrop } from "@/lib/hooks/useFileDrop";

type OutputState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "parsed"; value: unknown; raw: string; bytes: number }
  | { kind: "invalid"; errors: RichError[] };

type QueryState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; value: unknown; raw: string; bytes: number; count: number }
  | { kind: "error"; message: string };

type ViewMode = "tree" | "raw";

const QUERY_DEBOUNCE_MS = 250;

export default function Formatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<OutputState>({ kind: "idle" });
  const [view, setView] = useState<ViewMode>("tree");
  const [query, setQuery] = useState("");
  const [queryState, setQueryState] = useState<QueryState>({ kind: "idle" });
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Client-only hydration of saved settings. This must run after mount,
    // not in the useState initializer, because localStorage is unavailable
    // during static-export SSR and using it there would cause a hydration
    // mismatch. The flash of defaults isn't visible because output is empty
    // on first render anyway.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loadSettings());
  }, []);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const pendingRef = useRef(
    new Map<number, (r: WorkerResponse) => void>(),
  );
  const wasPastedRef = useRef(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const ensureWorker = (): Worker | null => {
    if (typeof window === "undefined") return null;
    if (!workerRef.current) {
      const worker = new Worker("/parse.worker.js");
      worker.addEventListener("message", (e: MessageEvent<WorkerResponse>) => {
        const handler = pendingRef.current.get(e.data.id);
        if (handler) {
          pendingRef.current.delete(e.data.id);
          handler(e.data);
        }
      });
      workerRef.current = worker;
    }
    return workerRef.current;
  };

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const formatText = async (text: string, settingsOverride?: Settings) => {
    const worker = ensureWorker();
    if (!worker) return;

    const effectiveSettings = settingsOverride ?? settings;
    const id = ++requestIdRef.current;
    setOutput({ kind: "loading" });
    setQueryState({ kind: "idle" });

    const result = await new Promise<WorkerResponse>((resolve) => {
      pendingRef.current.set(id, resolve);
      worker.postMessage({
        kind: "parse",
        id,
        input: text,
        settings: effectiveSettings,
      });
    });

    if (id !== requestIdRef.current) return;
    if (result.kind !== "parse") return;

    if (!result.ok) {
      setOutput({ kind: "invalid", errors: result.errors });
      return;
    }
    if (result.value === undefined) {
      setOutput({ kind: "idle" });
      return;
    }
    setOutput({
      kind: "parsed",
      value: result.value,
      raw: result.raw,
      bytes: result.bytes,
    });
  };

  const runQuery = async (path: string) => {
    const worker = ensureWorker();
    if (!worker) return;
    const id = ++requestIdRef.current;
    setQueryState({ kind: "loading" });

    const result = await new Promise<WorkerResponse>((resolve) => {
      pendingRef.current.set(id, resolve);
      worker.postMessage({ kind: "query", id, path });
    });

    if (id !== requestIdRef.current) return;
    if (result.kind !== "query") return;

    if (!result.ok) {
      setQueryState({ kind: "error", message: result.error });
      return;
    }
    const count = Array.isArray(result.value) ? result.value.length : 1;
    setQueryState({
      kind: "result",
      value: result.value,
      raw: result.raw,
      bytes: result.bytes,
      count,
    });
  };

  useEffect(() => {
    if (output.kind !== "parsed") return;
    if (query.trim() === "") return;
    const timer = setTimeout(() => {
      runQuery(query);
    }, QUERY_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, output]);

  const handleSettingsChange = (next: Settings) => {
    setSettings(next);
    if (output.kind === "parsed" && input.trim() !== "") {
      void formatText(input, next);
    }
  };

  const handleFormat = () => formatText(input);

  const loadFromText = (text: string) => {
    setInput(text);
    void formatText(text);
  };

  const handleFileChosen = (file: File) => {
    readFileAsText(file)
      .then(loadFromText)
      .catch((err: unknown) => {
        setOutput({
          kind: "invalid",
          errors: [
            {
              message: `Could not read file: ${err instanceof Error ? err.message : "unknown error"}`,
              line: 1,
              column: 1,
              offset: 0,
              length: 0,
              lineText: "",
            },
          ],
        });
      });
  };

  const { isDragging, dropProps } = useFileDrop(loadFromText, (msg) => {
    setOutput({
      kind: "invalid",
      errors: [
        {
          message: `Could not read file: ${msg}`,
          line: 1,
          column: 1,
          offset: 0,
          length: 0,
          lineText: "",
        },
      ],
    });
  });

  const handleClear = () => {
    setInput("");
    setOutput({ kind: "idle" });
    setQuery("");
    setQueryState({ kind: "idle" });
  };

  const handleQueryChange = (q: string) => {
    setQuery(q);
    if (q.trim() === "") setQueryState({ kind: "idle" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    if (wasPastedRef.current) {
      wasPastedRef.current = false;
      if (value.trim() !== "") void formatText(value);
    }
  };

  const handleCopy = async () => {
    const text =
      query.trim() !== "" && queryState.kind === "result"
        ? queryState.raw
        : output.kind === "parsed"
          ? output.raw
          : "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    setTimeout(() => setCopyState("idle"), 1500);
  };

  const queryActive = query.trim() !== "";
  const displayValue =
    queryActive && queryState.kind === "result"
      ? { value: queryState.value, raw: queryState.raw, bytes: queryState.bytes }
      : output.kind === "parsed"
        ? { value: output.value, raw: output.raw, bytes: output.bytes }
        : null;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleFormat}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          disabled={input.trim() === "" || output.kind === "loading"}
        >
          {output.kind === "loading" ? "Parsing…" : "Format"}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          disabled={input === "" && output.kind === "idle"}
        >
          Clear
        </button>
        <label className="cursor-pointer rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
          <input
            type="file"
            accept=".json,application/json,text/plain,text/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChosen(file);
              e.target.value = "";
            }}
            onFocus={() => ensureWorker()}
          />
          Open file
        </label>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          disabled={
            !(
              (query.trim() !== "" && queryState.kind === "result") ||
              output.kind === "parsed"
            )
          }
        >
          {copyState === "copied"
            ? "Copied"
            : copyState === "error"
              ? "Copy failed"
              : "Copy"}
        </button>
        <div className="ml-auto">
          <StatusPill output={output} />
        </div>
      </div>

      <SettingsBar settings={settings} onChange={handleSettingsChange} />

      <QueryBar
        query={query}
        onQueryChange={handleQueryChange}
        state={queryState}
        enabled={output.kind === "parsed"}
      />

      <div className="grid flex-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Pane label="Input" htmlFor="json-input">
            <textarea
              id="json-input"
              value={input}
              onChange={handleInputChange}
              onPaste={() => {
                wasPastedRef.current = true;
              }}
              onFocus={() => ensureWorker()}
              spellCheck={false}
              placeholder={
                isDragging
                  ? "Drop JSON file to load…"
                  : 'Paste JSON here, e.g. {"hello": "world"}'
              }
              {...dropProps}
              className={`h-full w-full resize-none rounded-md border-2 px-3 py-2 font-mono text-sm leading-6 outline-none transition-colors ${
                isDragging
                  ? "border-zinc-500 bg-zinc-100 text-zinc-900 dark:border-zinc-400 dark:bg-zinc-900 dark:text-zinc-100"
                  : "border-zinc-200 bg-white text-zinc-900 focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
              }`}
            />
          </Pane>
          {output.kind === "invalid" && <ErrorList errors={output.errors} />}
        </div>
        <OutputPane
          displayValue={displayValue}
          fallback={output.kind}
          queryActive={queryActive}
          queryState={queryState}
          view={view}
          onViewChange={setView}
        />
      </div>
    </div>
  );
}

function QueryBar({
  query,
  onQueryChange,
  state,
  enabled,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  state: QueryState;
  enabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="json-query"
        className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
      >
        JSONPath query
      </label>
      <div className="flex items-center gap-2">
        <span className="select-none font-mono text-sm text-zinc-400 dark:text-zinc-500">
          $
        </span>
        <input
          id="json-query"
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={enabled ? ".users[*].email" : "Format JSON first"}
          disabled={!enabled}
          className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-1.5 font-mono text-sm text-zinc-900 outline-none focus:border-zinc-500 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
        />
        <QueryStatus state={state} query={query} />
      </div>
      {state.kind === "error" && (
        <p className="font-mono text-xs text-rose-600 dark:text-rose-400">
          {state.message}
        </p>
      )}
    </div>
  );
}

function SettingsBar({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (next: Settings) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Indent
        </span>
        <Segmented
          value={settings.indent}
          onChange={(indent) => onChange({ ...settings, indent })}
          options={[
            { value: 2, label: "2" },
            { value: 4, label: "4" },
            { value: "tab", label: "Tab" },
          ]}
        />
      </div>
      <Toggle
        label="Sort keys"
        checked={settings.sortKeys}
        onChange={(sortKeys) => onChange({ ...settings, sortKeys })}
      />
      <Toggle
        label="Allow trailing commas & comments"
        checked={settings.tolerant}
        onChange={(tolerant) => onChange({ ...settings, tolerant })}
      />
    </div>
  );
}

function Segmented<T extends string | number>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (next: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div
      role="radiogroup"
      className="inline-flex rounded-md border border-zinc-200 p-0.5 text-xs dark:border-zinc-800"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
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

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
    </label>
  );
}

function QueryStatus({
  state,
  query,
}: {
  state: QueryState;
  query: string;
}) {
  if (query.trim() === "" || state.kind === "idle") return null;
  if (state.kind === "loading") {
    return (
      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        Querying…
      </span>
    );
  }
  if (state.kind === "result") {
    return (
      <span className="rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-0.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
        {state.count === 1 ? "1 match" : `${state.count} matches`}
      </span>
    );
  }
  return null;
}

function Pane({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[24rem] flex-col gap-2 lg:min-h-[32rem]">
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function OutputPane({
  displayValue,
  fallback,
  queryActive,
  queryState,
  view,
  onViewChange,
}: {
  displayValue: { value: unknown; raw: string; bytes: number } | null;
  fallback: OutputState["kind"];
  queryActive: boolean;
  queryState: QueryState;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
}) {
  return (
    <div className="flex min-h-[24rem] flex-col gap-2 lg:min-h-[32rem]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {queryActive ? "Query result" : "Output"}
        </span>
        <ViewToggle view={view} onChange={onViewChange} />
      </div>
      <div className="flex-1 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
        {displayValue ? (
          view === "tree" ? (
            <TreeView value={displayValue.value} />
          ) : (
            <pre className="h-full overflow-auto px-3 py-2 font-mono text-sm leading-6 text-zinc-900 dark:text-zinc-100">
              {displayValue.raw}
            </pre>
          )
        ) : (
          <p className="px-3 py-2 font-mono text-sm text-zinc-400 dark:text-zinc-500">
            {queryActive && queryState.kind === "loading"
              ? "Querying…"
              : queryActive && queryState.kind === "error"
                ? "—"
                : fallback === "invalid"
                  ? "—"
                  : fallback === "loading"
                    ? "Parsing…"
                    : "Formatted JSON will appear here."}
          </p>
        )}
      </div>
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Output view"
      className="inline-flex rounded-md border border-zinc-200 p-0.5 text-xs dark:border-zinc-800"
    >
      {(["tree", "raw"] as const).map((mode) => {
        const active = view === mode;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(mode)}
            className={
              active
                ? "rounded bg-zinc-900 px-2.5 py-1 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "rounded px-2.5 py-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }
          >
            {mode === "tree" ? "Tree" : "Raw"}
          </button>
        );
      })}
    </div>
  );
}

function ErrorList({ errors }: { errors: RichError[] }) {
  return (
    <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm dark:border-rose-900 dark:bg-rose-950/50">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-rose-700 dark:text-rose-300">
        {errors.length === 1 ? "1 error" : `${errors.length} errors`}
      </p>
      <ul className="flex flex-col gap-3">
        {errors.map((err, i) => (
          <li key={i} className="flex flex-col gap-1">
            <p className="text-rose-800 dark:text-rose-200">
              <span className="font-mono text-xs text-rose-600 dark:text-rose-400">
                Line {err.line}, Col {err.column}
              </span>{" "}
              — {err.message}
            </p>
            {err.lineText && (
              <pre className="overflow-x-auto rounded bg-white px-2 py-1 font-mono text-xs leading-5 text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                <span className="text-zinc-400 dark:text-zinc-500">
                  {String(err.line).padStart(3, " ")} │{" "}
                </span>
                {err.lineText}
                {"\n"}
                <span className="text-zinc-400 dark:text-zinc-500">
                  {"    │ "}
                </span>
                <span className="text-rose-600 dark:text-rose-400">
                  {" ".repeat(Math.max(0, err.column - 1))}^
                </span>
              </pre>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusPill({ output }: { output: OutputState }) {
  if (output.kind === "idle" || output.kind === "loading") return null;
  if (output.kind === "parsed") {
    return (
      <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        Valid · {formatBytes(output.bytes)}
      </span>
    );
  }
  const first = output.errors[0];
  return (
    <span
      className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300"
      title={`${output.errors.length} error${output.errors.length === 1 ? "" : "s"}`}
    >
      Invalid · Line {first.line}, Col {first.column}
      {output.errors.length > 1 && ` (+${output.errors.length - 1})`}
    </span>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
