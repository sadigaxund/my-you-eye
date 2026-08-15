import { Badge } from "../ui/badge";
import { TexturedSurface } from "../ui/patterns/textured-surface";
import type { TextureName } from "../ui/patterns/textured-surface";
import { findComponentApi, hasApi, splitDefault } from "./manifest";
import { apiAnchor } from "./registry";
import type { ManifestComponent } from "./manifest";

/** `VariantProps<typeof xVariants>` is already spelled out by the variants
 * block above the prop list — listing it again as an inherited interface is
 * noise. Everything else (`ButtonHTMLAttributes<HTMLButtonElement>`, …) is
 * real, useful information. */
const inheritedInterfaces = (api: ManifestComponent) =>
  (api.extends ?? []).filter((name) => !name.startsWith("VariantProps<"));

function SectionLabel({ children }: { children: string }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-muted">{children}</p>;
}

function VariantAxes({ api }: { api: ManifestComponent }) {
  const axes = Object.entries(api.variants);
  if (axes.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Variants</SectionLabel>
      {axes.map(([axis, values]) => {
        const fallback = api.variantDefaults?.[axis];
        return (
          <div key={axis} className="flex flex-wrap items-center gap-2">
            <span className="w-24 shrink-0 font-mono text-xs font-medium text-fg">{axis}</span>
            {values.map((value) => (
              <Badge
                key={value}
                variant={value === fallback ? "primary" : "neutral"}
                tone="soft"
                className="font-mono"
              >
                {value}
                {value === fallback && <span className="ml-1.5 font-sans opacity-muted">default</span>}
              </Badge>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/**
 * One prop, as two lines rather than four table cells.
 *
 * The table this replaces gave `Default` a full column that was empty for
 * most props of most components, and gave `Type` a column too narrow for the
 * union types that actually need reading — so a `StatCard` object type or a
 * twelve-member string union either overflowed the panel or wrapped one
 * character at a time. Here the type is a chip that owns the rest of the
 * line and wraps inside itself, the default only takes space when there is
 * one, and the description gets the full panel width at a body text size
 * instead of a `text-xs` sliver.
 */
function PropRow({ name, type, optional, doc }: { name: string; type: string; optional: boolean; doc?: string }) {
  const { doc: description, def } = splitDefault(doc);
  return (
    <div className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5">
        <span className="font-mono text-sm font-medium text-fg">
          {name}
          {optional && <span className="text-muted">?</span>}
        </span>
        <span className="flex min-w-0 max-w-full flex-wrap items-center gap-1.5">
          <Badge
            tone="soft"
            variant="neutral"
            className="max-w-full whitespace-normal break-words text-left font-mono text-code-fg"
          >
            {type}
          </Badge>
          {def && (
            <Badge tone="soft" variant="primary" className="font-mono">
              <span className="mr-1 font-sans opacity-muted">default</span>
              {def}
            </Badge>
          )}
        </span>
      </div>
      {description && <p className="text-sm leading-relaxed text-muted">{description}</p>}
    </div>
  );
}

function PropList({ api }: { api: ManifestComponent }) {
  const props = Object.entries(api.props);
  if (props.length === 0) return null;
  const hasVariants = Object.keys(api.variants).length > 0;
  return (
    <div className="flex flex-col gap-3">
      {hasVariants && <SectionLabel>Props</SectionLabel>}
      <div className="divide-y divide-border">
        {props.map(([name, prop]) => (
          <PropRow key={name} name={name} type={prop.type} optional={prop.optional} doc={prop.doc} />
        ))}
      </div>
    </div>
  );
}

export interface ApiReferenceProps {
  /** Showcase entry title — the manifest key. */
  title: string;
  entrySlug: string;
  texture: TextureName;
}

/**
 * Generated from `components.json`, which `scripts/gen-manifest.mjs` derives
 * from the component's own source (CVA axes + the props interface) — so this
 * section cannot drift from the component the way a hand-written table
 * would. Renders nothing at all when the manifest has no record for this
 * entry, or a record with neither variants nor props (a topic page like
 * "Motion Core"): an empty "API" heading is worse than no heading.
 *
 * Everything the section documents lives in ONE panel: the variant axes and
 * the prop list used to be a floating block of chips followed by a separate
 * bordered table, which read as two unrelated widgets that happened to share
 * a heading.
 */
export function ApiReference({ title, entrySlug, texture }: ApiReferenceProps) {
  const api = findComponentApi(title);
  if (!hasApi(api)) return null;
  const inherited = inheritedInterfaces(api);
  return (
    <section id={apiAnchor(entrySlug)} className="mt-12 scroll-mt-6">
      <h2 className="mb-4 text-lg font-semibold text-fg">API</h2>
      <TexturedSurface
        texture={texture}
        layer="surface"
        strength="subtle"
        color="--color-surface-elevated"
        radius="lg"
        className="contain-paint"
      >
        <div className="flex flex-col gap-6 p-panel-lg">
          <VariantAxes api={api} />
          <PropList api={api} />
          <p className="border-t border-border pt-4 text-xs text-muted">
            {inherited.length > 0 && (
              <>
                Also accepts every prop of{" "}
                <span className="font-mono text-code-fg">{inherited.join(", ")}</span>.{" "}
              </>
            )}
            Generated from the component source.
          </p>
        </div>
      </TexturedSurface>
    </section>
  );
}
