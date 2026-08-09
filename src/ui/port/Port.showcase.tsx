import type { ShowcaseEntry } from "../../showcase/types";
import { Port } from ".";

const STATES = ["default", "connected", "highlighted"] as const;

const entry: ShowcaseEntry = {
  title: "Port",
  group: "canvas",
  description: "shape=\"circle\" is a freestanding full disc. shape=\"socket\" is a true half-disc (SVG geometry, not clipping) meant to sit exactly on a node's border — see GraphNode's row ports.",
  demos: [
    {
      name: "States (circle)",
      render: () => (
        <div className="flex justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Port state="default" />
            <span className="text-xs text-muted">default</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Port state="connected" />
            <span className="text-xs text-muted">connected</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Port state="highlighted" />
            <span className="text-xs text-muted">highlighted</span>
          </div>
        </div>
      ),
    },
    {
      name: "Socket shape — mounted on a border",
      description: "The flat edge sits exactly on the dashed line (standing in for a node's border); the rounded half bulges outward. A real half-disc via SVG path geometry, not a full circle clipped by an ancestor's overflow-hidden — it looks identical with or without a clipping ancestor, unlike the old accidental version.",
      render: () => (
        <div className="flex justify-center gap-16">
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-24 w-px bg-border [background-image:repeating-linear-gradient(to_bottom,var(--color-border)_0_4px,transparent_4px_8px)]">
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Port shape="socket" side="in" state="connected" />
              </div>
            </div>
            <span className="text-xs text-muted">side=&quot;in&quot; (left-mounted) — bulges left</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-24 w-px bg-border [background-image:repeating-linear-gradient(to_bottom,var(--color-border)_0_4px,transparent_4px_8px)]">
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Port shape="socket" side="out" state="connected" />
              </div>
            </div>
            <span className="text-xs text-muted">side=&quot;out&quot; (right-mounted) — bulges right</span>
          </div>
        </div>
      ),
    },
    {
      name: "Socket shape — all states",
      render: () => (
        <div className="flex justify-center gap-10">
          {STATES.map((state) => (
            <div key={state} className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-4 rounded-ui border border-dashed border-border px-3 py-4">
                <Port shape="socket" side="in" state={state} />
                <Port shape="socket" side="out" state={state} />
              </div>
              <span className="text-xs text-muted">{state}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "Circle vs socket, side by side",
      description: "Same footprint (size-port), two deliberate shapes — pick socket for anything mounted on an edge, circle for anything freestanding.",
      render: () => (
        <div className="flex justify-center gap-10">
          <div className="flex flex-col items-center gap-2">
            <Port shape="circle" state="connected" />
            <span className="text-xs text-muted">circle</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-ui border border-dashed border-border px-3 py-2">
            <Port shape="socket" side="out" state="connected" />
            <span className="text-xs text-muted">socket</span>
          </div>
        </div>
      ),
    },
  ],
};
export default entry;
