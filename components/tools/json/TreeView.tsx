type TreeNodeProps = {
  name?: string;
  value: unknown;
  depth: number;
};

export default function TreeView({ value }: { value: unknown }) {
  return (
    <div className="font-mono text-sm leading-6">
      <TreeNode value={value} depth={0} />
    </div>
  );
}

function TreeNode({ name, value, depth }: TreeNodeProps) {
  const indent = `${depth * 16}px`;

  if (isContainer(value)) {
    const isArr = Array.isArray(value);
    const entries: [string, unknown][] = isArr
      ? (value as unknown[]).map((v, i) => [String(i), v])
      : Object.entries(value as Record<string, unknown>);
    const open = isArr ? "[" : "{";
    const close = isArr ? "]" : "}";
    const countLabel = isArr
      ? entries.length === 1
        ? "1 item"
        : `${entries.length} items`
      : entries.length === 1
        ? "1 key"
        : `${entries.length} keys`;

    if (entries.length === 0) {
      return (
        <div
          style={{ paddingLeft: indent }}
          className="flex items-baseline gap-1"
        >
          <span className="inline-block w-4" />
          {name !== undefined && <Key name={name} />}
          <span className="text-zinc-500">
            {open}
            {close}
          </span>
        </div>
      );
    }

    return (
      <details open className="tree-details">
        <summary
          style={{ paddingLeft: indent }}
          className="tree-summary flex cursor-pointer items-baseline gap-1 select-none rounded hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          <span className="tree-chevron inline-block w-4 text-zinc-400">
            ▸
          </span>
          {name !== undefined && <Key name={name} />}
          <span className="text-zinc-500">{open}</span>
          <span className="text-xs text-zinc-400">{countLabel}</span>
          <span className="text-zinc-500">{close}</span>
        </summary>
        <div>
          {entries.map(([k, v]) => (
            <TreeNode key={k} name={k} value={v} depth={depth + 1} />
          ))}
        </div>
      </details>
    );
  }

  return (
    <div style={{ paddingLeft: indent }} className="flex items-baseline gap-1">
      <span className="inline-block w-4" />
      {name !== undefined && <Key name={name} />}
      <Primitive value={value} />
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
