import { useMemo, useRef, useEffect, useState } from "react";
import {
  paperSvg, metallicSvg, tileableMetallicSvg,
  fullFrostedSvg, dataUri,
} from "./svg-utils";

/**
 * Hand-picked preset gallery — intentionally independent of the canonical
 * LAYER_SVGS / TEXTURE_STRENGTHS matrix (svg-utils.ts / TexturedSurface.tsx).
 * Audited for AGENTS.md §7 item 6 (A1 fragility pass): none of the 8 presets
 * below is an exact match for any canonical (layer, strength) combo — each
 * differs from its nearest neighbor in at least one of octaves/stretch/tile,
 * so sourcing any of them from the canonical tables would change the
 * rendered SVG. Left as literals to preserve the owner's tuned look; do not
 * "deduplicate" these against LAYER_SVGS without re-verifying byte-identical
 * output first.
 */

type Mode = "tiled" | "full";

interface PresetDef {
  name: string;
  texture: string;
  svg: string;
  mode: Mode;
  tileSize?: number;
  opacity: number;
  rotated?: number;
}

const TEXTURE_LABELS: Record<string, string> = {
  "paper-grain": "Paper Grain",
  "frosted-glass": "Frosted Glass",
  "brushed-aluminium": "Brushed Aluminium",
};

const PRESETS: PresetDef[] = [
  {
    name: "Fine grain",
    texture: "paper-grain",
    mode: "tiled",
    ...(() => { const s = paperSvg({ freq: 1.2, octaves: 3, stretch: 2.6, tile: 150, opacity: 0 }); return { svg: s, tileSize: 150, opacity: 0.25 }; })(),
  },
  {
    name: "Coarse grain",
    texture: "paper-grain",
    mode: "tiled",
    ...(() => { const s = paperSvg({ freq: 0.3, octaves: 2, stretch: 3.0, tile: 200, opacity: 0 }); return { svg: s, tileSize: 200, opacity: 0.20 }; })(),
  },
  {
    name: "Soft haze",
    texture: "frosted-glass",
    mode: "full",
    ...(() => { const s = fullFrostedSvg({ freq: 0.012, octaves: 2, stretch: 2.5, tile: 300, opacity: 0 }); return { svg: s, opacity: 0.35 }; })(),
  },
  {
    name: "Mist",
    texture: "frosted-glass",
    mode: "full",
    ...(() => { const s = fullFrostedSvg({ freq: 0.008, octaves: 2, stretch: 3.0, tile: 350, opacity: 0 }); return { svg: s, opacity: 0.45 }; })(),
  },
  {
    name: "Brushed aluminum",
    texture: "brushed-aluminium",
    mode: "tiled",
    ...(() => { const s = metallicSvg({ freqX: 0.6, freqY: 0.006, angle: 0, octaves: 4, stretch: 2.6, tile: 200, opacity: 0 }); return { svg: s, tileSize: 200, opacity: 0.22 }; })(),
  },
  {
    name: "Heavy brush",
    texture: "brushed-aluminium",
    mode: "tiled",
    rotated: 45,
    // NOTE(human): `angle` is unused by tileableMetallicSvg (it always generates
    // untilted, 0°-baseline noise for CSS rotation) but MetallicState requires
    // it — added `angle: 0` here to satisfy the type without changing output.
    ...(() => { const s = tileableMetallicSvg({ freqX: 0.3, freqY: 0.003, angle: 0, octaves: 3, stretch: 3.0, tile: 250, opacity: 0 }); return { svg: s, tileSize: 250, opacity: 0.30 }; })(),
  },
  {
    name: "Micro texture",
    texture: "paper-grain",
    mode: "tiled",
    ...(() => { const s = paperSvg({ freq: 2.0, octaves: 4, stretch: 2.0, tile: 100, opacity: 0 }); return { svg: s, tileSize: 100, opacity: 0.15 }; })(),
  },
  {
    name: "Frosted thin",
    texture: "frosted-glass",
    mode: "full",
    ...(() => { const s = fullFrostedSvg({ freq: 0.02, octaves: 2, stretch: 2.0, tile: 200, opacity: 0 }); return { svg: s, opacity: 0.18 }; })(),
  },
];

function PresetCard({ preset }: { preset: PresetDef }) {
  const uri = useMemo(() => dataUri(preset.svg), [preset.svg]);
  const ref = useRef<HTMLDivElement>(null);
  const [sz, setSz] = useState(0);

  useEffect(() => {
    if (!preset.rotated) return;
    const el = ref.current;
    if (!el) return;
    const measure = () => setSz(2 * Math.max(el.offsetWidth, el.offsetHeight));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [preset.rotated]);

  const label = TEXTURE_LABELS[preset.texture] ?? preset.texture;
  const details = preset.mode === "tiled"
    ? `${label} · tile ${preset.tileSize}px · ${Math.round(preset.opacity * 100)}%`
    : `${label} · full · ${Math.round(preset.opacity * 100)}%`;

  const rotated = preset.rotated;
  if (rotated) {
    const half = sz / 2 || 0;
    return (
      <div className="rounded-ui overflow-hidden border border-border">
        <div ref={ref} className="h-28 relative">
          <div className="absolute inset-0 bg-surface" />
          <div
            className="absolute pointer-events-none"
            style={{
              top: "50%", left: "50%",
              width: sz || 1, height: sz || 1,
              marginLeft: -half, marginTop: -half,
              backgroundImage: `url("${uri}")`,
              backgroundSize: `${preset.tileSize}px`,
              backgroundRepeat: "repeat",
              transform: `rotate(${rotated}deg)`,
              transformOrigin: "center",
              opacity: preset.opacity,
              mixBlendMode: "hard-light" as const,
            }}
          />
        </div>
        <div className="p-2 bg-bg border-t border-border">
          <div className="text-xs font-medium text-fg">{preset.name}</div>
          <div className="text-xs text-muted">{details}</div>
        </div>
      </div>
    );
  }

  const bgStyle: React.CSSProperties = preset.mode === "tiled"
    ? { backgroundImage: `url("${uri}")`, backgroundSize: `${preset.tileSize}px`, backgroundRepeat: "repeat" }
    : { backgroundImage: `url("${uri}")`, backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" };

  return (
    <div className="rounded-ui overflow-hidden border border-border">
      <div className="h-28 relative">
        <div className="absolute inset-0 bg-surface" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ ...bgStyle, opacity: preset.opacity, mixBlendMode: "hard-light" }} />
      </div>
      <div className="p-2 bg-bg border-t border-border">
        <div className="text-xs font-medium text-fg">{preset.name}</div>
        <div className="text-xs text-muted">{details}</div>
      </div>
    </div>
  );
}

export function Presets() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {PRESETS.map((p, i) => <PresetCard key={i} preset={p} />)}
    </div>
  );
}
