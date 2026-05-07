"use client";

import { useEffect, useRef, useState } from "react";
import type { RichError } from "@/lib/json/parse-rich";
import type { WorkerResponse } from "@/components/tools/json/parse.worker";
import { readFileAsText, useFileDrop } from "@/lib/hooks/useFileDrop";

type DiffState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; html: string; hasDiff: boolean }
  | {
      kind: "invalid";
      leftErrors?: RichError[];
      rightErrors?: RichError[];
      error?: string;
    };

export default function JsonDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [state, setState] = useState<DiffState>({ kind: "idle" });

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const pendingRef = useRef(
    new Map<number, (r: WorkerResponse) => void>(),
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

  const runDiff = async (l: string = left, r: string = right) => {
    const worker = ensureWorker();
    if (!worker) return;
    if (l.trim() === "" || r.trim() === "") {
      setState({ kind: "idle" });
      return;
    }

    const id = ++requestIdRef.current;
    setState({ kind: "loading" });

    const result = await new Promise<WorkerResponse>((resolve) => {
      pendingRef.current.set(id, resolve);
      worker.postMessage({
        kind: "diff",
        id,
        leftInput: l,
        rightInput: r,
      });
    });

    if (id !== requestIdRef.current) return;
    if (result.kind !== "diff") return;

    if (!result.ok) {
      setState({
        kind: "invalid",
        leftErrors: result.leftErrors,
        rightErrors: result.rightErrors,
        error: result.error,
      });
      return;
    }
    setState({
      kind: "result",
      html: result.html,
      hasDiff: result.hasDiff,
    });
  };

  const handleClear = () => {
    setLeft("");
    setRight("");
    setState({ kind: "idle" });
  };

  const handleSwap = () => {
    setLeft(right);
    setRight(left);
    if (state.kind === "result") void runDiff(right, left);
  };

  const loadInto = (which: "left" | "right", text: string) => {
    if (which === "left") {
      setLeft(text);
      void runDiff(text, right);
    } else {
      setRight(text);
      void runDiff(left, text);
    }
  };

  const handleFile = (which: "left" | "right", file: File) => {
    readFileAsText(file)
      .then((text) => loadInto(which, text))
      .catch(() => {
        // Drop silently if file is unreadable; the empty input handles it.
      });
  };

  const leftDrop = useFileDrop((text) => loadInto("left", text));
  const rightDrop = useFileDrop((text) => loadInto("right", text));

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => runDiff()}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          disabled={
            left.trim() === "" ||
            right.trim() === "" ||
            state.kind === "loading"
          }
        >
          {state.kind === "loading" ? "Diffing…" : "Diff"}
        </button>
        <button
          type="button"
          onClick={handleSwap}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          disabled={left === "" && right === ""}
        >
          Swap
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          disabled={
            left === "" && right === "" && state.kind === "idle"
          }
        >
          Clear
        </button>
        <div className="ml-auto">
          <StatusPill state={state} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InputPane
          label="Left (before)"
          id="json-left"
          value={left}
          onChange={setLeft}
          onFile={(f) => handleFile("left", f)}
          onFocus={ensureWorker}
          isDragging={leftDrop.isDragging}
          dropProps={leftDrop.dropProps}
        />
        <InputPane
          label="Right (after)"
          id="json-right"
          value={right}
          onChange={setRight}
          onFile={(f) => handleFile("right", f)}
          onFocus={ensureWorker}
          isDragging={rightDrop.isDragging}
          dropProps={rightDrop.dropProps}
        />
      </div>

      {state.kind === "invalid" && (
        <div className="grid gap-4 lg:grid-cols-2">
          {state.leftErrors && (
            <ErrorList side="left" errors={state.leftErrors} />
          )}
          {state.rightErrors && (
            <ErrorList side="right" errors={state.rightErrors} />
          )}
          {state.error && (
            <p className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 lg:col-span-2 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
              {state.error}
            </p>
          )}
        </div>
      )}

      <DiffOutput state={state} />
    </div>
  );
}

function InputPane({
  label,
  id,
  value,
  onChange,
  onFile,
  onFocus,
  isDragging,
  dropProps,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  onFile: (f: File) => void;
  onFocus: () => void;
  isDragging: boolean;
  dropProps: React.HTMLAttributes<HTMLTextAreaElement>;
}) {
  return (
    <div className="flex min-h-[20rem] flex-col gap-2 lg:min-h-[24rem]">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
        >
          {label}
        </label>
        <label className="cursor-pointer rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
          <input
            type="file"
            accept=".json,application/json,text/plain,text/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
              e.target.value = "";
            }}
          />
          Open file
        </label>
      </div>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        spellCheck={false}
        placeholder={isDragging ? "Drop JSON file to load…" : "Paste JSON here…"}
        {...dropProps}
        className={`h-full w-full resize-none rounded-md border-2 px-3 py-2 font-mono text-sm leading-6 outline-none transition-colors ${
          isDragging
            ? "border-zinc-500 bg-zinc-100 text-zinc-900 dark:border-zinc-400 dark:bg-zinc-900 dark:text-zinc-100"
            : "border-zinc-200 bg-white text-zinc-900 focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
        }`}
      />
    </div>
  );
}

function DiffOutput({ state }: { state: DiffState }) {
  return (
    <div className="flex min-h-[16rem] flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Diff
      </span>
      <div className="flex-1 overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
        {state.kind === "result" ? (
          state.hasDiff ? (
            <div
              className="jsondiff-root"
              dangerouslySetInnerHTML={{ __html: state.html }}
            />
          ) : (
            <p className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
              No differences.
            </p>
          )
        ) : (
          <p className="font-mono text-sm text-zinc-400 dark:text-zinc-500">
            {state.kind === "loading"
              ? "Diffing…"
              : state.kind === "invalid"
                ? "—"
                : "Paste JSON in both panes to compare."}
          </p>
        )}
      </div>
    </div>
  );
}

function ErrorList({
  side,
  errors,
}: {
  side: "left" | "right";
  errors: RichError[];
}) {
  return (
    <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm dark:border-rose-900 dark:bg-rose-950/50">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-rose-700 dark:text-rose-300">
        {side === "left" ? "Left side" : "Right side"} ·{" "}
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
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusPill({ state }: { state: DiffState }) {
  if (state.kind === "idle" || state.kind === "loading") return null;
  if (state.kind === "invalid") {
    return (
      <span className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
        Invalid input
      </span>
    );
  }
  if (state.hasDiff) {
    return (
      <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
        Differences found
      </span>
    );
  }
  return (
    <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
      Identical
    </span>
  );
}
