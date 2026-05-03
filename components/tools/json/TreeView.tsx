"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

const ROW_HEIGHT = 24;
const INDENT_PER_LEVEL = 16;
const AUTO_EXPAND_DEPTH = 1;
const AUTO_EXPAND_MAX_CHILDREN = 50;

type Row =
  | {
      kind: "leaf";
      path: string;
      depth: number;
      name: string | null;
      value: unknown;
    }
  | {
      kind: "container";
      path: string;
      depth: number;
      name: string | null;
      isArray: boolean;
      count: number;
      isEmpty: boolean;
    };

export default function TreeView({ value }: { value: unknown }) {
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    defaultExpansion(value),
  );

  useEffect(() => {
    setExpanded(defaultExpansion(value));
  }, [value]);

  const rows = useMemo(() => flatten(value, expanded), [value, expanded]);

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  const toggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  return (
    <div ref={parentRef} role="tree" className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
        className="font-mono text-sm"
      >
        {virtualizer.getVirtualItems().map((vi) => {
          const row = rows[vi.index];
          const isExpanded = expanded.has(row.path);
          return (
            <div
              key={vi.key}
              data-index={vi.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                transform: `translateY(${vi.start}px)`,
                height: `${vi.size}px`,
              }}
            >
              <RowView row={row} expanded={isExpanded} onToggle={toggle} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RowView({
  row,
  expanded,
  onToggle,
}: {
  row: Row;
  expanded: boolean;
  onToggle: (path: string) => void;
}) {
  const indent = `${row.depth * INDENT_PER_LEVEL + 8}px`;

  if (row.kind === "container") {
    const open = row.isArray ? "[" : "{";
    const close = row.isArray ? "]" : "}";
    const countLabel = row.isArray
      ? row.count === 1
        ? "1 item"
        : `${row.count} items`
      : row.count === 1
        ? "1 key"
        : `${row.count} keys`;

    if (row.isEmpty) {
      return (
        <div
          role="treeitem"
          aria-level={row.depth + 1}
          style={{ paddingLeft: indent }}
          className="flex h-full items-center gap-1 whitespace-nowrap pr-2"
        >
          <span className="inline-block w-4" />
          {row.name !== null && <Key name={row.name} />}
          <span className="text-zinc-500">
            {open}
            {close}
          </span>
        </div>
      );
    }

    return (
      <div
        role="treeitem"
        aria-level={row.depth + 1}
        aria-expanded={expanded}
        tabIndex={0}
        onClick={() => onToggle(row.path)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(row.path);
          }
        }}
        style={{ paddingLeft: indent }}
        className="flex h-full cursor-pointer select-none items-center gap-1 whitespace-nowrap rounded pr-2 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-zinc-900"
      >
        <span
          aria-hidden="true"
          className={`inline-block w-4 text-zinc-400 ${expanded ? "rotate-90" : ""}`}
        >
          ▸
        </span>
        {row.name !== null && <Key name={row.name} />}
        <span className="text-zinc-500">{open}</span>
        <span className="text-xs text-zinc-400">{countLabel}</span>
        <span className="text-zinc-500">{close}</span>
      </div>
    );
  }

  return (
    <div
      role="treeitem"
      aria-level={row.depth + 1}
      style={{ paddingLeft: indent }}
      className="flex h-full items-center gap-1 whitespace-nowrap pr-2"
    >
      <span className="inline-block w-4" />
      {row.name !== null && <Key name={row.name} />}
      <Primitive value={row.value} />
    </div>
  );
}

function Key({ name }: { name: string }) {
  return (
    <span className="text-zinc-700 dark:text-zinc-300">
      {name}
      <span className="text-zinc-500">:</span>
    </span>
  );
}

function Primitive({ value }: { value: unknown }) {
  if (value === null) {
    return <span className="italic text-zinc-500">null</span>;
  }
  if (typeof value === "string") {
    return (
      <span className="text-emerald-700 dark:text-emerald-400">
        {JSON.stringify(value)}
      </span>
    );
  }
  if (typeof value === "number") {
    return (
      <span className="text-violet-700 dark:text-violet-400">
        {String(value)}
      </span>
    );
  }
  if (typeof value === "boolean") {
    return (
      <span className="text-amber-700 dark:text-amber-400">
        {String(value)}
      </span>
    );
  }
  return <span className="text-rose-600">{String(value)}</span>;
}

function isContainer(value: unknown): value is object {
  return (
    value !== null &&
    typeof value === "object" &&
    (Array.isArray(value) || Object.getPrototypeOf(value) === Object.prototype)
  );
}

function flatten(value: unknown, expanded: Set<string>): Row[] {
  const out: Row[] = [];
  function walk(
    v: unknown,
    name: string | null,
    path: string,
    depth: number,
  ) {
    if (isContainer(v)) {
      const isArr = Array.isArray(v);
      const entries: [string, unknown][] = isArr
        ? (v as unknown[]).map((c, i) => [String(i), c])
        : Object.entries(v as Record<string, unknown>);
      out.push({
        kind: "container",
        path,
        depth,
        name,
        isArray: isArr,
        count: entries.length,
        isEmpty: entries.length === 0,
      });
      if (entries.length > 0 && expanded.has(path)) {
        for (const [k, c] of entries) {
          const childPath = path === "" ? k : `${path}.${k}`;
          walk(c, k, childPath, depth + 1);
        }
      }
    } else {
      out.push({ kind: "leaf", path, depth, name, value: v });
    }
  }
  walk(value, null, "", 0);
  return out;
}

function defaultExpansion(value: unknown): Set<string> {
  const set = new Set<string>([""]);
  function walk(v: unknown, path: string, depth: number) {
    if (depth > AUTO_EXPAND_DEPTH) return;
    if (!isContainer(v)) return;
    const isArr = Array.isArray(v);
    const entries: [string, unknown][] = isArr
      ? (v as unknown[]).map((c, i) => [String(i), c])
      : Object.entries(v as Record<string, unknown>);
    if (entries.length > AUTO_EXPAND_MAX_CHILDREN) return;
    for (const [k, c] of entries) {
      const childPath = path === "" ? k : `${path}.${k}`;
      set.add(childPath);
      walk(c, childPath, depth + 1);
    }
  }
  walk(value, "", 0);
  return set;
}
