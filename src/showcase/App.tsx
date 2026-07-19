import { useState } from "react";
import { fontOptions } from "../lib/fonts";
import type { FontMode } from "../lib/fonts";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";
import { TexturedSurface } from "../ui/patterns/textured-surface";
import { PAGE_MEDIUM_URI, PAGE_MEDIUM_FROSTED_LAYERS } from "../ui/patterns/textured-surface/svg-utils";
import { Sidebar } from "./Sidebar";
import { ComponentPage } from "./ComponentPage";
import { pages, findPage } from "./registry";

const THEME_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "neon", label: "Neon" },
  { value: "high-contrast", label: "High Contrast" },
  { value: "glass", label: "Glass" },
  { value: "comic", label: "Comic" },
  { value: "brutal", label: "Brutal" },
  { value: "stark", label: "Stark" },
] as const;
type ThemeProfile = (typeof THEME_OPTIONS)[number]["value"];

function initialSlug(): string | undefined {
  const fromHash = window.location.hash.replace(/^#/, "");
  if (fromHash && findPage(fromHash)) return fromHash;
  return pages[0]?.slug;
}

export default function App() {
  const [dark, setDark] = useState(false);
  const [font, setFont] = useState<FontMode>("sans");
  const [theme, setTheme] = useState<ThemeProfile>("default");
  const [activeSlug, setActiveSlug] = useState<string | undefined>(initialSlug);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleDark = () => {
    setDark((d) => {
      document.documentElement.classList.toggle("dark", !d);
      return !d;
    });
  };

  const handleThemeChange = (val: ThemeProfile) => {
    setTheme(val);
    const el = document.documentElement;
    if (val === "default") {
      el.removeAttribute("data-theme");
      el.style.removeProperty("--texture-paper");
    } else {
      el.dataset.theme = val;
      if (val === "comic") {
        el.style.setProperty("--texture-paper", `url("${PAGE_MEDIUM_URI}")`);
      } else if (val === "glass") {
        el.style.setProperty("--texture-paper", PAGE_MEDIUM_FROSTED_LAYERS);
      } else {
        el.style.removeProperty("--texture-paper");
      }
    }
  };

  const selectComponent = (slug: string) => {
    setActiveSlug(slug);
    window.location.hash = slug;
  };

  return (
    <div className="min-h-dvh text-fg">
      <TexturedSurface texture="theme" layer="foreground" strength="subtle" color="--color-surface-elevated" variant="elevated" className="flex items-center justify-between gap-inline border-b border-border px-panel py-3">
        <div className="flex items-center gap-inline">
          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            className="rounded-ui border border-border px-2 py-1 text-sm cursor-pointer lg:hidden"
            aria-label="Toggle component menu"
          >
            ☰
          </button>
          <h1 className="text-lg font-bold">MyUI Showcase</h1>
        </div>
        <div className="flex items-center gap-inline">
          <Select value={theme} onValueChange={(v) => handleThemeChange(v as ThemeProfile)}>
            <SelectTrigger size="sm" className="w-auto gap-2">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              {THEME_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={font}
            onValueChange={(v) => {
              setFont(v as FontMode);
              document.documentElement.dataset.font = v;
            }}
          >
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
      </TexturedSurface>

      <div className="flex">
        <Sidebar
          activeSlug={activeSlug}
          onSelect={selectComponent}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />
        <main className="min-w-0 flex-1 px-panel py-8">
          <ComponentPage page={findPage(activeSlug ?? "")} />
        </main>
      </div>
    </div>
  );
}
