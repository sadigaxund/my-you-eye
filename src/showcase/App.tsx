import { useState } from "react";
import type { ShowcaseEntry, ShowcaseGroup } from "./types";

const GROUPS: ShowcaseGroup[] = [
  "inputs",
  "display",
  "feedback",
  "overlay",
  "navigation",
  "data",
  "patterns",
];

const entries: ShowcaseEntry[] = Object.values(
  import.meta.glob("../ui/**/*.showcase.tsx", { eager: true }),
).map((mod: unknown) => (mod as { default: ShowcaseEntry }).default);

function groupEntries(group: ShowcaseGroup) {
  return entries.filter((e) => e.group === group);
}

export default function App() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState<ShowcaseGroup>("inputs");

  const toggleDark = () => {
    setDark((d) => {
      document.documentElement.classList.toggle("dark", !d);
      return !d;
    });
  };

  return (
    <div className="min-h-dvh bg-bg text-fg p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">UI Showcase</h1>
        <button
          type="button"
          onClick={toggleDark}
          className="px-3 py-1 rounded-ui border border-border text-sm cursor-pointer"
        >
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      <nav className="flex gap-2 mb-8 flex-wrap">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setTab(g)}
            className={`px-4 py-1.5 rounded-ui text-sm capitalize cursor-pointer ${
              tab === g
                ? "bg-primary text-primary-fg"
                : "bg-secondary text-secondary-fg hover:bg-border"
            }`}
          >
            {g}
          </button>
        ))}
      </nav>

      <main className="space-y-10">
        {groupEntries(tab).map((entry) => (
          <section key={entry.title}>
            <h2 className="text-lg font-semibold mb-3">{entry.title}</h2>
            <div className="space-y-4">
              {entry.demos.map((demo) => (
                <div key={demo.name}>
                  <p className="text-sm text-muted mb-2">{demo.name}</p>
                  <div className="border border-border rounded-ui p-4">
                    {demo.render()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        {groupEntries(tab).length === 0 && (
          <p className="text-muted text-sm">No components in this group yet.</p>
        )}
      </main>
    </div>
  );
}
