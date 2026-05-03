"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "jsony.theme";
type Choice = "system" | "light" | "dark";

function isDark(choice: Choice): boolean {
  if (choice === "dark") return true;
  if (choice === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function ThemeToggle() {
  const [choice, setChoice] = useState<Choice>("system");

  useEffect(() => {
    // Hydrate from localStorage post-mount. The boot script in app/layout.tsx
    // already applied the right .dark class synchronously before paint, so
    // there's no FOUC; this is just to sync React state with the user's
    // choice. The setState here is the canonical "load client-only state on
    // mount" pattern — no cascading renders in practice.
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "light" || v === "dark") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setChoice(v);
      }
    } catch {
      // localStorage unavailable; stay on default.
    }
  }, []);

  useEffect(() => {
    if (choice !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () =>
      document.documentElement.classList.toggle("dark", mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [choice]);

  const cycle = () => {
    const order: Choice[] = ["system", "light", "dark"];
    const next = order[(order.indexOf(choice) + 1) % order.length];
    setChoice(next);
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    document.documentElement.classList.toggle("dark", isDark(next));
  };

  const label =
    choice === "system" ? "System" : choice === "light" ? "Light" : "Dark";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${label}. Click to cycle.`}
      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
    >
      Theme: {label}
    </button>
  );
}
