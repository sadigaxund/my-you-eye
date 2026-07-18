import { useState } from "react";
import type { ShowcaseEntry, ShowcaseGroup } from "./types";
import { fontOptions } from "../lib/fonts";
import type { FontMode } from "../lib/fonts";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";

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

type ThemeProfile = "default" | "neon" | "high-contrast" | "glass" | "comic" | "brutal" | "stark" | "earth";

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
  const [theme, setTheme] = useState<ThemeProfile>("default");

  const toggleDark = () => {
    setDark((d) => {
      document.documentElement.classList.toggle("dark", !d);
      return !d;
    });
  };

  const handleThemeChange = (val: ThemeProfile) => {
    setTheme(val);
    if (val === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.dataset.theme = val;
    }
  };

  return (
    <div className="min-h-dvh bg-bg text-fg p-panel">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">UI Showcase</h1>
        <div className="flex items-center gap-inline">
          <Select value={theme} onValueChange={(v) => handleThemeChange(v as ThemeProfile)}>
            <SelectTrigger size="sm" className="w-auto gap-2">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="neon">Neon</SelectItem>
              <SelectItem value="high-contrast">High Contrast</SelectItem>
              <SelectItem value="glass">Glass</SelectItem>
              <SelectItem value="comic">Comic</SelectItem>
              <SelectItem value="brutal">Brutal</SelectItem>
              <SelectItem value="stark">Stark</SelectItem>
              <SelectItem value="earth">Earth</SelectItem>
            </SelectContent>
          </Select>
          <Select value={font} onValueChange={(v) => {
            setFont(v as FontMode);
            document.documentElement.dataset.font = v;
          }}>
            <SelectTrigger size="sm" className="w-auto gap-2">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      <main className="columns-1 md:columns-2 xl:columns-3 gap-8 [column-rule:1px_solid_var(--color-border)]">
        {groupEntries(tab).map((entry) => (
          <section key={entry.title} className="break-inside-avoid mb-8 w-full">
            <h2 className="text-lg font-semibold mb-3">{entry.title}</h2>
            <div className="space-y-4">
              {entry.demos.map((demo) => (
                <div key={demo.name}>
                  <p className="text-sm text-muted mb-2">{demo.name}</p>
                  <div className="border border-border rounded-ui p-panel overflow-visible">
                    {demo.render()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        {groupEntries(tab).length === 0 && (
          <p className="text-muted text-sm">
            No components in this group yet.
          </p>
        )}
      </main>
    </div>
  );
}
