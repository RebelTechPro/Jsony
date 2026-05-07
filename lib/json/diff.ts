import { create } from "jsondiffpatch";
import { format } from "jsondiffpatch/formatters/html";

const differ = create({
  // Identify array items by an `id` field if present, else fall back to deep
  // equality. Without this, reordered arrays look like full rewrites.
  objectHash: (obj: unknown) => {
    if (obj && typeof obj === "object" && "id" in obj) {
      return String((obj as { id: unknown }).id);
    }
    return undefined;
  },
  arrays: { detectMove: true, includeValueOnMove: false },
});

export type DiffResult =
  | { ok: true; html: string; hasDiff: boolean }
  | { ok: false; error: string };

export function diffJson(left: unknown, right: unknown): DiffResult {
  try {
    const delta = differ.diff(left, right);
    if (delta === undefined) {
      return { ok: true, html: "", hasDiff: false };
    }
    const html = format(delta, left) ?? "";
    return { ok: true, html, hasDiff: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Diff failed.",
    };
  }
}
