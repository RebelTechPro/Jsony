export type CsvOptions = {
  delimiter: "," | "\t" | ";";
  includeHeader: boolean;
};

export type CsvResult =
  | {
      ok: true;
      csv: string;
      rows: number;
      columns: number;
    }
  | {
      ok: false;
      error: string;
    };

export function toCsv(value: unknown, options: CsvOptions): CsvResult {
  let rows: Record<string, unknown>[];

  if (Array.isArray(value)) {
    rows = value.map((item) => {
      if (item === null || typeof item !== "object" || Array.isArray(item)) {
        return { value: item };
      }
      return item as Record<string, unknown>;
    });
  } else if (
    value !== null &&
    typeof value === "object" &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    rows = [value as Record<string, unknown>];
  } else {
    return {
      ok: false,
      error:
        "Top-level value must be a JSON object or array. Got " +
        describe(value) +
        ".",
    };
  }

  if (rows.length === 0) {
    return { ok: true, csv: "", rows: 0, columns: 0 };
  }

  const headers: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    for (const k of Object.keys(row)) {
      if (!seen.has(k)) {
        seen.add(k);
        headers.push(k);
      }
    }
  }

  const lines: string[] = [];
  if (options.includeHeader) {
    lines.push(
      headers.map((h) => escape(h, options.delimiter)).join(options.delimiter),
    );
  }
  for (const row of rows) {
    lines.push(
      headers
        .map((h) => formatCell(row[h], options.delimiter))
        .join(options.delimiter),
    );
  }

  return {
    ok: true,
    csv: lines.join("\r\n"),
    rows: rows.length,
    columns: headers.length,
  };
}

function formatCell(value: unknown, delimiter: string): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "object") {
    return escape(JSON.stringify(value), delimiter);
  }
  return escape(String(value), delimiter);
}

function escape(value: string, delimiter: string): string {
  if (
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function describe(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return "a string";
  if (typeof value === "number") return "a number";
  if (typeof value === "boolean") return "a boolean";
  return typeof value;
}
