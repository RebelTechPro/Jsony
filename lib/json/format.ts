export type FormatResult =
  | { ok: true; output: string }
  | { ok: false; error: string };

export function formatJson(input: string, indent: number = 2): FormatResult {
  if (input.trim() === "") {
    return { ok: true, output: "" };
  }
  try {
    const parsed: unknown = JSON.parse(input);
    return { ok: true, output: JSON.stringify(parsed, null, indent) };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid JSON",
    };
  }
}
