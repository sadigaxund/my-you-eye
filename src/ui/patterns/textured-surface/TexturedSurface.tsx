import { forwardRef, useMemo, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/cn";

const SVG_PAPER = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0 0 0 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E";
const SVG_FROSTED = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.005' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0 0 0 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E";
const SVG_METALLIC = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5 0.005' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0 0 0 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23m)'/%3E%3C/svg%3E";

const TEXTURE_PROPS: Record<string, { url: string; size: string }> = {
  paper:    { url: SVG_PAPER,    size: "150px" },
  frosted:  { url: SVG_FROSTED,  size: "200px" },
  metallic: { url: SVG_METALLIC, size: "200px" },
};

const TEXTURE_STRENGTHS: Record<string, Record<string, number>> = {
  paper:    { subtle: 0.35, medium: 0.60, strong: 0.90 },
  frosted:  { subtle: 0.20, medium: 0.35, strong: 0.50 },
  metallic: { subtle: 0.15, medium: 0.30, strong: 0.50 },
};

const texturedSurfaceVariants = cva(
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
  texture?: "paper" | "frosted" | "metallic" | "theme";
  strength?: "subtle" | "medium" | "strong";
}

const TexturedSurface = forwardRef<HTMLDivElement, TexturedSurfaceProps>(
  ({ className, variant, radius, color = "--color-surface", texture = "theme", strength = "medium", style, children, ...props }, ref) => {
    const explicitTexture = useMemo(() => {
      if (texture === "theme") return null;
      const t = TEXTURE_PROPS[texture];
      if (!t) return null;
      return {
        url: t.url,
        size: t.size,
        opacity: (TEXTURE_STRENGTHS[texture] ?? { subtle: 0.35, medium: 0.6, strong: 0.9 })[strength] ?? 0.6,
      };
    }, [texture, strength]);

    if (explicitTexture) {
      return (
        <div
          ref={ref}
          className={cn("relative overflow-hidden border border-border", texturedSurfaceVariants({ variant, radius }), className)}
          style={style}
          {...props}
        >
          <div className="absolute inset-0" style={{ backgroundColor: `var(${color})` }} />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("${explicitTexture.url}")`,
              backgroundSize: explicitTexture.size,
              opacity: explicitTexture.opacity,
            }}
          />
          <div className="relative">{children}</div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("relative isolate overflow-hidden border border-border", texturedSurfaceVariants({ variant, radius }), className)}
        style={{ backgroundColor: `var(${color})`, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TexturedSurface.displayName = "TexturedSurface";

export { TexturedSurface, texturedSurfaceVariants };
