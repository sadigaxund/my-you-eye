import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/cn";

// The texture is an OVERLAY LAYER, not a color: a `::after` carrying the
// shared noise SVG, `pointer-events-none`, opacity/blend driven entirely by
// theme tokens (`--texture-opacity`, `--texture-blend`, both defined in
// tokens.css and required-per-theme by check-themes.mjs). Every theme
// defaults `--texture-opacity` to 0, so this component is a visual no-op
// everywhere except a theme that opts in (currently only `comic`) — see
// AGENTS.md §7. It rasterizes once as a background-image; it is never
// applied to a transforming element (Canvas overrides `--texture-opacity`
// to 0 on its transforming layer as a second line of defense).
const texturedSurfaceVariants = cva(
  "relative isolate overflow-hidden border border-border " +
    "after:content-[''] after:absolute after:inset-0 after:-z-10 after:pointer-events-none " +
    "after:[background-image:var(--texture-paper)] after:[background-size:var(--texture-size)] " +
    "after:opacity-[var(--texture-opacity)] after:[mix-blend-mode:var(--texture-blend)]",
  {
    variants: {
      variant: {
        surface: "",
        elevated: "shadow-elevated",
      },
      radius: {
        default: "rounded-ui",
        sm: "rounded-ui-sm",
        lg: "rounded-ui-lg",
        none: "",
      },
    },
    defaultVariants: {
      variant: "surface",
      radius: "default",
    },
  },
);

export interface TexturedSurfaceProps
  extends VariantProps<typeof texturedSurfaceVariants>,
    Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  color?: string;
}

const TexturedSurface = forwardRef<HTMLDivElement, TexturedSurfaceProps>(
  ({ className, variant, radius, color = "--color-surface", style, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(texturedSurfaceVariants({ variant, radius }), className)}
      style={{ backgroundColor: `var(${color})`, ...style }}
      {...props}
    >
      {children}
    </div>
  ),
);
TexturedSurface.displayName = "TexturedSurface";

export { TexturedSurface, texturedSurfaceVariants };
