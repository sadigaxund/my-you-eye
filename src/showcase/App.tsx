import { useEffect, useState } from "react";
import { fontOptions } from "../lib/fonts";
import type { FontMode } from "../lib/fonts";
import { themeGroups } from "../lib/themes";
import type { ThemeProfile } from "../lib/themes";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";
import { TexturedSurface } from "../ui/decorators/textured-surface";
import { PAGE_MEDIUM_URI, PAGE_MEDIUM_FROSTED_LAYERS } from "../ui/decorators/textured-surface/svg-utils";
import type { ShowcaseTexture } from "./types";
import { Sidebar } from "./Sidebar";
import { ComponentPage } from "./ComponentPage";
import { pages, findPage } from "./registry";

/**
 * Routing is still nothing but the URL hash (AGENTS.md §4) — it just carries
 * one more level now: `#button` opens a page, `#button--sizes` opens the same
 * page *and* scrolls to that demo's card. Everything before the `--` is the
 * page slug (see `demoAnchor()`), so a demo anchor is a valid deep link from
 * a cold load, not only an in-page jump.
 */
function parseHash(): { slug?: string; anchor?: string } {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return {};
  const [slug] = raw.split("--");
  return { slug, anchor: raw.includes("--") ? raw : undefined };
}

function initialSlug(): string | undefined {
  const { slug } = parseHash();
  if (slug && findPage(slug)) return slug;
  return pages[0]?.slug;
}

export default function App() {
  const [dark, setDark] = useState(false);
  const [font, setFont] = useState<FontMode>("sans");
  const [theme, setTheme] = useState<ThemeProfile>("default");
  const [activeSlug, setActiveSlug] = useState<string | undefined>(initialSlug);
  const [anchor, setAnchor] = useState<string | undefined>(() => parseHash().anchor);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [texture, setTexture] = useState<ShowcaseTexture>("theme");

  // The only history listener in the app. A TOC link, a demo's own `#`
  // anchor and the prev/next footer all navigate by writing the hash, so
  // they all land here.
  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHash();
      if (parsed.slug && findPage(parsed.slug)) setActiveSlug(parsed.slug);
      setAnchor(parsed.anchor);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Runs after the page for `activeSlug` has committed, which is what makes
  // a cross-page demo link work: the anchor element doesn't exist until the
  // new page renders, so the browser's own hash scroll fires too early.
  useEffect(() => {
    if (!anchor) {
      window.scrollTo({ top: 0 });
      return;
    }
    document.getElementById(anchor)?.scrollIntoView({ block: "start" });
  }, [anchor, activeSlug]);

  const toggleDark = () => {
    setDark((d) => {
      document.documentElement.classList.toggle("dark", !d);
      return !d;
    });
  };

  const handleThemeChange = (val: ThemeProfile) => {
    setTheme(val);
    setTexture(val === "glass" ? "frosted-glass" : val === "metallic" ? "brushed-aluminium" : "theme");
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

    const themeFont = getComputedStyle(el).getPropertyValue("--theme-font").trim();
    if (themeFont && fontOptions.some((f) => f.value === themeFont)) {
      setFont(themeFont as FontMode);
      el.dataset.font = themeFont;
    } else {
      setFont("sans");
      el.dataset.font = "sans";
    }
  };

  const selectComponent = (slug: string) => {
    setActiveSlug(slug);
    window.location.hash = slug;
  };

  return (
    <div className="min-h-dvh text-fg">
      <TexturedSurface texture={texture} layer="foreground" strength="subtle" color="--color-surface-elevated" variant="elevated" className="flex items-center justify-between gap-inline border-b border-border px-panel py-3">
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
              {themeGroups.flatMap((group, gi) => [
                ...(gi > 0 ? [<div key={`sep-${gi}`} className="mx-2 my-1 h-px bg-border" role="separator" />] : []),
                ...group.options.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                )),
              ])}
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
          texture={texture}
          activeSlug={activeSlug}
          onSelect={selectComponent}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />
        <main className="min-w-0 flex-1 px-panel py-8">
          <ComponentPage texture={texture} page={findPage(activeSlug ?? "")} />
        </main>
      </div>
    </div>
  );
}
