"use client";

import { useState } from "react";
import { parseJson } from "@/lib/json/format";
import TreeView from "@/components/tools/json/TreeView";

type OutputState =
  | { kind: "idle" }
  | { kind: "parsed"; value: unknown; raw: string; bytes: number }
  | { kind: "invalid"; error: string };

type ViewMode = "tree" | "raw";

export default function Formatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<OutputState>({ kind: "idle" });
  const [view, setView] = useState<ViewMode>("tree");

  const handleFormat = () => {
    const result = parseJson(input);
    if (!result.ok) {
      setOutput({ kind: "invalid", error: result.error });
      return;
    }
    if (result.value === undefined) {
      setOutput({ kind: "idle" });
      return;
    }
    const raw = JSON.stringify(result.value, null, 2);
    setOutput({
      kind: "parsed",
      value: result.value,
      raw,
      bytes: new Blob([raw]).size,
    });
  };

  const handleClear = () => {
    setInput("");
    setOutput({ kind: "idle" });
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleFormat}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          disabled={input.trim() === ""}
        >
          Format
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          disabled={input === "" && output.kind === "idle"}
        >
          Clear
        </button>
        <StatusPill output={output} />
      </div>

      <div className="grid flex-1 gap-4 lg:grid-cols-2">
        <Pane label="Input" htmlFor="json-input">
          <textarea
            id="json-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder={'Paste JSON here, e.g. {"hello": "world"}'}
            className="h-full w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 font-mono text-sm leading-6 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
          />
        </Pane>
        <OutputPane
          output={output}
          view={view}
          onViewChange={setView}
        />
      </div>
    </div>
  );
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
  output,
  view,
  onViewChange,
}: {
  output: OutputState;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
}) {
  return (
    <div className="flex min-h-[24rem] flex-col gap-2 lg:min-h-[32rem]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Output
        </span>
        <ViewToggle view={view} onChange={onViewChange} />
      </div>
      <div className="flex-1 overflow-auto rounded-md border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
        {output.kind === "parsed" ? (
          view === "tree" ? (
            <div className="p-2">
              <TreeView value={output.value} />
            </div>
          ) : (
            <pre className="px-3 py-2 font-mono text-sm leading-6 text-zinc-900 dark:text-zinc-100">
              {output.raw}
            </pre>
          )
        ) : (
          <p className="px-3 py-2 font-mono text-sm text-zinc-400 dark:text-zinc-500">
            {output.kind === "invalid"
              ? "—"
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

function StatusPill({ output }: { output: OutputState }) {
  if (output.kind === "idle") return null;
  if (output.kind === "parsed") {
    return (
      <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        Valid · {formatBytes(output.bytes)}
      </span>
    );
  }
  return (
    <span
      className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300"
      title={output.error}
    >
      Invalid · {output.error}
    </span>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
