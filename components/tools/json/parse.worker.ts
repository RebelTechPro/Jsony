import { JSONPath } from "jsonpath-plus";
import { parseRich, type RichError } from "@/lib/json/parse-rich";

type WorkerRequest =
  | { kind: "parse"; id: number; input: string }
  | { kind: "query"; id: number; path: string };

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
    };

let cached: { value: unknown } | null = null;

self.addEventListener("message", (e: MessageEvent<WorkerRequest>) => {
  if (e.data.kind === "parse") {
    handleParse(e.data.id, e.data.input);
  } else if (e.data.kind === "query") {
    handleQuery(e.data.id, e.data.path);
  }
});

function handleParse(id: number, input: string) {
  try {
    const result = parseRich(input);
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
    cached = { value: result.value };
    const raw = JSON.stringify(result.value, null, 2);
    const bytes = new Blob([raw]).size;
    const response: WorkerResponse = {
      id,
      kind: "parse",
      ok: true,
      value: result.value,
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

export {};
