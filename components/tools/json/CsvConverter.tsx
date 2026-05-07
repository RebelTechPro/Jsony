"use client";

import { useEffect, useRef, useState } from "react";
import type { RichError } from "@/lib/json/parse-rich";
import type { CsvOptions } from "@/lib/json/to-csv";
import type { WorkerResponse } from "@/components/tools/json/parse.worker";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/json/settings";

type ParseState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "parsed" }
  | { kind: "invalid"; errors: RichError[] };

type CsvState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; csv: string; rows: number; columns: number; bytes: number }
  | { kind: "error"; message: string };

const STORAGE_KEY = "jsony.json-to-csv.options";

const DEFAULT_OPTIONS: CsvOptions = {
  delimiter: ",",
  includeHeader: true,
};

function loadOptions(): CsvOptions {
  if (typeof window === "undefined") return DEFAULT_OPTIONS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_OPTIONS;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_OPTIONS;
    const p = parsed as Partial<CsvOptions>;
    return {
      delimiter:
        p.delimiter === "," || p.delimiter === "\t" || p.delimiter === ";"
          ? p.delimiter
          : DEFAULT_OPTIONS.delimiter,
      includeHeader:
        typeof p.includeHeader === "boolean"
          ? p.includeHeader
          : DEFAULT_OPTIONS.includeHeader,
    };
  } catch {
    return DEFAULT_OPTIONS;
  }
}

function saveOptions(options: CsvOptions) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
  } catch {
    // ignore
  }
}

