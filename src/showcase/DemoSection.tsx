import { useState } from "react";
import { Button } from "../ui/button";
import { CodeBlock } from "../ui/code-block";
import { Link } from "../ui/link";
import { TexturedSurface } from "../ui/patterns/textured-surface";
import type { TextureName } from "../ui/patterns/textured-surface";
import { cn } from "../lib/cn";
import type { RegistryDemo } from "./registry";

const overflowClass = (v: NonNullable<RegistryDemo["overflow"]>) =>
  v === "auto" ? "overflow-auto" : v === "hidden" ? "overflow-hidden" : "overflow-visible";

export interface DemoSectionProps {
  demo: RegistryDemo;
  texture: TextureName;
  /** Stable `id` for this card's heading — see `demoAnchor()` in registry.ts. */
  anchor: string;
}

/**
 * One demo, one card — the same card every time.
 *
 * Previously a demo that had extractable source rendered in a plain filing
 * `Tabs` box and a demo that didn't rendered in a `TexturedSurface` panel, so
 * two demos on the same page sat on visibly different materials for a reason
 * (whether the source extractor was confident) that means nothing to a
 * reader. Now every demo gets the panel, and source — when there is any —
 * unfolds *inside* the same card under the preview, the way a component
 * library's docs page does it.
 *
 * Anatomy: header row (anchored name + description + code toggle) / preview /
 * optional code. `layout: "center"` and `overflow` still control the preview
 * box exactly as before.
 */
export function DemoSection({ demo, texture, anchor }: DemoSectionProps) {
  const [showCode, setShowCode] = useState(false);
  const hasSource = Boolean(demo.source);
  const ov = demo.overflow ?? "visible";

  return (
    <TexturedSurface
      texture={texture}
      layer="surface"
      strength="subtle"
      color="--color-surface-elevated"
      radius="lg"
      // contain-paint: the panel already clips its own overflow, so this is
      // visually inert — it just stops a repaint inside the card (every
      // animated MotionPreview, every hover state) from being composited
      // against the page's textured/backdrop-filtered background. See
      // `ShowcaseDemo.contain` for the one demo that has to opt out.
      className={cn(demo.contain !== false && "contain-paint")}
    >
      <div className="flex items-start justify-between gap-inline border-b border-border px-panel py-3">
        <div className="group min-w-0">
          <h3 id={anchor} className="scroll-mt-6 text-sm font-semibold text-fg">
            {demo.name}
            <Link
              href={`#${anchor}`}
              variant="muted"
              aria-label={`Link to ${demo.name}`}
              className="ml-2 align-middle text-xs opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              #
            </Link>
          </h3>
          {demo.description && <p className="mt-1 max-w-prose text-xs leading-relaxed text-muted">{demo.description}</p>}
        </div>
        {hasSource && (
          <Button
            size="sm"
            variant="ghost"
            aria-expanded={showCode}
            onClick={() => setShowCode((open) => !open)}
            className="shrink-0"
          >
            {showCode ? "Hide code" : "Code"}
          </Button>
        )}
      </div>

      <div className={cn("p-panel", demo.layout === "center" && "flex items-center justify-center", overflowClass(ov))}>
        {demo.render()}
      </div>

      {hasSource && showCode && (
        <div className="border-t border-border p-panel">
          <CodeBlock code={demo.source ?? ""} language="tsx" wrap={false} />
        </div>
      )}
    </TexturedSurface>
  );
}
