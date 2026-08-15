import type { ShowcaseEntry } from "../../showcase/types";
import { Typography } from ".";
import { fontOptions } from "../../lib/fonts";

const fontVar: Record<string, string> = {
  sans: "--font-sans",
  serif: "--font-serif",
  mono: "--font-mono",
  ubuntu: "--font-ubuntu",
  titillium: "--font-titillium",
  consolas: "--font-consolas",
  jetbrains: "--font-jetbrains-nerd",
};

function Swatch({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="size-8 rounded-ui border border-border shrink-0" style={{ background: color }} />
      <div>
        <p className="font-medium text-fg">{name}</p>
        <code className="text-xs text-muted">{color}</code>
      </div>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "Typography & Tokens",
  group: "typography",
  description: "The Typography prose wrapper, plus a live reference for the font, size, colour, radius and spacing tokens.",
  demos: [
    {
      name: "Prose block",
      description: "Typography is the vertical-rhythm wrapper: it applies the shared space-y-4 stack so headings, paragraphs and lists sit at one consistent interval.",
      render: () => (
        <Typography className="max-w-prose">
          <h2 className="text-2xl font-semibold text-fg">Release notes — 0.3.2</h2>
          <p className="text-sm text-muted">
            Canvas nodes now read their corner radius from a dedicated token, so no theme can
            round them differently from the grid they sit on.
          </p>
          <h3 className="text-lg font-semibold text-fg">Fixed</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-fg">
            <li>Terminal honours a fixed row count instead of growing with its output.</li>
            <li>Comparison wipes the after column in rather than cross-fading it.</li>
          </ul>
          <p className="text-sm text-muted">
            Everything above is plain markup — Typography contributes spacing only, never colour
            or type scale, so it composes with any token-driven text classes.
          </p>
        </Typography>
      ),
    },
    {
      name: "Font families",
      render: () => (
        <div className="space-y-3">
          {fontOptions.map((f) => (
            <div key={f.value}>
              <p className="text-xs text-muted mb-1">{f.label}</p>
              <p className="text-xl" style={{ fontFamily: `var(${fontVar[f.value]})` }}>The quick brown fox jumps over the lazy dog.</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "Text sizes",
      render: () => (
        <div className="space-y-2">
          {[["xs", "0.75rem"], ["sm", "0.875rem"], ["base", "1rem"], ["lg", "1.125rem"], ["xl", "1.25rem"], ["2xl", "1.5rem"]].map(([name, rem]) => (
            <div key={name} className="flex items-baseline gap-4">
              <code className="text-xs text-muted w-20 shrink-0">text-{name} ({rem})</code>
              <p className={`text-${name}`}>Aa Bb Cc 123 — The quick brown fox</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "Colors",
      render: () => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Swatch name="bg" color="var(--color-bg)" />
          <Swatch name="fg" color="var(--color-fg)" />
          <Swatch name="muted" color="var(--color-muted)" />
          <Swatch name="primary" color="var(--color-primary)" />
          <Swatch name="primary-fg" color="var(--color-primary-fg)" />
          <Swatch name="secondary" color="var(--color-secondary)" />
          <Swatch name="secondary-fg" color="var(--color-secondary-fg)" />
          <Swatch name="danger" color="var(--color-danger)" />
          <Swatch name="success" color="var(--color-success)" />
          <Swatch name="warning" color="var(--color-warning)" />
          <Swatch name="border" color="var(--color-border)" />
          <Swatch name="ring" color="var(--color-ring)" />
        </div>
      ),
    },
    {
      name: "Radius & spacing",
      render: () => (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted mb-2">Border radius</p>
            <div className="flex items-end gap-4">
              {[["ui-sm", "4px"], ["ui", "6px"], ["ui-lg", "10px"]].map(([name, px]) => (
                <div key={name} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-primary/20 border border-primary" style={{ borderRadius: `var(--radius-${name})` }} />
                  <code className="text-xs text-muted">rounded-{name} ({px})</code>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted mb-2">Spacing tokens</p>
            <div className="space-y-2">
              {[["panel", "1rem"], ["compact-x", "0.75rem"], ["compact-y", "0.5rem"], ["stack", "0.75rem"], ["inline", "0.5rem"], ["tight", "0.25rem"], ["bar", "0.25rem"]].map(([name, rem]) => (
                <div key={name} className="flex items-center gap-3 text-sm">
                  <code className="text-muted w-28 shrink-0">spacing-{name}</code>
                  <span className="text-muted w-16">{rem}</span>
                  <div className="flex items-center gap-1">
                    <div className="h-4 shrink-0 rounded-ui-sm bg-primary/30" style={{ width: `var(--spacing-${name})` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ],
};
export default entry;
