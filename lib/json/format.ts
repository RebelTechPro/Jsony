export type ParseResult =
  | { ok: true; value: unknown }
  | { ok: false; error: string };

export type FormatResult =
  | { ok: true; output: string }
  | { ok: false; error: string };

export function parseJson(input: string): ParseResult {
  if (input.trim() === "") {
    return { ok: true, value: undefined };
  }
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid JSON",
    };
  }
}

export function formatJson(input: string, indent: number = 2): FormatResult {
  const parsed = parseJson(input);
  if (!parsed.ok) return parsed;
  if (parsed.value === undefined) return { ok: true, output: "" };
  return { ok: true, output: JSON.stringify(parsed.value, null, indent) };
}
