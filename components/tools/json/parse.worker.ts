import { parseRich, type RichError } from "@/lib/json/parse-rich";

type WorkerRequest = { id: number; input: string };

export type WorkerResponse =
  | {
      id: number;
      ok: true;
      value: unknown;
      raw: string;
      bytes: number;
    }
  | {
      id: number;
      ok: false;
      errors: RichError[];
    };

self.addEventListener("message", (e: MessageEvent<WorkerRequest>) => {
  const { id, input } = e.data;

  try {
    const result = parseRich(input);

    if (!result.ok) {
      const response: WorkerResponse = {
        id,
        ok: false,
        errors: result.errors,
      };
      self.postMessage(response);
      return;
    }

    if (result.value === undefined) {
      const response: WorkerResponse = {
        id,
        ok: true,
        value: undefined,
        raw: "",
        bytes: 0,
      };
      self.postMessage(response);
      return;
    }

    const raw = JSON.stringify(result.value, null, 2);
    const bytes = new Blob([raw]).size;
    const response: WorkerResponse = {
      id,
      ok: true,
      value: result.value,
      raw,
      bytes,
    };
    self.postMessage(response);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error in worker.";
    const response: WorkerResponse = {
      id,
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
});

export {};
