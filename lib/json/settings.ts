export type Indent = 2 | 4 | "tab";

export type Settings = {
  indent: Indent;
  sortKeys: boolean;
  tolerant: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  indent: 2,
  sortKeys: false,
  tolerant: false,
};

const STORAGE_KEY = "jsony.formatter.settings";

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_SETTINGS;
    return mergeWithDefaults(parsed as Partial<Settings>);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable / quota — silent.
  }
}

export function indentToString(indent: Indent): string | number {
  return indent === "tab" ? "\t" : indent;
}

function mergeWithDefaults(partial: Partial<Settings>): Settings {
  const indent: Indent =
    partial.indent === 2 || partial.indent === 4 || partial.indent === "tab"
      ? partial.indent
      : DEFAULT_SETTINGS.indent;
  return {
    indent,
    sortKeys:
      typeof partial.sortKeys === "boolean"
        ? partial.sortKeys
        : DEFAULT_SETTINGS.sortKeys,
    tolerant:
      typeof partial.tolerant === "boolean"
        ? partial.tolerant
        : DEFAULT_SETTINGS.tolerant,
  };
}
