import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { TexturedSurface } from "../ui/patterns/textured-surface";
import type { TextureName } from "../ui/patterns/textured-surface";
import { findComponentApi, hasApi, splitDefault } from "./manifest";
import { apiAnchor } from "./registry";
import type { ManifestComponent } from "./manifest";

/** `VariantProps<typeof xVariants>` is already spelled out by the variants
 * block above the table — listing it again as an inherited interface is
 * noise. Everything else (`ButtonHTMLAttributes<HTMLButtonElement>`, …) is
 * real, useful information. */
const inheritedInterfaces = (api: ManifestComponent) =>
  (api.extends ?? []).filter((name) => !name.startsWith("VariantProps<"));

function VariantAxes({ api }: { api: ManifestComponent }) {
  const axes = Object.entries(api.variants);
  if (axes.length === 0) return null;
  return (
    <div className="mb-8 flex flex-col gap-3">
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

function PropsTable({ api }: { api: ManifestComponent }) {
  const props = Object.entries(api.props);
  const inherited = inheritedInterfaces(api);
  if (props.length === 0 && inherited.length === 0) return null;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead density="compact">Prop</TableHead>
          <TableHead density="compact">Type</TableHead>
          <TableHead density="compact">Default</TableHead>
          <TableHead density="compact">Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.map(([name, prop]) => {
          const { doc, def } = splitDefault(prop.doc);
          return (
            <TableRow key={name}>
              <TableCell density="compact" className="align-top">
                <span className="font-mono text-xs text-fg">{name}</span>
                {prop.optional && <span className="text-muted">?</span>}
              </TableCell>
              <TableCell density="compact" className="align-top">
                <span className="font-mono text-xs break-words text-code-fg">{prop.type}</span>
              </TableCell>
              <TableCell density="compact" className="align-top">
                {def ? <span className="font-mono text-xs text-code-fg">{def}</span> : <span className="text-muted">—</span>}
              </TableCell>
              <TableCell density="compact" className="align-top text-muted">
                {doc ?? "—"}
              </TableCell>
            </TableRow>
          );
        })}
        {inherited.length > 0 && (
          <TableRow>
            <TableCell density="compact" colSpan={4} className="text-muted">
              Also accepts every prop of{" "}
              <span className="font-mono text-xs text-code-fg">{inherited.join(", ")}</span>.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
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
 */
export function ApiReference({ title, entrySlug, texture }: ApiReferenceProps) {
  const api = findComponentApi(title);
  if (!hasApi(api)) return null;
  const showTable = Object.keys(api.props).length > 0 || inheritedInterfaces(api).length > 0;
  return (
    <section id={apiAnchor(entrySlug)} className="mt-12 scroll-mt-6">
      <h2 className="mb-1 text-lg font-semibold text-fg">API</h2>
      <p className="mb-5 text-xs text-muted">
        Generated from the component source — the same data that ships in <span className="font-mono">components.json</span>.
      </p>
      <VariantAxes api={api} />
      {showTable && (
        <TexturedSurface
          texture={texture}
          layer="surface"
          strength="subtle"
          color="--color-surface-elevated"
          radius="lg"
          className="contain-paint overflow-x-auto"
        >
          <PropsTable api={api} />
        </TexturedSurface>
      )}
    </section>
  );
}