export default function CsvConverter() {
  const [input, setInput] = useState("");
  const [parseState, setParseState] = useState<ParseState>({ kind: "idle" });
  const [csvState, setCsvState] = useState<CsvState>({ kind: "idle" });
  const [options, setOptions] = useState<CsvOptions>(DEFAULT_OPTIONS);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const pendingRef = useRef(
    new Map<number, (r: WorkerResponse) => void>(),
  );
  const wasPastedRef = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOptions(loadOptions());
  }, []);

  useEffect(() => {
    saveOptions(options);
  }, [options]);

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

  const sendRequest = <K extends WorkerResponse["kind"]>(
    request:
      | { kind: "parse"; input: string; settings: Settings }
      | { kind: "csv"; options: CsvOptions },
    expectKind: K,
  ): Promise<Extract<WorkerResponse, { kind: K }> | null> => {
    const worker = ensureWorker();
    if (!worker) return Promise.resolve(null);
    const id = ++requestIdRef.current;
    return new Promise((resolve) => {
      pendingRef.current.set(id, (response) => {
        if (id !== requestIdRef.current) {
          resolve(null);
          return;
        }
        if (response.kind !== expectKind) {
          resolve(null);
          return;
        }
        resolve(response as Extract<WorkerResponse, { kind: K }>);
      });
      worker.postMessage({ ...request, id });
    });
  };

  const convertText = async (text: string, opts: CsvOptions = options) => {
    setParseState({ kind: "loading" });
    setCsvState({ kind: "loading" });

    const parsed = await sendRequest(
      { kind: "parse", input: text, settings: DEFAULT_SETTINGS },
      "parse",
    );
    if (!parsed) return;

    if (!parsed.ok) {
      setParseState({ kind: "invalid", errors: parsed.errors });
      setCsvState({ kind: "idle" });
      return;
    }
    if (parsed.value === undefined) {
      setParseState({ kind: "idle" });
      setCsvState({ kind: "idle" });
      return;
    }
    setParseState({ kind: "parsed" });

    const csv = await sendRequest(
      { kind: "csv", options: opts },
      "csv",
    );
    if (!csv) return;
    if (!csv.ok) {
      setCsvState({ kind: "error", message: csv.error });
      return;
    }
    setCsvState({
      kind: "result",
      csv: csv.csv,
      rows: csv.rows,
      columns: csv.columns,
      bytes: csv.bytes,
    });
  };

  const handleConvert = () => convertText(input);

  const handleClear = () => {
    setInput("");
    setParseState({ kind: "idle" });
    setCsvState({ kind: "idle" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    if (wasPastedRef.current) {
      wasPastedRef.current = false;
      if (value.trim() !== "") void convertText(value);
    }
  };

  const handleFileChosen = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setInput(text);
      void convertText(text);
    };
    reader.onerror = () => {
      setParseState({
        kind: "invalid",
        errors: [
          {
            message: `Could not read file: ${reader.error?.message ?? "unknown error"}`,
            line: 1,
            column: 1,
            offset: 0,
            length: 0,
            lineText: "",
          },
        ],
      });
    };
    reader.readAsText(file);
  };

  const handleCopy = async () => {
    if (csvState.kind !== "result") return;
    try {
      await navigator.clipboard.writeText(csvState.csv);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    setTimeout(() => setCopyState("idle"), 1500);
  };

  const handleOptionsChange = (next: CsvOptions) => {
    setOptions(next);
    if (parseState.kind === "parsed" && input.trim() !== "") {
      void convertText(input, next);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleConvert}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          disabled={input.trim() === "" || parseState.kind === "loading"}
        >
          {parseState.kind === "loading" ? "Converting…" : "Convert"}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          disabled={input === "" && parseState.kind === "idle"}
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
          disabled={csvState.kind !== "result"}
        >
          {copyState === "copied"
            ? "Copied"
            : copyState === "error"
              ? "Copy failed"
              : "Copy CSV"}
        </button>
        <div className="ml-auto">
          <StatusPill parseState={parseState} csvState={csvState} />
        </div>
      </div>

      <OptionsBar options={options} onChange={handleOptionsChange} />

      <div className="grid flex-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Pane label="JSON input" htmlFor="json-input">
            <textarea
              id="json-input"
              value={input}
              onChange={handleInputChange}
              onPaste={() => {
                wasPastedRef.current = true;
              }}
              onFocus={() => ensureWorker()}
              spellCheck={false}
              placeholder={'Paste JSON here, e.g. [{"name":"a","age":1}]'}
              className="h-full w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 font-mono text-sm leading-6 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
            />
          </Pane>
          {parseState.kind === "invalid" && (
            <ErrorList errors={parseState.errors} />
          )}
          {csvState.kind === "error" && (
            <p className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
              {csvState.message}
            </p>
          )}
        </div>
        <Pane label="CSV output" htmlFor="csv-output">
          <textarea
            id="csv-output"
            value={csvState.kind === "result" ? csvState.csv : ""}
            readOnly
            spellCheck={false}
            placeholder={
              csvState.kind === "loading"
                ? "Converting…"
                : "CSV output will appear here."
            }
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

function OptionsBar({
  options,
  onChange,
}: {
  options: CsvOptions;
  onChange: (next: CsvOptions) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Delimiter
        </span>
        <Segmented
          value={options.delimiter}
          onChange={(delimiter) => onChange({ ...options, delimiter })}
          options={[
            { value: ",", label: "Comma" },
            { value: "\t", label: "Tab" },
            { value: ";", label: "Semicolon" },
          ]}
        />
      </div>
      <label className="inline-flex cursor-pointer select-none items-center gap-2">
        <input
          type="checkbox"
          checked={options.includeHeader}
          onChange={(e) =>
            onChange({ ...options, includeHeader: e.target.checked })
          }
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <span className="text-zinc-700 dark:text-zinc-300">
          Include header row
        </span>
      </label>
    </div>
  );
}

function Segmented<T extends string>({
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
            key={opt.label}
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

function StatusPill({
  parseState,
  csvState,
}: {
  parseState: ParseState;
  csvState: CsvState;
}) {
  if (parseState.kind === "invalid") {
    const first = parseState.errors[0];
    return (
      <span
        className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300"
        title={`${parseState.errors.length} error${parseState.errors.length === 1 ? "" : "s"}`}
      >
        Invalid · Line {first.line}, Col {first.column}
      </span>
    );
  }
  if (csvState.kind === "result") {
    return (
      <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        {csvState.rows} {csvState.rows === 1 ? "row" : "rows"} ·{" "}
        {csvState.columns} {csvState.columns === 1 ? "column" : "columns"} ·{" "}
        {formatBytes(csvState.bytes)}
      </span>
    );
  }
  return null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
