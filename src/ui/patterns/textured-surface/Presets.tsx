import { useMemo } from "react";
import { paperSvg, metallicSvg, frostedBlurSvg, dataUri } from "./svg-utils";

interface PresetDef {
  name: string;
  texture: string;
  svg: string;
  tile: number;
  opacity: number;
}

const PRESETS: PresetDef[] = [
  {
    name: "Fine grain",
    texture: "paper",
    ...(() => { const s = paperSvg({ freq: 1.2, octaves: 3, stretch: 2.6, tile: 150, opacity: 0.25 }); return { svg: s, tile: 150, opacity: 0.25 }; })(),
  },
  {
    name: "Coarse grain",
    texture: "paper",
    ...(() => { const s = paperSvg({ freq: 0.3, octaves: 2, stretch: 3.0, tile: 200, opacity: 0.20 }); return { svg: s, tile: 200, opacity: 0.20 }; })(),
  },
  {
    name: "Soft haze (blur 8)",
    texture: "frosted",
    ...(() => { const s = frostedBlurSvg({ freq: 0.012, octaves: 2, blur: 8, stretch: 2.5, tile: 300, opacity: 0.35 }); return { svg: s, tile: 300, opacity: 0.35 }; })(),
  },
  {
    name: "Mist (blur 14)",
    texture: "frosted",
    ...(() => { const s = frostedBlurSvg({ freq: 0.008, octaves: 2, blur: 14, stretch: 3.0, tile: 350, opacity: 0.45 }); return { svg: s, tile: 350, opacity: 0.45 }; })(),
  },
  {
    name: "Brushed aluminum",
    texture: "metallic",
    ...(() => { const s = metallicSvg({ freqX: 0.6, freqY: 0.006, angle: 0, octaves: 4, stretch: 2.6, tile: 200, opacity: 0.22 }); return { svg: s, tile: 200, opacity: 0.22 }; })(),
  },
  {
    name: "Heavy brush",
    texture: "metallic",
    ...(() => { const s = metallicSvg({ freqX: 0.3, freqY: 0.003, angle: 45, octaves: 3, stretch: 3.0, tile: 250, opacity: 0.30 }); return { svg: s, tile: 250, opacity: 0.30 }; })(),
  },
  {
    name: "Micro texture",
    texture: "paper",
    ...(() => { const s = paperSvg({ freq: 2.0, octaves: 4, stretch: 2.0, tile: 100, opacity: 0.15 }); return { svg: s, tile: 100, opacity: 0.15 }; })(),
  },
  {
    name: "Frosted thin",
    texture: "frosted",
    ...(() => { const s = frostedBlurSvg({ freq: 0.02, octaves: 2, blur: 3, stretch: 2.0, tile: 200, opacity: 0.18 }); return { svg: s, tile: 200, opacity: 0.18 }; })(),
  },
];

function PresetCard({ preset }: { preset: PresetDef }) {
  const uri = useMemo(() => dataUri(preset.svg), [preset.svg]);
  return (
    <div className="rounded-ui overflow-hidden border border-border">
      <div className="h-28 relative">
        <div className="absolute inset-0" style={{ background: "var(--color-surface)" }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `url("${uri}")`, backgroundSize: `${preset.tile}px`, opacity: preset.opacity, mixBlendMode: "hard-light" }} />
      </div>
      <div className="p-2 bg-bg border-t border-border">
        <div className="text-xs font-medium text-fg">{preset.name}</div>
        <div className="text-xs text-muted">{preset.texture} · tile {preset.tile}px · {Math.round(preset.opacity * 100)}%</div>
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
