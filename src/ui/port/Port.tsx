import { forwardRef } from "react";
import type { HTMLAttributes, SVGAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const portVariants = cva(
  "size-port rounded-full border-2 bg-bg transition-colors",
  {
    variants: {
      side: {
        in: "",
        out: "",
      },
      state: {
        default: "border-muted",
        connected: "border-primary bg-primary",
        highlighted: "border-primary ring-2 ring-primary/30",
      },
    },
    defaultVariants: {
      side: "in",
      state: "default",
    },
  },
);

// Socket geometry (viewBox-local units, independent of the rendered CSS
// size — `size-port` on the <svg> scales the whole coordinate space, same
// as the arrowhead polygon in ConnectionPath). Center + radius leave room
// for the 2px stroke so it never clips against the viewBox edge.
const SOCKET_VB = 12;
const SOCKET_C = SOCKET_VB / 2;
const SOCKET_R = SOCKET_C - 1;

const SOCKET_STYLE: Record<NonNullable<PortProps["state"]>, { fill: string; stroke: string; extra?: string }> = {
  default: { fill: "fill-bg", stroke: "stroke-muted" },
  connected: { fill: "fill-primary", stroke: "stroke-primary" },
  highlighted: { fill: "fill-bg", stroke: "stroke-primary", extra: "drop-shadow-[0_0_3px_var(--color-primary)]" },
};

export interface PortProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof portVariants> {
  label?: string;
  /**
   * "circle" (default) renders a full disc — the original look, unchanged,
   * for a freestanding port that isn't mounted on any edge (e.g. a legend
   * swatch, or GraphNode's legacy `ports` prop which already floats beside
   * the node with its own label).
   *
   * "socket" renders a true half-disc via SVG path geometry — flat edge
   * coincident with whatever border it's mounted against, rounded half
   * bulging outward. This is the deliberate version of what GraphNode's
   * row ports used to get by accident (a full circle straddling the node's
   * border, half clipped away by the node's own `overflow-hidden`): same
   * visual, but it no longer depends on an ancestor clipping it, so it
   * survives anyone touching that ancestor's overflow. `side` controls
   * which way the flat edge faces: "in" (left-mounted) bulges left,
   * "out" (right-mounted) bulges right — matching GraphNode's existing
   * `portLeft`/`portRight` → `side="in"`/`"out"` convention.
   */
  shape?: "circle" | "socket";
}

function Socket({
  side, state = "default", className, ...rest
}: { side: PortProps["side"]; state: PortProps["state"]; className?: string } & HTMLAttributes<HTMLDivElement>) {
  const s = SOCKET_STYLE[state ?? "default"];
  // sweep-flag: 0 bulges toward -x (left), 1 bulges toward +x (right) — see
  // Port.tsx module comment above for the derivation.
  const sweep = side === "out" ? 1 : 0;
  const d = `M ${SOCKET_C} ${SOCKET_C - SOCKET_R} A ${SOCKET_R} ${SOCKET_R} 0 0 ${sweep} ${SOCKET_C} ${SOCKET_C + SOCKET_R} Z`;
  return (
    <svg
      viewBox={`0 0 ${SOCKET_VB} ${SOCKET_VB}`}
      className={cn("size-port overflow-visible", className)}
      {...(rest as SVGAttributes<SVGSVGElement>)}
    >
      {/* Invisible full-circle hit target: the visual is only a half-disc,
          but the clickable area stays at least the full circle regardless
          — GraphNode additionally wraps row ports in a bigger PortHitZone,
          but Port must be sane to click on its own too. */}
      <circle cx={SOCKET_C} cy={SOCKET_C} r={SOCKET_R} fill="transparent" className="pointer-events-auto" />
      <path d={d} strokeWidth={2} className={cn(s.fill, s.stroke, s.extra, "pointer-events-none")} />
    </svg>
  );
}

const Port = forwardRef<HTMLDivElement, PortProps>(
  ({ className, side, state, label, shape = "circle", ...props }, ref) => (
    <div ref={ref} className={cn("relative flex items-center gap-2", side === "in" ? "flex-row" : "flex-row-reverse")}>
      {shape === "socket" ? (
        <Socket side={side} state={state} className={className} {...props} />
      ) : (
        <div className={cn(portVariants({ side, state }), className)} {...props} />
      )}
      {label && <span className="text-xs text-muted">{label}</span>}
    </div>
  ),
);
Port.displayName = "Port";

export { Port, portVariants };
