import type { ShowcaseDemo } from "../../showcase/types";
import { ConnectionLayer } from "../connection-layer";
import { ConnectionLine } from ".";
import { ARROWHEAD_SHAPES } from "./arrowheads";

// The shape-anchoring demos, split out of ConnectionLine.showcase.tsx purely
// to keep that file under the repo's 250-line guideline (AGENTS.md §2) — the
// same reason geometry.ts/layout.ts are split. They are spread back into the
// entry's `demos` array unchanged.

export const anchoringDemos: ShowcaseDemo[] = [
    {
      name: "Shape anchoring (from/to as a rect, not a point)",
      description:
        "Pass `{ rect }` instead of `{ x, y }` and the endpoint is chosen ON the shape's border, from eight anchors (four side centres + four corners), by a cost that rewards leaving and arriving along the side's own outward direction — not merely the shortest gap, which picks corners constantly and reads as accidental. Three consequences: the stroke never runs into a node, the arrowhead touches instead of penetrating, and the curve leaves perpendicular to the side it meets. `anchor` pins one explicitly; `anchor: \"radial\"` is the centre-of-gravity variant for shapes that aren't really rectangles.",
      render: () => {
        const box = (r: { x: number; y: number; width: number; height: number }, label: string, round = false) => (
          <div
            className={`absolute flex items-center justify-center border border-border bg-surface text-xs text-fg ${round ? "rounded-full" : "rounded-ui"}`}
            style={{ left: r.x, top: r.y, width: r.width, height: r.height }}
          >
            {label}
          </div>
        );
        const a = { x: 20, y: 20, width: 90, height: 44 };
        const b = { x: 250, y: 20, width: 90, height: 44 };
        const c = { x: 20, y: 130, width: 90, height: 44 };
        const d = { x: 250, y: 130, width: 90, height: 44 };
        const hub = { x: 140, y: 68, width: 70, height: 58 };
        return (
          <div className="flex flex-col items-center gap-12 py-4 h-auto">
            <div className="relative" style={{ width: 360, height: 210 }}>
              {box(a, "A")}
              {box(b, "B")}
              {box(c, "C")}
              {box(d, "D")}
              {box(hub, "hub", true)}
              <ConnectionLayer
                edges={[
                  { id: "a", from: { rect: a }, to: { rect: hub, anchor: "radial" }, kind: "sync", arrowhead: true },
                  { id: "b", from: { rect: b }, to: { rect: hub, anchor: "radial" }, kind: "data", arrowhead: true },
                  { id: "c", from: { rect: hub, anchor: "radial" }, to: { rect: c }, kind: "async", arrowhead: true },
                  { id: "d", from: { rect: hub, anchor: "radial" }, to: { rect: d }, kind: "error", arrowhead: true },
                ]}
              />
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted">
                auto anchors on the boxes, radial on the round hub
              </span>
            </div>
            <div className="relative" style={{ width: 360, height: 200 }}>
              {box({ x: 20, y: 20, width: 90, height: 44 }, "left")}
              {box({ x: 250, y: 20, width: 90, height: 44 }, "right")}
              {box({ x: 135, y: 130, width: 90, height: 44 }, "below")}
              <ConnectionLayer
                edges={[
                  {
                    id: "sides",
                    from: { rect: { x: 20, y: 20, width: 90, height: 44 } },
                    to: { rect: { x: 250, y: 20, width: 90, height: 44 } },
                    label: "side to side", arrowhead: true,
                  },
                  {
                    id: "diag",
                    from: { rect: { x: 20, y: 20, width: 90, height: 44 } },
                    to: { rect: { x: 135, y: 130, width: 90, height: 44 } },
                    label: "diagonal", arrowhead: true, state: "pending",
                  },
                ]}
              />
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted">
                aligned shapes take the side centres, a true diagonal takes the corner
              </span>
            </div>
          </div>
        );
      },
    },
  {
    name: "Arrowhead shapes",
    description:
      "Every shape declares how far the ROUTE must stop short of the endpoint, and the stroke is trimmed to exactly that. A solid head absorbs the line (it ends ~1px inside, so no hairline seam shows under antialiasing); an open head is drawn AROUND the line and needs it to reach the tip, so nothing is trimmed. Without this the stroke squeezes out past a tapering tip — one pixel behind an 8px triangle's point the shape is 0.5px tall and the 2px stroke is not.",
    render: () => (
      <div className="flex flex-col items-center gap-8 py-4 h-auto">
        {ARROWHEAD_SHAPES.map((shape) => (
          <div key={shape} className="relative" style={{ width: 300, height: 44 }}>
            <ConnectionLine from={{ x: 10, y: 22 }} to={{ x: 250, y: 22 }} variant="straight" kind="sync" arrowhead={shape} />
            <span className="absolute left-[260px] top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-xs text-muted">{shape}</span>
          </div>
        ))}
      </div>
    ),
  },
];
