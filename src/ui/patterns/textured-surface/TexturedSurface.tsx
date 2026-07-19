import { forwardRef, useMemo, type CSSProperties, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/cn";
import { LAYER_SVGS, FROSTED_DITHER, type TextureLayer, type TextureStrength } from "./svg-utils";

const TEXTURE_STRENGTHS: Record<string, Record<string, number>> = {
  "paper-grain":    { subtle: 0.30, medium: 0.50, strong: 0.75 },
  "frosted-glass":  { subtle: 0.22, medium: 0.35, strong: 0.55 },
  "brushed-aluminium": { subtle: 0.15, medium: 0.28, strong: 0.45 },
};

const LAYER_OPACITY: Record<TextureLayer, number> = {
  page: 1.0,
  surface: 0.55,
  foreground: 0.25,
};

interface LayerConf {
  uri: string;
  opacity: number;
  blend: string;
  tileSize?: number;
}

interface TextureConf {
  layers: LayerConf[];
}

const TEXTURE_CONFS: Record<string, (opacity: number, layer: TextureLayer, strength: TextureStrength) => TextureConf | null> = {
  "paper-grain": (op, layer, strength) => {
    const a = LAYER_SVGS["paper-grain"]?.[layer]?.[strength];
    if (!a) return null;
    return {
      layers: [
        { uri: a.primary,   opacity: op,           blend: "hard-light", tileSize: a.tileSize },
        { uri: a.secondary, opacity: op * 0.15,     blend: "hard-light", tileSize: Math.round(a.tileSize * 0.65) },
      ],
    };
  },
  "brushed-aluminium": (op, layer, strength) => {
    const a = LAYER_SVGS["brushed-aluminium"]?.[layer]?.[strength];
    if (!a) return null;
    return {
      layers: [
        { uri: a.primary,   opacity: op,           blend: "hard-light", tileSize: a.tileSize },
        { uri: a.secondary, opacity: op * 0.15,     blend: "hard-light", tileSize: Math.round(a.tileSize * 0.65) },
      ],
    };
  },
  "frosted-glass": (op, layer, strength) => {
    const a = LAYER_SVGS["frosted-glass"]?.[layer]?.[strength];
    if (!a) return null;
    return {
      layers: [
        { uri: a.primary,   opacity: op,     blend: "hard-light" },
        { uri: a.secondary, opacity: op * 0.08, blend: "hard-light", tileSize: Math.round(a.tileSize * 0.65) },
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

export interface TexturedSurfaceProps
  extends VariantProps<typeof texturedSurfaceVariants>,
    Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  color?: string;
  texture?: "paper-grain" | "frosted-glass" | "brushed-aluminium" | "theme";
  strength?: "subtle" | "medium" | "strong";
  layer?: TextureLayer;
  alignToViewport?: boolean;
}

const TexturedSurface = forwardRef<HTMLDivElement, TexturedSurfaceProps>(
  ({ className, variant, radius, color = "--color-surface", texture = "theme", strength = "medium", layer = "page", alignToViewport = false, style, children, ...props }, ref) => {
    const conf = useMemo<TextureConf | null>(() => {
      if (texture === "theme") return null;
      const baseOp = TEXTURE_STRENGTHS[texture]?.[strength] ?? 0.5;
      const layerOp = LAYER_OPACITY[layer];
      return TEXTURE_CONFS[texture]?.(baseOp * layerOp, layer, strength) ?? null;
    }, [texture, strength, layer]);

    const textureType = (typeof document !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue('--texture-type').trim()
      : '') || 'paper-grain';

    const rootStyle = useMemo(() => {
      if (conf) {
        return { "--texture-opacity": "0", "--texture-opacity-surface": "0", ...style } as CSSProperties;
      }
      const lo = LAYER_OPACITY[layer];
      const overrides: Record<string, string> = {};
      const svgs = LAYER_SVGS[textureType]?.[layer]?.[strength];
      if (svgs) {
        overrides["--texture-paper-resolved"] = `url("${svgs.primary}")`;
        overrides["--texture-size-resolved"] = `${svgs.tileSize}px`;
      }
      if (lo !== 1) {
        overrides["--texture-opacity-resolved"] = `calc(var(--texture-opacity-surface) * ${lo})`;
      }
      return { ...overrides, ...style } as CSSProperties;
    }, [conf, layer, style, textureType]);

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
          <div className="absolute inset-0" style={{ backgroundColor: `var(${color})` }} />
          {tileLayers.map((l, i) => (
            <div
              key={i}
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url("${l.uri}")`,
                backgroundSize: `${l.tileSize}px`,
                backgroundRepeat: "repeat",
                opacity: l.opacity,
                mixBlendMode: l.blend as CSSProperties["mixBlendMode"],
                ...(alignToViewport ? { backgroundAttachment: "fixed" as const } : {}),
              }}
            />
          ))}
          {coverLayers.length > 0 && (
            <div className="absolute inset-0" style={{ containerType: "size" }}>
              {coverLayers.map((l, i) => (
                <div
                  key={i}
                  aria-hidden
                  className="absolute pointer-events-none"
                  style={{
                    top: "50%", left: "50%",
                    width: "calc(100cqw + 100cqh)", height: "calc(100cqw + 100cqh)",
                    transform: "translate(-50%, -50%)", transformOrigin: "center",
                    backgroundImage: `url("${l.uri}")`, backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat", opacity: l.opacity,
                    mixBlendMode: l.blend as CSSProperties["mixBlendMode"],
                  }}
                />
              ))}
            </div>
          )}
          <div className="relative">{children}</div>
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
