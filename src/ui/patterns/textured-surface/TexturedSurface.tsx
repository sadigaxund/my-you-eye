import { forwardRef, useMemo, type CSSProperties, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/cn";
import { LAYER_SVGS, FROSTED_DITHER, isTextureKey, type TextureLayer, type TextureStrength, type TextureKey } from "./svg-utils";

const TEXTURE_STRENGTHS: Record<TextureKey, Record<TextureStrength, number>> = {
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
  tileSize?: number;
}

interface TextureConf {
  layers: LayerConf[];
}

const TEXTURE_CONFS: Record<TextureKey, (opacity: number, layer: TextureLayer, strength: TextureStrength) => TextureConf | null> = {
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
    // Multiplied by --texture-suppress (1 = normal, 0 = suppressed). Only the
    // inline-texture path (below) sets this to "0", and only on itself — it is
    // never confused with a real theme opacity value. See AGENTS.md §7
    // "no self-reference cycles" / nesting note.
    "after:opacity-[calc(var(--texture-opacity-resolved,var(--texture-opacity-surface))*var(--texture-suppress,1))] " +
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
  texture?: TextureKey | "theme";
  strength?: TextureStrength;
  layer?: TextureLayer;
  alignToViewport?: boolean;
}

const TexturedSurface = forwardRef<HTMLDivElement, TexturedSurfaceProps>(
  ({ className, variant, radius, color = "--color-surface", texture = "theme", strength = "medium", layer = "page", alignToViewport = false, style, children, ...props }, ref) => {
    const conf = useMemo<TextureConf | null>(() => {
      if (texture === "theme") return null;
      const strengths = TEXTURE_STRENGTHS[texture];
      const confFactory = TEXTURE_CONFS[texture];
      if (import.meta.env?.DEV && (!strengths || !confFactory)) {
        console.warn(
          `TexturedSurface: no configuration found for texture="${texture}". ` +
            `Falling back to the theme-driven texture instead of silently rendering it.`,
        );
      }
      const baseOp = strengths?.[strength] ?? 0.5;
      const layerOp = LAYER_OPACITY[layer] ?? 0;
      return confFactory?.(baseOp * layerOp, layer, strength) ?? null;
    }, [texture, strength, layer]);

    const rawTextureType = (typeof document !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue('--texture-type').trim()
      : '') || 'paper-grain';
    const textureType: TextureKey = isTextureKey(rawTextureType) ? rawTextureType : 'paper-grain';

    const rootStyle = useMemo(() => {
      if (conf) {
        // Suppress this element's own theme-driven ::after (see the CVA
        // above) via a dedicated flag rather than zeroing the real
        // --texture-opacity-surface token. The old approach inherited
        // through descendants and silently zeroed a nested texture="theme"
        // child's opacity too. --texture-suppress is reset to "1" by every
        // theme-path render below, so an inline ancestor's "0" can never
        // poison a nested theme surface.
        return { "--texture-opacity": "0", "--texture-suppress": "0", ...style } as CSSProperties;
      }
      const lo = LAYER_OPACITY[layer] ?? 0;
      const overrides: Record<string, string> = {
        // Always reassert: undoes any --texture-suppress inherited from an
        // ancestor inline-texture TexturedSurface. Canvas's structural
        // suppression (AGENTS.md §0.12 / §7) works instead by zeroing the
        // real --texture-opacity-surface token, which this never touches.
        "--texture-suppress": "1",
      };
      const svgs = LAYER_SVGS[textureType]?.[layer]?.[strength];
      if (svgs) {
        overrides["--texture-paper-resolved"] = `url("${svgs.primary}")`;
        overrides["--texture-size-resolved"] = `${svgs.tileSize}px`;
      }
      if (lo !== 1) {
        overrides["--texture-opacity-resolved"] = `calc(var(--texture-opacity-surface) * ${lo})`;
      }
      return { ...overrides, ...style } as CSSProperties;
    }, [conf, layer, strength, style, textureType]);

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
            <div
              key={i}
              aria-hidden
              className="absolute inset-0 pointer-events-none -z-10"
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
            <div className="absolute inset-0 pointer-events-none -z-10" style={{ containerType: "size" }}>
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
