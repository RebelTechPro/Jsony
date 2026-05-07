import { JSONPath } from "jsonpath-plus";
import { parseRich, type RichError } from "@/lib/json/parse-rich";
import {
  DEFAULT_SETTINGS,
  indentToString,
  type Settings,
} from "@/lib/json/settings";
import { toCsv, type CsvOptions } from "@/lib/json/to-csv";

type WorkerRequest =
  | { kind: "parse"; id: number; input: string; settings: Settings }
  | { kind: "query"; id: number; path: string }
  | { kind: "csv"; id: number; options: CsvOptions };

export type WorkerResponse =
  | {
      id: number;
      kind: "parse";
      ok: true;
      value: unknown;
      raw: string;
      bytes: number;
    }
  | {
      id: number;
      kind: "parse";
      ok: false;
      errors: RichError[];
    }
  | {
      id: number;
      kind: "query";
      ok: true;
      value: unknown;
      raw: string;
      bytes: number;
    }
  | {
      id: number;
      kind: "query";
      ok: false;
      error: string;
    }
  | {
      id: number;
      kind: "csv";
      ok: true;
      csv: string;
      rows: number;
      columns: number;
      bytes: number;
    }
  | {
      id: number;
      kind: "csv";
      ok: false;
      error: string;
    };

let cached: { value: unknown } | null = null;

self.addEventListener("message", (e: MessageEvent<WorkerRequest>) => {
  if (e.data.kind === "parse") {
    handleParse(e.data.id, e.data.input, e.data.settings ?? DEFAULT_SETTINGS);
  } else if (e.data.kind === "query") {
    handleQuery(e.data.id, e.data.path);
  } else if (e.data.kind === "csv") {
    handleCsv(e.data.id, e.data.options);
  }
});

function handleParse(id: number, input: string, settings: Settings) {
  try {
    const result = parseRich(input, { tolerant: settings.tolerant });
    if (!result.ok) {
      cached = null;
      const response: WorkerResponse = {
        id,
        kind: "parse",
        ok: false,
        errors: result.errors,
      };
      self.postMessage(response);
      return;
    }
    if (result.value === undefined) {
      cached = null;
      const response: WorkerResponse = {
        id,
        kind: "parse",
        ok: true,
        value: undefined,
        raw: "",
        bytes: 0,
      };
      self.postMessage(response);
      return;
    }
    const value = settings.sortKeys ? sortKeysDeep(result.value) : result.value;
    cached = { value };
    const raw = JSON.stringify(value, null, indentToString(settings.indent));
    const bytes = new Blob([raw]).size;
    const response: WorkerResponse = {
      id,
      kind: "parse",
      ok: true,
      value,
      raw,
      bytes,
    };
    self.postMessage(response);
  } catch (err) {
    cached = null;
    const message =
      err instanceof Error ? err.message : "Unknown error in worker.";
    const response: WorkerResponse = {
      id,
      kind: "parse",
      ok: false,
      errors: [
        {
          message,
          line: 1,
          column: 1,
          offset: 0,
          length: 0,
          lineText: "",
        },
      ],
    };
    self.postMessage(response);
  }
}

function handleQuery(id: number, path: string) {
  if (cached === null) {
    const response: WorkerResponse = {
      id,
      kind: "query",
      ok: false,
      error: "No JSON loaded.",
    };
    self.postMessage(response);
    return;
  }

  try {
    const matches = JSONPath({
      path,
      json: cached.value as object,
      wrap: true,
    });
    const raw = JSON.stringify(matches, null, 2);
    const bytes = new Blob([raw]).size;
    const response: WorkerResponse = {
      id,
      kind: "query",
      ok: true,
      value: matches,
      raw,
      bytes,
    };
    self.postMessage(response);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid JSONPath expression.";
    const response: WorkerResponse = {
      id,
      kind: "query",
      ok: false,
      error: message,
    };
    self.postMessage(response);
  }
}

function handleCsv(id: number, options: CsvOptions) {
  if (cached === null) {
    const response: WorkerResponse = {
      id,
      kind: "csv",
      ok: false,
      error: "No JSON loaded.",
    };
    self.postMessage(response);
    return;
  }

  try {
    const result = toCsv(cached.value, options);
    if (!result.ok) {
      const response: WorkerResponse = {
        id,
        kind: "csv",
        ok: false,
        error: result.error,
      };
      self.postMessage(response);
      return;
    }
    const bytes = new Blob([result.csv]).size;
    const response: WorkerResponse = {
      id,
      kind: "csv",
      ok: true,
      csv: result.csv,
      rows: result.rows,
      columns: result.columns,
      bytes,
    };
    self.postMessage(response);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error during CSV conversion.";
    const response: WorkerResponse = {
      id,
      kind: "csv",
      ok: false,
      error: message,
    };
    self.postMessage(response);
  }
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    const out = new Array(value.length);
    for (let i = 0; i < value.length; i++) out[i] = sortKeysDeep(value[i]);
    return out;
  }
  if (
    value !== null &&
    typeof value === "object" &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const out: Record<string, unknown> = {};
    for (let i = 0; i < keys.length; i++) {
      out[keys[i]] = sortKeysDeep(obj[keys[i]]);
    }
    return out;
  }
  return value;
}

export {};
