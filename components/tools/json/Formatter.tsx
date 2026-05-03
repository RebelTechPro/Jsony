"use client";

import { useState } from "react";
import { formatJson } from "@/lib/json/format";

type Status =
  | { kind: "idle" }
  | { kind: "valid"; bytes: number }
  | { kind: "invalid"; error: string };

export default function Formatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const handleFormat = () => {
    const result = formatJson(input, 2);
    if (result.ok) {
      setOutput(result.output);
      setStatus(
        result.output === ""
          ? { kind: "idle" }
          : { kind: "valid", bytes: new Blob([result.output]).size },
      );
    } else {
      setOutput("");
      setStatus({ kind: "invalid", error: result.error });
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setStatus({ kind: "idle" });
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
          disabled={input === "" && output === ""}
        >
          Clear
        </button>
        <StatusPill status={status} />
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
        <Pane label="Output" htmlFor="json-output">
          <textarea
            id="json-output"
            value={output}
            readOnly
            spellCheck={false}
            placeholder="Formatted JSON will appear here."
            className="h-full w-full resize-none rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm leading-6 text-zinc-900 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </Pane>
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
  htmlFor: string;
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

function StatusPill({ status }: { status: Status }) {
  if (status.kind === "idle") return null;
  if (status.kind === "valid") {
    return (
      <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        Valid · {formatBytes(status.bytes)}
      </span>
    );
  }
  return (
    <span
      className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300"
      title={status.error}
    >
      Invalid · {status.error}
    </span>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
