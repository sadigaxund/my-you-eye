import { useState, useCallback } from "react";
import type { ShowcaseEntry, ShowcaseGroup } from "./types";

const GROUPS: ShowcaseGroup[] = [
  "inputs",
  "display",
  "feedback",
  "overlay",
  "navigation",
  "canvas",
  "data",
  "patterns",
  "typography",
];

type FontMode = "sans" | "serif" | "mono";
const FONT_CYCLE: FontMode[] = ["sans", "serif", "mono"];

const entries: ShowcaseEntry[] = Object.values(
  import.meta.glob("../ui/**/*.showcase.tsx", { eager: true }),
).map((mod: unknown) => (mod as { default: ShowcaseEntry }).default);

function groupEntries(group: ShowcaseGroup) {
  return entries.filter((e) => e.group === group);
}

export default function App() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState<ShowcaseGroup>("inputs");
  const [font, setFont] = useState<FontMode>("sans");

  const toggleDark = useCallback(() => {
    setDark((d) => {
      document.documentElement.classList.toggle("dark", !d);
      return !d;
    });
  }, []);

  const cycleFont = useCallback(() => {
    setFont((f) => {
      const next = FONT_CYCLE[(FONT_CYCLE.indexOf(f) + 1) % FONT_CYCLE.length];
      document.documentElement.dataset.font = next;
      return next;
    });
  }, []);

  return (
    <div className="min-h-dvh bg-bg text-fg p-panel">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">UI Showcase</h1>
        <div className="flex items-center gap-inline">
          <button
            type="button"
            onClick={cycleFont}
            className="px-3 py-1 rounded-ui border border-border text-sm cursor-pointer capitalize"
            title="Cycle font family"
          >
            {font}
          </button>
          <button
            type="button"
            onClick={toggleDark}
            className="px-3 py-1 rounded-ui border border-border text-sm cursor-pointer"
          >
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      <nav className="flex gap-inline mb-8 flex-wrap">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setTab(g)}
            className={`px-compact-x py-compact-y rounded-ui text-sm capitalize cursor-pointer ${
              tab === g
                ? "bg-primary text-primary-fg"
                : "bg-secondary text-secondary-fg hover:bg-border"
            }`}
          >
            {g}
          </button>
        ))}
      </nav>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groupEntries(tab).map((entry) => (
          <section key={entry.title} className={entry.demos.length === 1 ? "md:col-span-2" : ""}>
            <h2 className="text-lg font-semibold mb-3">{entry.title}</h2>
            <div className="space-y-4">
              {entry.demos.map((demo) => (
                <div key={demo.name}>
                  <p className="text-sm text-muted mb-2">{demo.name}</p>
                  <div className="border border-border rounded-ui p-panel">
                    {demo.render()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        {groupEntries(tab).length === 0 && (
          <p className="text-muted text-sm col-span-full">
            No components in this group yet.
          </p>
        )}
      </main>
    </div>
  );
}
