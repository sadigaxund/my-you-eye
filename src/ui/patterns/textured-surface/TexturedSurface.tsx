import { forwardRef, useMemo, type CSSProperties, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/cn";
import { LAYER_SVGS, FROSTED_DITHER, type TextureLayer, type TextureStrength } from "./svg-utils";
import { TextureTileLayer, TextureCoverLayer } from "./TextureLayers";

const TEXTURE_STRENGTHS: Record<string, Record<string, number>> = {
  "paper-grain":    { subtle: 0.30, medium: 0.50, strong: 0.75 },
  "frosted-glass":  { subtle: 0.22, medium: 0.35, strong: 0.55 },
  "brushed-aluminium": { subtle: 0.15, medium: 0.28, strong: 0.45 },
};

const LAYER_OPACITY: Record<TextureLayer, number> = {
  page: 0.55,
  surface: 0.30,
  foreground: 0.25,
};

interface LayerConf {
  uri: string;
  opacity: number;
  blend: string;
  /** CSS `background-size` for a repeating tile layer. Absent => renders as a container-filling cover layer instead (see `coverLayers` below). */
  tileSize?: number;
}

interface TextureConf {
  layers: LayerConf[];
}

const TEXTURE_CONFS: Record<string, (opacity: number, layer: TextureLayer, strength: TextureStrength) => TextureConf | null> = {
  "paper-grain": (op, layer, strength) => {
    const a = LAYER_SVGS["paper-grain"]?.[layer]?.[strength];
    if (!a) return null;
    const secTile = Math.round(a.tileSize * 0.65);
    return {
      layers: [
        { uri: a.primary,   opacity: op,           blend: "hard-light", tileSize: a.tileSize },
        { uri: a.secondary, opacity: op * 0.15,     blend: "hard-light", tileSize: secTile },
      ],
    };
  },
  "brushed-aluminium": (op, layer, strength) => {
    const a = LAYER_SVGS["brushed-aluminium"]?.[layer]?.[strength];
    if (!a) return null;
    const secTile = Math.round(a.tileSize * 0.65);
    return {
      layers: [
        { uri: a.primary,   opacity: op,           blend: "hard-light", tileSize: a.tileSize },
        { uri: a.secondary, opacity: op * 0.15,     blend: "hard-light", tileSize: secTile },
      ],
    };
  },
  "frosted-glass": (op, layer, strength) => {
    const a = LAYER_SVGS["frosted-glass"]?.[layer]?.[strength];
    if (!a) return null;
    const secTile = Math.round(a.tileSize * 0.65);
    return {
      layers: [
        { uri: a.primary,   opacity: op,     blend: "hard-light" },
        { uri: a.secondary, opacity: op * 0.08, blend: "hard-light", tileSize: secTile },
        { uri: FROSTED_DITHER, opacity: 0.03, blend: "hard-light", tileSize: 64 },
      ],
    };
  },
};

const texturedSurfaceVariants = cva(
  "after:content-[''] after:absolute after:inset-0 after:-z-10 after:pointer-events-none " +
    "after:[background-image:var(--texture-paper-resolved,var(--texture-paper))] " +
    "after:[background-size:var(--texture-size-resolved,var(--texture-size))] " +
    "after:opacity-[var(--texture-opacity-resolved,var(--texture-opacity-surface))] " +
    "after:[mix-blend-mode:var(--texture-blend)]",
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

/** The material a surface renders. Named so callers holding it in state can
 * type that state properly — a bare `useState("theme")` infers `string` and
 * silently stops being checked against this union at every call site. */
export type TextureName = "paper-grain" | "frosted-glass" | "brushed-aluminium" | "theme";

export interface TexturedSurfaceProps
  extends VariantProps<typeof texturedSurfaceVariants>,
    Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  color?: string;
  texture?: TextureName;
  strength?: "subtle" | "medium" | "strong";
  layer?: TextureLayer;
}

const TexturedSurface = forwardRef<HTMLDivElement, TexturedSurfaceProps>(
  ({ className, variant, radius, color = "--color-surface", texture = "theme", strength = "medium", layer = "page", style, children, ...props }, ref) => {
    const conf = useMemo<TextureConf | null>(() => {
      if (texture === "theme") return null;
      const baseOp = TEXTURE_STRENGTHS[texture]?.[strength] ?? 0.5;
      const layerOp = LAYER_OPACITY[layer];
      return TEXTURE_CONFS[texture]?.(baseOp * layerOp, layer, strength) ?? null;
    }, [texture, strength, layer]);

    // Only read the theme's noise family when we're actually going to use it
    // — `conf` truthy means an explicit material was requested and this
    // value is never consulted, so skip the forced synchronous style read
    // entirely in that branch (was previously unconditional every render).
    const textureType = (!conf && typeof document !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue('--texture-type').trim()
      : '') || 'paper-grain';

    const themeSvgs = conf ? undefined : LAYER_SVGS[textureType]?.[layer]?.[strength];

    const rootStyle = useMemo(() => {
      if (conf) {
        return { "--texture-opacity": "0", "--texture-opacity-surface": "0", ...style } as CSSProperties;
      }
      const lo = LAYER_OPACITY[layer];
      const overrides: Record<string, string> = {};
      if (themeSvgs) {
        overrides["--texture-paper-resolved"] = `url("${themeSvgs.primary}")`;
        overrides["--texture-size-resolved"] = `${themeSvgs.tileSize}px`;
      }
      if (lo !== 1) {
        overrides["--texture-opacity-resolved"] = `calc(var(--texture-opacity-surface) * ${lo})`;
      }
      return { ...overrides, ...style } as CSSProperties;
    }, [conf, layer, style, themeSvgs]);

    if (conf) {
      const tileLayers = conf.layers.filter(l => l.tileSize);
      const coverLayers = conf.layers.filter(l => !l.tileSize);
      return (
        <div
          ref={ref}
          className={cn("relative isolate overflow-hidden border border-border", texturedSurfaceVariants({ variant, radius }), className)}
          style={rootStyle}
          {...props}
        >
          <div className="absolute inset-0 pointer-events-none -z-10" style={{ backgroundColor: `var(${color})` }} />
          {tileLayers.map((l, i) => (
            <TextureTileLayer
              key={i}
              uri={l.uri}
              tileSize={l.tileSize as number}
              opacity={l.opacity}
              blend={l.blend as CSSProperties["mixBlendMode"]}
            />
          ))}
          {coverLayers.length > 0 && (
            <div className="absolute inset-0 pointer-events-none -z-10" style={{ containerType: "size" }}>
              {coverLayers.map((l, i) => (
                <TextureCoverLayer
                  key={i}
                  uri={l.uri}
                  opacity={l.opacity}
                  blend={l.blend as CSSProperties["mixBlendMode"]}
                />
              ))}
            </div>
          )}
          {children}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("relative isolate overflow-hidden border border-border", texturedSurfaceVariants({ variant, radius }), className)}
        style={{ backgroundColor: `var(${color})`, ...rootStyle }}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TexturedSurface.displayName = "TexturedSurface";

export { TexturedSurface, texturedSurfaceVariants };
