import { forwardRef, useMemo, type CSSProperties, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/cn";
import {
  paperSvg, fullFrostedSvg, metallicSvg, ditherSvg, dataUri,
} from "./svg-utils";

const TEXTURE_STRENGTHS: Record<string, Record<string, number>> = {
  "paper-grain":    { subtle: 0.30, medium: 0.50, strong: 0.75 },
  "frosted-glass":  { subtle: 0.18, medium: 0.30, strong: 0.48 },
  "brushed-aluminium": { subtle: 0.15, medium: 0.28, strong: 0.45 },
};

/* Pre‑generated SVGs (fixed per material, not per‑instance) */
const PAPER_PRIMARY = dataUri(paperSvg({ freq: 0.85, octaves: 3, stretch: 2.6, tile: 150, opacity: 0 }));
const PAPER_SECONDARY = dataUri(paperSvg({ freq: 0.85, octaves: 3, stretch: 2.6, tile: 97, opacity: 0 }));
const METALLIC_PRIMARY = dataUri(metallicSvg({ freqX: 0.6, freqY: 0.01, angle: 0, octaves: 4, stretch: 2.6, tile: 200, opacity: 0 }));
const METALLIC_SECONDARY = dataUri(metallicSvg({ freqX: 0.6, freqY: 0.01, angle: 0, octaves: 4, stretch: 2.6, tile: 127, opacity: 0 }));
const FROSTED_MAIN = dataUri(fullFrostedSvg({ freq: 0.01, octaves: 2, stretch: 2.2, tile: 300, opacity: 0 }));
const FROSTED_DITHER = dataUri(ditherSvg());

interface LayerConf {
  uri: string;
  opacity: number;
  blend: string;
  tileSize?: number;
}

interface TextureConf {
  mode: "tiled" | "full";
  layers: LayerConf[];
}

const TEXTURE_CONFS: Record<string, (opacity: number) => TextureConf> = {
  "paper-grain": (op) => ({
    mode: "tiled",
    layers: [
      { uri: PAPER_PRIMARY,   opacity: op,               blend: "hard-light", tileSize: 150 },
      { uri: PAPER_SECONDARY, opacity: op * 0.15,         blend: "hard-light", tileSize: 97 },
    ],
  }),
  "brushed-aluminium": (op) => ({
    mode: "tiled",
    layers: [
      { uri: METALLIC_PRIMARY,   opacity: op,               blend: "hard-light", tileSize: 200 },
      { uri: METALLIC_SECONDARY, opacity: op * 0.15,        blend: "hard-light", tileSize: 127 },
    ],
  }),
  "frosted-glass": (op) => ({
    mode: "full",
    layers: [
      { uri: FROSTED_MAIN,   opacity: op,     blend: "hard-light" },
      { uri: FROSTED_DITHER, opacity: 0.03,   blend: "hard-light", tileSize: 64 },
    ],
  }),
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
  texture?: "paper-grain" | "frosted-glass" | "brushed-aluminium" | "theme";
  strength?: "subtle" | "medium" | "strong";
}

const TexturedSurface = forwardRef<HTMLDivElement, TexturedSurfaceProps>(
  ({ className, variant, radius, color = "--color-surface", texture = "theme", strength = "medium", style, children, ...props }, ref) => {
    const conf = useMemo<TextureConf | null>(() => {
      if (texture === "theme") return null;
      const baseOp = TEXTURE_STRENGTHS[texture]?.[strength] ?? 0.5;
      return TEXTURE_CONFS[texture]?.(baseOp) ?? null;
    }, [texture, strength]);

    const rootStyle = conf
      ? { "--texture-opacity": "0", ...style } as CSSProperties
      : style;

    if (conf?.mode === "tiled") {
      return (
        <div
          ref={ref}
          className={cn("relative overflow-hidden border border-border", texturedSurfaceVariants({ variant, radius }), className)}
          style={rootStyle}
          {...props}
        >
          <div className="absolute inset-0" style={{ backgroundColor: `var(${color})` }} />
          {conf.layers.map((l, i) => (
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
              }}
            />
          ))}
          <div className="relative">{children}</div>
        </div>
      );
    }

    if (conf?.mode === "full") {
      const tileLayers = conf.layers.filter(l => l.tileSize);
      const coverLayers = conf.layers.filter(l => !l.tileSize);
      return (
        <div
          ref={ref}
          className={cn("relative overflow-hidden border border-border", texturedSurfaceVariants({ variant, radius }), className)}
          style={rootStyle}
          {...props}
        >
          <div className="absolute inset-0" style={{ backgroundColor: `var(${color})` }} />

          {tileLayers.map((l, i) => (
            <div
              key={`t${i}`}
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url("${l.uri}")`,
                backgroundSize: `${l.tileSize}px`,
                backgroundRepeat: "repeat",
                opacity: l.opacity,
                mixBlendMode: l.blend as CSSProperties["mixBlendMode"],
              }}
            />
          ))}

          {coverLayers.length > 0 && (
            <div className="absolute inset-0" style={{ containerType: "size" }}>
              {coverLayers.map((l, i) => (
                <div
                  key={`c${i}`}
                  aria-hidden
                  className="absolute pointer-events-none"
                  style={{
                    top: "50%",
                    left: "50%",
                    width: "calc(100cqw + 100cqh)",
                    height: "calc(100cqw + 100cqh)",
                    transform: "translate(-50%, -50%)",
                    transformOrigin: "center",
                    backgroundImage: `url("${l.uri}")`,
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                    opacity: l.opacity,
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
